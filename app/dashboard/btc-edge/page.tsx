"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Minus, RefreshCw, ExternalLink, Zap, FlaskConical, Clock, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/sidebar";
import type { Candle, SignalResult, WindowMarket, IndicatorValues } from "@/lib/btc-edge/types";

type BtcData = {
  price: number;
  chainlinkPrice: number | null;
  candles: Candle[];
  signal: SignalResult;
  window: WindowMarket | null;
  delta: number | null;
  signalAgreesWithMarket: boolean | null;
  fetchedAt: string;
  error?: string;
};

type PriceStream = {
  chainlinkPrice: number | null;
  binancePrice: number | null;
  ts: number;
  openingPrice?: number | null;   // Chainlink price at window open (precise)
  priceToBeat?: number | null;    // Polymarket value or openingPrice fallback
  upPrice?: number | null;
  downPrice?: number | null;
};

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDelta(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${formatPrice(Math.abs(n))}`;
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function CandleChart({ candles }: { candles: Candle[] }) {
  const W = 480;
  const H = 100;
  const PAD = 6;
  if (!candles.length) return null;

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const range = maxPrice - minPrice || 1;
  const barW = (W - PAD * 2) / candles.length;
  const toY = (price: number) => PAD + ((maxPrice - price) / range) * (H - PAD * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
      {candles.map((c, i) => {
        const x = PAD + i * barW + barW * 0.15;
        const bodyW = barW * 0.7;
        const openY = toY(c.open);
        const closeY = toY(c.close);
        const highY = toY(c.high);
        const lowY = toY(c.low);
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), 1);
        const color = c.green ? "#10b981" : "#ef4444";
        const midX = x + bodyW / 2;
        return (
          <g key={c.time}>
            <line x1={midX} y1={highY} x2={midX} y2={lowY} stroke={color} strokeWidth={1} opacity={0.6} />
            <rect x={x} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

function SignalBadge({ direction }: { direction: SignalResult["direction"] }) {
  if (direction === "UP")
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ArrowUp className="w-3.5 h-3.5" /> UP
      </span>
    );
  if (direction === "DOWN")
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-200">
        <ArrowDown className="w-3.5 h-3.5" /> DOWN
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <Minus className="w-3.5 h-3.5" /> FLAT
    </span>
  );
}

function IndicatorRow({
  label, value, signal, detail,
}: { label: string; value: string; signal: "BULL" | "BEAR" | "NEUTRAL" | "HIGH" | "LOW" | "NORMAL" | "OVERSOLD" | "OVERBOUGHT" | null; detail?: string }) {
  const bull = signal === "BULL" || signal === "OVERSOLD" || signal === "LOW";
  const bear = signal === "BEAR" || signal === "OVERBOUGHT";
  const high = signal === "HIGH";
  const dot = bull ? "bg-emerald-500" : bear ? "bg-red-500" : high ? "bg-amber-400" : "bg-slate-300";
  const badge = bull
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : bear
    ? "bg-red-50 text-red-600 border-red-200"
    : high
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {detail && <span className="text-xs text-slate-400">{detail}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-900 tabular-nums">{value}</span>
        {signal && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge}`}>
            {signal}
          </span>
        )}
      </div>
    </div>
  );
}

function IndicatorPanel({ ind }: { ind: IndicatorValues }) {
  const totalVotes = ind.votes.up + ind.votes.down;
  const upPct = totalVotes > 0 ? Math.round((ind.votes.up / totalVotes) * 100) : 50;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Technical Indicators</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{ind.votes.up}↑ / {ind.votes.down}↓</span>
          <div className="w-24 h-2 rounded-full bg-red-100 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${upPct}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-600">{upPct}% UP</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <IndicatorRow
          label="RSI (14)"
          value={ind.rsi14 !== null ? ind.rsi14.toFixed(1) : "—"}
          signal={ind.bbSignal}
          detail={ind.rsi14 !== null ? (ind.rsi14 < 35 ? "oversold" : ind.rsi14 > 65 ? "overbought" : "neutral") : undefined}
        />
        <IndicatorRow
          label="EMA 9 / 21"
          value={ind.ema9 !== null && ind.ema21 !== null
            ? `$${ind.ema9.toLocaleString("en-US", { maximumFractionDigits: 0 })} / $${ind.ema21.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
            : "—"}
          signal={ind.emaCross}
          detail={ind.emaCross === "BULL" ? "9 above 21" : ind.emaCross === "BEAR" ? "9 below 21" : undefined}
        />
        <IndicatorRow
          label="MACD Histogram"
          value={ind.macdHist !== null ? (ind.macdHist >= 0 ? `+${ind.macdHist.toFixed(2)}` : ind.macdHist.toFixed(2)) : "—"}
          signal={ind.macdSignal}
        />
        <IndicatorRow
          label="Bollinger %B"
          value={ind.bbPercent !== null ? `${(ind.bbPercent * 100).toFixed(0)}%` : "—"}
          signal={ind.bbPercent !== null ? (ind.bbPercent < 0.3 ? "OVERSOLD" : ind.bbPercent > 0.7 ? "OVERBOUGHT" : "NEUTRAL") : null}
          detail={ind.bbPercent !== null ? (ind.bbPercent < 0.3 ? "near lower band" : ind.bbPercent > 0.7 ? "near upper band" : "mid-band") : undefined}
        />
        <IndicatorRow
          label="Volume Ratio"
          value={ind.volRatio !== null ? `${ind.volRatio.toFixed(2)}×` : "—"}
          signal={ind.volSignal}
          detail={ind.volSignal === "HIGH" ? "surge vs avg" : ind.volSignal === "LOW" ? "weak vs avg" : "normal"}
        />
        <IndicatorRow
          label="15m Price Δ"
          value={`${ind.pctChange15m >= 0 ? "+" : ""}${ind.pctChange15m.toFixed(3)}%`}
          signal={ind.pctChange15m > 0.05 ? "BULL" : ind.pctChange15m < -0.05 ? "BEAR" : "NEUTRAL"}
        />
      </div>
    </div>
  );
}

export default function BtcEdgePage() {
  const router = useRouter();
  const [data, setData] = useState<BtcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  // Live values from SSE stream
  const [liveChainlink, setLiveChainlink] = useState<number | null>(null);
  const [liveBinance, setLiveBinance] = useState<number | null>(null);
  const [livePriceToBeat, setLivePriceToBeat] = useState<number | null>(null);
  const [liveUpPrice, setLiveUpPrice] = useState<number | null>(null);
  const [liveDownPrice, setLiveDownPrice] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/btc-edge");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as BtcData;
      if (json.error) throw new Error(json.error);
      setData(json);
      if (json.window?.secondsRemaining != null) {
        setCountdown(json.window.secondsRemaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("pg_auth") !== "true") {
      router.replace("/login");
      return;
    }
    void load();
    intervalRef.current = setInterval(() => void load(), 30_000);

    // SSE: real-time Chainlink + Binance price stream
    const es = new EventSource("/api/btc-edge/price-stream");
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as PriceStream;
        if (msg.binancePrice) setLiveBinance(msg.binancePrice);
        if (msg.chainlinkPrice) setLiveChainlink(msg.chainlinkPrice);
        // priceToBeat: Polymarket value or cached Chainlink opening, always precise
        if (msg.priceToBeat !== undefined) setLivePriceToBeat(msg.priceToBeat ?? null);
        if (msg.upPrice !== undefined) setLiveUpPrice(msg.upPrice ?? null);
        if (msg.downPrice !== undefined) setLiveDownPrice(msg.downPrice ?? null);
      } catch { /* ignore parse errors */ }
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      es.close();
    };
  }, [router, load]);

  // Live countdown ticker
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const signal = data?.signal;
  const win = data?.window;

  // Prefer SSE live values; fall back to snapshot
  const displayBinance = liveBinance ?? data?.price ?? null;
  const displayChainlink = liveChainlink ?? data?.chainlinkPrice ?? null;
  const displayPriceToBeat = livePriceToBeat ?? win?.priceToBeat ?? null;
  const displayUpPrice = liveUpPrice ?? win?.upPrice ?? null;
  const displayDownPrice = liveDownPrice ?? win?.downPrice ?? null;

  // Delta recomputes every 2s as Chainlink updates
  const delta = displayChainlink != null && displayPriceToBeat != null
    ? displayChainlink - displayPriceToBeat
    : data?.delta ?? null;

  const lastUpdated = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  const aboveStrike = delta !== null && delta !== undefined && delta >= 0;
  const edgeExists = data?.signalAgreesWithMarket === false; // signal disagrees = potential edge

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 sticky top-0 z-30 bg-slate-50/95 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-violet-600 uppercase">Live Feed</p>
              <p className="text-lg font-semibold text-slate-900">BTC Edge</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && <span className="text-xs text-slate-400">Updated {lastUpdated}</span>}
            <Link
              href="/dashboard/btc-edge/backtest"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-all"
            >
              <FlaskConical className="w-3 h-3" />
              Backtest
            </Link>
            <button
              onClick={() => { setLoading(true); void load(); }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-5 max-w-5xl mx-auto w-full">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
          )}

          {loading && !data && (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}

          {data && (
            <>
              {/* Current window banner */}
              {win && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Live Window</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-900">{win.title}</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                      Resolves via Chainlink BTC/USD ·{" "}
                      <a
                        href={`https://polymarket.com/event/${win.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-violet-800"
                      >
                        View on Polymarket <ExternalLink className="inline w-3 h-3" />
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {countdown !== null && (
                      <div className="text-center">
                        <p className="text-[11px] text-violet-500 font-medium uppercase tracking-wide">Closes in</p>
                        <p className={`text-lg font-bold tabular-nums ${countdown < 60 ? "text-red-600" : "text-violet-800"}`}>
                          {formatCountdown(countdown)}
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-[11px] text-violet-500 font-medium uppercase tracking-wide">Market odds</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-bold text-emerald-600">UP {displayUpPrice != null ? Math.round(displayUpPrice * 100) : "—"}¢</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-red-500">DN {displayDownPrice != null ? Math.round(displayDownPrice * 100) : "—"}¢</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price to beat + current price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chainlink BTC/USD</p>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                    {displayChainlink ? `$${formatPrice(displayChainlink)}` : displayBinance ? `$${formatPrice(displayBinance)}` : "—"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {displayChainlink ? "On-chain · resolution source" : "Binance spot (Chainlink loading)"}
                  </p>
                </div>

                <div className={`rounded-xl border px-5 py-4 ${displayPriceToBeat ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Price to Beat</p>
                  {displayPriceToBeat ? (
                    <>
                      <p className="mt-1.5 text-2xl font-bold text-amber-900">${formatPrice(displayPriceToBeat)}</p>
                      <p className="text-xs text-amber-600 mt-0.5">BTC price at window open</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 text-2xl font-bold text-slate-400">—</p>
                      <p className="text-xs text-slate-400 mt-0.5">Set at window open</p>
                    </>
                  )}
                </div>

                <div className={`rounded-xl border px-5 py-4 ${
                  delta === null ? "border-slate-200 bg-white" :
                  aboveStrike ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Distance from Strike</p>
                    {delta !== null && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  {delta !== null ? (
                    <>
                      <div className="flex items-center gap-2 mt-1.5">
                        {aboveStrike
                          ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                          : <TrendingDown className="w-5 h-5 text-red-500" />}
                        <p className={`text-2xl font-bold ${aboveStrike ? "text-emerald-700" : "text-red-600"}`}>
                          {formatDelta(delta)}
                        </p>
                      </div>
                      <p className={`text-xs mt-0.5 ${aboveStrike ? "text-emerald-600" : "text-red-500"}`}>
                        Currently {aboveStrike ? "above" : "below"} strike → {aboveStrike ? "UP" : "DOWN"} leading
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 text-2xl font-bold text-slate-400">—</p>
                      <p className="text-xs text-slate-400 mt-0.5">No price to beat yet</p>
                    </>
                  )}
                </div>
              </div>

              {/* Edge alert */}
              {edgeExists && signal && win && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Potential edge detected</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Momentum signal says <strong>{signal.direction}</strong> ({signal.confidence}% confidence) but
                      Polymarket favors <strong>{(displayUpPrice ?? 0.5) >= 0.5 ? "UP" : "DOWN"}</strong>{" "}
                      ({displayUpPrice != null && displayDownPrice != null ? Math.round(Math.max(displayUpPrice, displayDownPrice) * 100) : "—"}¢). Divergence may represent mispricing.
                    </p>
                  </div>
                </div>
              )}

              {/* Indicator Panel */}
              {signal?.indicators && <IndicatorPanel ind={signal.indicators} />}

              {/* Signal + Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Momentum signal</p>
                      <div className="mt-2 flex items-center gap-2">
                        {signal && <SignalBadge direction={signal.direction} />}
                        {signal && (
                          <span className={`text-2xl font-bold ${
                            signal.direction === "UP" ? "text-emerald-600" :
                            signal.direction === "DOWN" ? "text-red-500" : "text-slate-500"
                          }`}>
                            {signal.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {signal && (
                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {signal.reason}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {data.candles.slice(-3).map((c, i) => (
                      <div key={c.time} className={`rounded-lg px-3 py-2 border text-xs ${c.green ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                        <p className="text-slate-500 font-medium">{i === 0 ? "−10m" : i === 1 ? "−5m" : "now"}</p>
                        <p className={`font-bold mt-0.5 ${c.green ? "text-emerald-700" : "text-red-600"}`}>
                          {c.green ? "▲" : "▼"} ${formatPrice(c.close)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last 60 min (5m candles)</p>
                    <p className="text-xs text-slate-400">{data.candles.length} candles</p>
                  </div>
                  <CandleChart candles={data.candles} />
                  <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span>60 min ago</span>
                    <span>now</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center pb-4">
                Price to beat = Chainlink BTC/USD at window open. Delta updates live via Chainlink on-chain feed (Polygon).
                Candles use Binance 5m OHLCV. Window data refreshes every 30s.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
