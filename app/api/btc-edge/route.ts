import { NextResponse } from "next/server";
import { ema, rsi, macd, bollingerBands } from "@/lib/btc-edge/indicators";
import { fetchChainlinkPrice } from "@/lib/btc-edge/chainlink";
import { fetchWindowOdds, fetchWindowPriceToBeat } from "@/lib/btc-edge/polymarket";
import type { Candle, IndicatorValues, SignalResult, WindowMarket } from "@/lib/btc-edge/types";
export type { Candle, IndicatorValues, SignalResult, WindowMarket };

type BinanceKline = [
  number, string, string, string, string, string, number, ...unknown[]
];

type GammaEvent = {
  slug?: string;
  title?: string;
  startTime?: string;
  endDate?: string;
  active?: boolean;
  closed?: boolean;
  eventMetadata?: { priceToBeat?: number | null; finalPrice?: number | null };
};

async function fetchBtcCandles(): Promise<Candle[]> {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=100",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Binance API error ${res.status}`);
  const raw = (await res.json()) as BinanceKline[];
  return raw.map((k) => ({
    time: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
    green: Number(k[4]) >= Number(k[1]),
  }));
}

async function fetchGammaEvent(slug: string): Promise<GammaEvent | null> {
  try {
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?slug=${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as GammaEvent | GammaEvent[];
    const event = Array.isArray(raw) ? raw[0] : raw;
    return event?.title ? event : null;
  } catch {
    return null;
  }
}

async function fetchCurrentWindow(): Promise<WindowMarket | null> {
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSec / 300) * 300;

  // Odds come from the Polymarket page (cached per window)
  const [odds, event] = await Promise.all([
    fetchWindowOdds(windowStart),
    fetchGammaEvent(`btc-updown-5m-${windowStart}`),
  ]);

  // Use current event for title/metadata; fall back to prev window for title if not live yet
  const title = event?.title ?? `BTC Up or Down - ${new Date(windowStart * 1000).toISOString()}`;
  const windowEnd = new Date((windowStart + 300) * 1000).toISOString();
  const secondsRemaining = Math.max(0, windowStart + 300 - nowSec);

  return {
    slug: `btc-updown-5m-${windowStart}`,
    title,
    windowStart: new Date(windowStart * 1000).toISOString(),
    windowEnd,
    priceToBeat: null, // filled in by Chainlink below
    upPrice: odds?.upPrice ?? 0.5,
    downPrice: odds?.downPrice ?? 0.5,
    secondsRemaining,
  };
}

function computeSignal(candles: Candle[]): SignalResult {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const last = candles[candles.length - 1];
  const anchor = candles[candles.length - 4];
  const pctChange15m = anchor
    ? Number(((last.close - anchor.close) / anchor.close * 100).toFixed(3))
    : 0;

  const rsiVals = rsi(closes, 14);
  const rsi14 = rsiVals[rsiVals.length - 1] ?? null;
  const rsiUp = rsi14 !== null && rsi14 < 55;
  const rsiDown = rsi14 !== null && rsi14 > 45;
  const bbSignalVal: IndicatorValues["bbSignal"] =
    rsi14 !== null && rsi14 < 35 ? "OVERSOLD" :
    rsi14 !== null && rsi14 > 65 ? "OVERBOUGHT" : "NEUTRAL";

  const ema9Vals = ema(closes, 9);
  const ema21Vals = ema(closes, 21);
  const ema9 = ema9Vals[ema9Vals.length - 1] ?? null;
  const ema21 = ema21Vals[ema21Vals.length - 1] ?? null;
  const emaCross: IndicatorValues["emaCross"] =
    ema9 !== null && ema21 !== null
      ? ema9 > ema21 ? "BULL" : "BEAR"
      : null;
  const emaUp = emaCross === "BULL";

  const { histogram: macdHists, macdLine, signalLine } = macd(closes, 12, 26, 9);
  const macdHist = macdHists[macdHists.length - 1] ?? null;
  const prevHist = macdHists[macdHists.length - 2] ?? null;
  const macdSignalVal: IndicatorValues["macdSignal"] =
    macdHist !== null ? (macdHist > 0 ? "BULL" : "BEAR") : null;
  const macdMomentum = macdHist !== null && prevHist !== null
    ? Math.sign(macdHist) === Math.sign(prevHist) && Math.abs(macdHist) > Math.abs(prevHist)
    : false;
  const macdUp = macdSignalVal === "BULL";
  void macdLine; void signalLine;

  const bb = bollingerBands(closes, 20, 2);
  const bbUpper = bb.upper[bb.upper.length - 1];
  const bbLower = bb.lower[bb.lower.length - 1];
  void bb.middle;
  const bbPercent =
    bbUpper !== null && bbLower !== null && !isNaN(bbUpper) && !isNaN(bbLower) && bbUpper !== bbLower
      ? (last.close - bbLower) / (bbUpper - bbLower)
      : null;
  const bbUp = bbPercent !== null && bbPercent < 0.5;

  const recentVols = volumes.slice(-10);
  const avgVol = recentVols.slice(0, -1).reduce((a, b) => a + b, 0) / (recentVols.length - 1);
  const lastVol = volumes[volumes.length - 1];
  const volRatio = avgVol > 0 ? lastVol / avgVol : null;
  const volSignal: IndicatorValues["volSignal"] =
    volRatio !== null && volRatio > 1.5 ? "HIGH" :
    volRatio !== null && volRatio < 0.6 ? "LOW" : "NORMAL";
  const volConfirms = volSignal === "HIGH" ? last.green : null;

  const recent3 = candles.slice(-3);
  const greenCount = recent3.filter((c) => c.green).length;
  const candlesUp = greenCount >= 2;

  const upVotes = [rsiUp, emaUp, macdUp, bbUp, candlesUp, volConfirms === true].filter(Boolean).length;
  const downVotes = [!rsiDown, !emaUp, !macdUp, !bbUp, !candlesUp, volConfirms === false].filter(Boolean).length;

  let direction: "UP" | "DOWN" | "FLAT";
  if (upVotes > downVotes) direction = "UP";
  else if (downVotes > upVotes) direction = "DOWN";
  else direction = "FLAT";

  const spread = Math.abs(upVotes - downVotes);
  const baseConf = 45 + spread * 8;
  const momentumBoost = macdMomentum ? 5 : 0;
  const magBoost = Math.min(Math.abs(pctChange15m) * 6, 8);
  const confidence = Math.round(Math.min(88, baseConf + momentumBoost + magBoost));

  const reasons: string[] = [];
  if (emaCross) reasons.push(`EMA 9/21 ${emaCross === "BULL" ? "bullish cross" : "bearish cross"}`);
  if (rsi14 !== null) reasons.push(`RSI ${rsi14.toFixed(0)}${rsi14 < 35 ? " (oversold)" : rsi14 > 65 ? " (overbought)" : ""}`);
  if (macdSignalVal) reasons.push(`MACD ${macdSignalVal === "BULL" ? "bullish" : "bearish"}${macdMomentum ? " + gaining" : ""}`);
  if (bbPercent !== null) reasons.push(`BB ${(bbPercent * 100).toFixed(0)}% (${bbPercent < 0.3 ? "near lower" : bbPercent > 0.7 ? "near upper" : "mid"})`);
  reasons.push(`${greenCount}/3 candles green`);

  return {
    direction,
    confidence,
    pctChange15m,
    reason: reasons.join(" · "),
    indicators: {
      rsi14: rsi14 !== null && !isNaN(rsi14) ? Number(rsi14.toFixed(2)) : null,
      ema9: ema9 !== null && !isNaN(ema9) ? Number(ema9.toFixed(2)) : null,
      ema21: ema21 !== null && !isNaN(ema21) ? Number(ema21.toFixed(2)) : null,
      emaCross,
      macdHist: macdHist !== null && !isNaN(macdHist) ? Number(macdHist.toFixed(4)) : null,
      macdSignal: macdSignalVal,
      bbPercent: bbPercent !== null ? Number(bbPercent.toFixed(4)) : null,
      bbSignal: bbSignalVal,
      volRatio: volRatio !== null ? Number(volRatio.toFixed(2)) : null,
      volSignal,
      pctChange15m,
      votes: { up: upVotes, down: downVotes },
    },
  };
}

export async function GET() {
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const currentWindowStart = Math.floor(nowSec / 300) * 300;

    const [candles, win, chainlinkPrice, priceToBeat] = await Promise.all([
      fetchBtcCandles(),
      fetchCurrentWindow(),
      fetchChainlinkPrice(),
      fetchWindowPriceToBeat(currentWindowStart),
    ]);

    if (win) win.priceToBeat = priceToBeat;

    const signal = computeSignal(candles);
    const latest = candles[candles.length - 1];
    const currentPrice = chainlinkPrice ?? latest.close;
    const marketFavors = win ? (win.upPrice >= 0.5 ? "UP" : "DOWN") : null;
    const signalAgreesWithMarket = marketFavors === signal.direction;
    const delta = win?.priceToBeat != null ? currentPrice - win.priceToBeat : null;

    return NextResponse.json({
      price: latest.close,
      chainlinkPrice,
      candles,
      signal,
      window: win,
      delta,
      signalAgreesWithMarket,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load BTC data." },
      { status: 500 }
    );
  }
}
