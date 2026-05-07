import OpenAI from "openai";
import { z } from "zod";

const analyzerResultSchema = z.object({
  marketQuestion: z.string().min(5),
  platform: z.string().min(2),
  recommendation: z.enum(["YES", "NO", "SKIP"]),
  confidence: z.number().int().min(1).max(99),
  yesOddsPct: z.number().min(0).max(100),
  noOddsPct: z.number().min(0).max(100),
  marketEndDate: z.string().min(4),
  secondaryDate: z.string().optional(),
  analyzedDates: z.array(z.string().min(4)).max(2).default([]),
  edge: z.string().min(2),
  riskSummary: z.string().min(10),
  exitPlan: z.string().min(10),
  newsCatalysts: z.array(z.string().min(8)).max(5).default([]),
});

export type AnalyzerResult = z.infer<typeof analyzerResultSchema>;

const marketContextSchema = z.object({
  marketQuestion: z.string().min(5),
  platform: z.string().min(2),
  searchQuery: z.string().min(3),
  entities: z.array(z.string().min(2)).max(8).default([]),
});

type MarketContext = z.infer<typeof marketContextSchema>;

function toDataUrl(mime: string, data: Buffer) {
  return `data:${mime};base64,${data.toString("base64")}`;
}

function extractJsonFromText(input: string): unknown {
  const trimmed = input.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model output did not contain JSON.");
    }
    return JSON.parse(match[0]);
  }
}

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function isHeadlineRelevant(headline: string, context: MarketContext) {
  const headlineTokens = new Set(tokenize(headline));
  const queryTokens = tokenize(`${context.marketQuestion} ${context.searchQuery}`);
  const entityTokens = context.entities.flatMap((entity) => tokenize(entity));

  const queryHits = queryTokens.filter((token) => headlineTokens.has(token)).length;
  const entityHits = entityTokens.filter((token) => headlineTokens.has(token)).length;

  return queryHits >= 2 || entityHits >= 1;
}

async function fetchRecentNewsContext(context: MarketContext): Promise<string[]> {
  const searchQuery = encodeURIComponent(context.searchQuery || context.marketQuestion);
  const rssUrl = `https://news.google.com/rss/search?q=${searchQuery}+when:7d&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
    const xml = await response.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);

    const headlines = itemMatches
      .map((match) => {
        const item = match[1];
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
        const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
        if (!title) return "";
        return `${cleanText(title)} (${cleanText(pubDate)})`;
      })
      .filter(Boolean);

    return headlines.filter((headline) => isHeadlineRelevant(headline, context)).slice(0, 5);
  } catch {
    return [];
  }
}

async function extractMarketContext(params: {
  client: OpenAI;
  imageBuffer: Buffer;
  mimeType: string;
}): Promise<MarketContext> {
  const response = await params.client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "Extract prediction market context from a screenshot. Return JSON only with schema: " +
          "{ marketQuestion, platform, searchQuery, entities[] }. " +
          "searchQuery must target likely breaking-news terms for this exact market.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract market context for targeted news lookup." },
          {
            type: "image_url",
            image_url: { url: toDataUrl(params.mimeType, params.imageBuffer) },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned while extracting market context.");
  }

  const parsed = marketContextSchema.safeParse(extractJsonFromText(content));
  if (!parsed.success) {
    throw new Error(`Invalid market context output: ${parsed.error.message}`);
  }

  return parsed.data;
}

export async function analyzeMarketScreenshot(params: {
  imageBuffer: Buffer;
  mimeType: string;
  originalFileName?: string;
}): Promise<AnalyzerResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const marketContext = await extractMarketContext({
    client,
    imageBuffer: params.imageBuffer,
    mimeType: params.mimeType,
  });
  const recentNews = await fetchRecentNewsContext(marketContext);
  const newsContext =
    recentNews.length > 0
      ? recentNews.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : "No highly relevant recent headlines found; keep confidence conservative.";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You analyze prediction market screenshots. Reply with JSON only and no markdown. " +
          "Schema: { marketQuestion, platform, recommendation(YES|NO|SKIP), confidence(1-99), yesOddsPct(0-100), noOddsPct(0-100), marketEndDate, secondaryDate?, analyzedDates(string[] max 2), edge, riskSummary, exitPlan, newsCatalysts(string[]) }. " +
          "You must read visible YES/NO odds and all visible market dates from the screenshot (up to 2 most relevant dates). " +
          "If one side is missing, infer the opposite as 100 - known side.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Analyze this screenshot and blend in the recent headlines context below. " +
              "Use concise, actionable outputs. If unclear, choose SKIP with lower confidence. " +
              "Your reasoning must account for time-to-expiry using marketEndDate and secondaryDate (if present), and whether displayed odds appear mispriced.\n\n" +
              `Market context:\nQuestion: ${marketContext.marketQuestion}\nPlatform: ${marketContext.platform}\n\n` +
              `Recent headlines:\n${newsContext}`,
          },
          {
            type: "image_url",
            image_url: {
              url: toDataUrl(params.mimeType, params.imageBuffer),
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI.");
  }

  const parsed = analyzerResultSchema.safeParse(extractJsonFromText(content));
  if (!parsed.success) {
    throw new Error(`Invalid OpenAI analyzer output: ${parsed.error.message}`);
  }

  const oddsTotal = parsed.data.yesOddsPct + parsed.data.noOddsPct;
  if (Math.abs(oddsTotal - 100) > 8) {
    throw new Error("Analyzer returned invalid YES/NO odds split.");
  }

  const uniqueDates = [
    parsed.data.marketEndDate,
    parsed.data.secondaryDate,
    ...parsed.data.analyzedDates,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .slice(0, 2);

  parsed.data.analyzedDates = uniqueDates;
  parsed.data.secondaryDate = uniqueDates[1];
  parsed.data.marketEndDate = uniqueDates[0] ?? parsed.data.marketEndDate;

  return parsed.data;
}
