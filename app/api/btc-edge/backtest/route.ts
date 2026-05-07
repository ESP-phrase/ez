import { NextResponse } from "next/server";

import { runBacktest } from "@/lib/btc-edge/backtest";

type BinanceKline = [
  number, string, string, string, string, string, number, ...unknown[]
];

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

async function fetchCandles(limit: number): Promise<Candle[]> {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=${limit}`,
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
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(1000, Math.max(100, Number(searchParams.get("limit") ?? 500)));

    const candles = await fetchCandles(limit);
    const summary = runBacktest(candles as Parameters<typeof runBacktest>[0]);

    return NextResponse.json({
      ...summary,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backtest failed." },
      { status: 500 }
    );
  }
}
