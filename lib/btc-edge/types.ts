export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  green: boolean;
};

export type IndicatorValues = {
  rsi14: number | null;
  ema9: number | null;
  ema21: number | null;
  emaCross: "BULL" | "BEAR" | null;
  macdHist: number | null;
  macdSignal: "BULL" | "BEAR" | null;
  bbPercent: number | null;
  bbSignal: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL";
  volRatio: number | null;
  volSignal: "HIGH" | "LOW" | "NORMAL";
  pctChange15m: number;
  votes: { up: number; down: number };
};

export type SignalResult = {
  direction: "UP" | "DOWN" | "FLAT";
  confidence: number;
  pctChange15m: number;
  reason: string;
  indicators: IndicatorValues;
};

export type WindowMarket = {
  slug: string;
  title: string;
  windowStart: string;
  windowEnd: string;
  priceToBeat: number | null;
  upPrice: number;
  downPrice: number;
  secondsRemaining: number;
};

export type PriceData = {
  chainlinkPrice: number | null;
  binancePrice: number;
};
