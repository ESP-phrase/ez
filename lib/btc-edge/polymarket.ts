// Fetches Polymarket window data from the Gamma API.
// priceToBeat: Gamma API primary, Chainlink round-walk fallback until Gamma sets it.
// odds: scraped from the event page __NEXT_DATA__ (cached per window).

import { fetchChainlinkPriceAt } from "@/lib/btc-edge/chainlink";

type WindowOdds = { upPrice: number; downPrice: number };
type WindowPrice = { priceToBeat: number };

const oddsCache: Record<number, WindowOdds> = {};
const priceCache: Record<number, WindowPrice> = {};

function pruneCache(cache: Record<number, unknown>, windowStart: number) {
  const cutoff = windowStart - 900;
  for (const k of Object.keys(cache)) {
    if (Number(k) < cutoff) delete cache[Number(k)];
  }
}

async function fetchGammaEvent(windowStart: number): Promise<{ priceToBeat: number | null }> {
  try {
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?slug=btc-updown-5m-${windowStart}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { priceToBeat: null };
    const raw = (await res.json()) as Array<{ eventMetadata?: { priceToBeat?: number | null } }> | { eventMetadata?: { priceToBeat?: number | null } };
    const ev = Array.isArray(raw) ? raw[0] : raw;
    const ptb = ev?.eventMetadata?.priceToBeat;
    return { priceToBeat: ptb != null && isFinite(Number(ptb)) && Number(ptb) > 0 ? Number(ptb) : null };
  } catch {
    return { priceToBeat: null };
  }
}

// Primary: Gamma API (exact Polymarket value, set ~5–15s after window open).
// Fallback: Chainlink round-walk (immediate, not cached so Gamma keeps retrying).
// Once Gamma API succeeds the value is cached for the window.
export async function fetchWindowPriceToBeat(windowStart: number): Promise<number | null> {
  if (priceCache[windowStart]) return priceCache[windowStart].priceToBeat;

  const { priceToBeat } = await fetchGammaEvent(windowStart);
  if (priceToBeat !== null) {
    priceCache[windowStart] = { priceToBeat };
    pruneCache(priceCache, windowStart);
    return priceToBeat;
  }

  // Gamma API hasn't set it yet — use Chainlink as live estimate (not cached)
  return fetchChainlinkPriceAt(windowStart);
}

// Fetches UP/DOWN odds from the Polymarket event page (cached per window).
export async function fetchWindowOdds(windowStart: number): Promise<WindowOdds | null> {
  if (oddsCache[windowStart]) return oddsCache[windowStart];

  const slug = `btc-updown-5m-${windowStart}`;
  try {
    const res = await fetch(`https://polymarket.com/event/${slug}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();

    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;

    const nextData = JSON.parse(m[1]) as {
      props?: { pageProps?: { dehydratedState?: { queries?: Array<{ state?: { data?: unknown } }> } } };
    };

    const queries = nextData?.props?.pageProps?.dehydratedState?.queries ?? [];

    for (const q of queries) {
      const data = q?.state?.data as Record<string, unknown> | undefined;
      if (!data || typeof data !== "object" || Array.isArray(data)) continue;

      const markets = data.markets as Array<Record<string, unknown>> | undefined;
      if (!markets?.[0]?.outcomePrices) continue;

      const outcomes = JSON.parse(markets[0].outcomes as string) as string[];
      const prices = (JSON.parse(markets[0].outcomePrices as string) as string[]).map(Number);
      const upIdx = outcomes.findIndex((o) => o.toLowerCase() === "up");
      const downIdx = outcomes.findIndex((o) => o.toLowerCase() === "down");
      const upPrice = upIdx >= 0 ? (prices[upIdx] ?? 0.5) : (prices[0] ?? 0.5);
      const downPrice = downIdx >= 0 ? (prices[downIdx] ?? 0.5) : (prices[1] ?? 0.5);

      const result = { upPrice, downPrice };
      oddsCache[windowStart] = result;
      pruneCache(oddsCache, windowStart);
      return result;
    }
  } catch { /* fall through */ }

  return null;
}
