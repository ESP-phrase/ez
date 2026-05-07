import { db } from "@/lib/db";

export interface MarketFeedItem {
  platform: string;
  externalMarketId: string;
  title: string;
  outcomeA: string;
  outcomeB: string;
  outcomeAOdds: number;
  outcomeBOdds: number;
}

function clampOdds(v: number) {
  return Math.max(0.01, Math.min(0.99, Number(v.toFixed(4))));
}

async function fetchPolymarketFeed(limit = 20): Promise<MarketFeedItem[]> {
  const res = await fetch(
    `https://gamma-api.polymarket.com/markets?closed=false&active=true&limit=${limit}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Polymarket feed failed with ${res.status}`);
  }

  const markets = (await res.json()) as Array<Record<string, unknown>>;

  return markets
    .map((m) => {
      const id = String(m.id ?? "");
      const question = String(m.question ?? "Untitled market");
      const outcomesRaw = typeof m.outcomes === "string" ? m.outcomes : "[]";
      const outcomePricesRaw = typeof m.outcomePrices === "string" ? m.outcomePrices : "[]";

      let outcomes: string[] = [];
      let prices: number[] = [];
      try {
        outcomes = JSON.parse(outcomesRaw);
        prices = JSON.parse(outcomePricesRaw).map((x: unknown) => Number(x));
      } catch {
        outcomes = ["Yes", "No"];
        prices = [0.5, 0.5];
      }

      const a = outcomes[0] ?? "Yes";
      const b = outcomes[1] ?? "No";
      const aPrice = clampOdds(prices[0] ?? 0.5);
      const bPrice = clampOdds(prices[1] ?? 1 - aPrice);

      return {
        platform: "Polymarket",
        externalMarketId: id,
        title: question,
        outcomeA: a,
        outcomeB: b,
        outcomeAOdds: aPrice,
        outcomeBOdds: bPrice,
      } satisfies MarketFeedItem;
    })
    .filter((x) => x.externalMarketId.length > 0);
}

function generateFallbackMarkets(): MarketFeedItem[] {
  const seed = [
    { id: "fed_june", title: "Will the Fed cut rates in June 2026?" },
    { id: "btc_may", title: "Will BTC close above $110k by end of May?" },
    { id: "election_turnout", title: "Will voter turnout exceed 63%?" },
  ];
  return seed.map((m, i) => {
    const swing = Math.sin(Date.now() / 120000 + i) * 0.06;
    const a = clampOdds(0.5 + swing);
    return {
      platform: "Synthetic",
      externalMarketId: m.id,
      title: m.title,
      outcomeA: "Yes",
      outcomeB: "No",
      outcomeAOdds: a,
      outcomeBOdds: clampOdds(1 - a),
    };
  });
}

export async function fetchLiveMarkets(limit = 20): Promise<MarketFeedItem[]> {
  try {
    return await fetchPolymarketFeed(limit);
  } catch {
    return generateFallbackMarkets();
  }
}

export async function persistMarketSnapshots(markets: MarketFeedItem[]) {
  const results = [];
  for (const m of markets) {
    const market = await db.market.upsert({
      where: {
        platform_externalMarketId: {
          platform: m.platform,
          externalMarketId: m.externalMarketId,
        },
      },
      update: {
        title: m.title,
        outcomeA: m.outcomeA,
        outcomeB: m.outcomeB,
      },
      create: {
        platform: m.platform,
        externalMarketId: m.externalMarketId,
        title: m.title,
        outcomeA: m.outcomeA,
        outcomeB: m.outcomeB,
      },
    });

    const snapshot = await db.marketSnapshot.create({
      data: {
        marketId: market.id,
        outcomeAOdds: m.outcomeAOdds,
        outcomeBOdds: m.outcomeBOdds,
      },
    });

    results.push({ market, snapshot });
  }
  return results;
}

export async function getLatestSnapshotByMarketId(marketId: string) {
  return db.marketSnapshot.findFirst({
    where: { marketId },
    orderBy: { fetchedAt: "desc" },
  });
}
