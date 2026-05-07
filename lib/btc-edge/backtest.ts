import { ema, rsi, macd, bollingerBands } from "./indicators";

export type Direction = "UP" | "DOWN" | "FLAT";

export type StrategyResult = {
  id: string;
  name: string;
  description: string;
  winRate: number;
  signalRate: number;
  totalSignals: number;
  correctSignals: number;
  upSignals: number;
  downSignals: number;
  correctUp: number;
  correctDown: number;
  score: number;
};

export type BacktestSummary = {
  totalCandles: number;
  testedCandles: number;
  fromTime: number;
  toTime: number;
  strategies: StrategyResult[];
  bestStrategyId: string;
};

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type StrategyDef = {
  id: string;
  name: string;
  description: string;
  warmup: number;
  predict: (candles: Candle[], indicators: PrecomputedIndicators, i: number) => Direction;
};

type PrecomputedIndicators = {
  closes: number[];
  volumes: number[];
  ema5: number[];
  ema9: number[];
  ema13: number[];
  ema21: number[];
  rsi14: number[];
  rsi7: number[];
  macdStd: ReturnType<typeof macd>;
  macdFast: ReturnType<typeof macd>;
  bb20: ReturnType<typeof bollingerBands>;
  bb10: ReturnType<typeof bollingerBands>;
};

const STRATEGIES: StrategyDef[] = [
  {
    id: "momentum3",
    name: "Candle Momentum (3)",
    description: "2+ of the last 3 candles green → UP",
    warmup: 3,
    predict: (candles, _ind, i) => {
      const recent = candles.slice(i - 2, i + 1);
      const greens = recent.filter((c) => c.close >= c.open).length;
      if (greens >= 2) return "UP";
      if (greens <= 1) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "momentum5",
    name: "Candle Momentum (5)",
    description: "3+ of the last 5 candles green → UP",
    warmup: 5,
    predict: (candles, _ind, i) => {
      const recent = candles.slice(i - 4, i + 1);
      const greens = recent.filter((c) => c.close >= c.open).length;
      if (greens >= 3) return "UP";
      if (greens <= 2) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "ema_5_13",
    name: "EMA Cross (5/13)",
    description: "EMA5 > EMA13 → UP, else DOWN",
    warmup: 14,
    predict: (_candles, ind, i) => {
      const fast = ind.ema5[i];
      const slow = ind.ema13[i];
      if (isNaN(fast) || isNaN(slow)) return "FLAT";
      if (fast > slow) return "UP";
      return "DOWN";
    },
  },
  {
    id: "ema_9_21",
    name: "EMA Cross (9/21)",
    description: "EMA9 > EMA21 → UP, else DOWN",
    warmup: 22,
    predict: (_candles, ind, i) => {
      const fast = ind.ema9[i];
      const slow = ind.ema21[i];
      if (isNaN(fast) || isNaN(slow)) return "FLAT";
      if (fast > slow) return "UP";
      return "DOWN";
    },
  },
  {
    id: "rsi14_std",
    name: "RSI-14 (40/60)",
    description: "RSI < 40 → UP, RSI > 60 → DOWN, else FLAT",
    warmup: 15,
    predict: (_candles, ind, i) => {
      const r = ind.rsi14[i];
      if (isNaN(r)) return "FLAT";
      if (r < 40) return "UP";
      if (r > 60) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "rsi14_tight",
    name: "RSI-14 (45/55)",
    description: "RSI < 45 → UP, RSI > 55 → DOWN, else FLAT",
    warmup: 15,
    predict: (_candles, ind, i) => {
      const r = ind.rsi14[i];
      if (isNaN(r)) return "FLAT";
      if (r < 45) return "UP";
      if (r > 55) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "rsi7_std",
    name: "RSI-7 (40/60)",
    description: "Faster RSI(7): RSI < 40 → UP, RSI > 60 → DOWN",
    warmup: 8,
    predict: (_candles, ind, i) => {
      const r = ind.rsi7[i];
      if (isNaN(r)) return "FLAT";
      if (r < 40) return "UP";
      if (r > 60) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "macd_hist",
    name: "MACD Histogram",
    description: "MACD histogram > 0 → UP, < 0 → DOWN",
    warmup: 35,
    predict: (_candles, ind, i) => {
      const h = ind.macdStd.histogram[i];
      if (isNaN(h)) return "FLAT";
      if (h > 0) return "UP";
      return "DOWN";
    },
  },
  {
    id: "macd_fast_hist",
    name: "MACD Fast (6/13/5)",
    description: "Fast MACD histogram > 0 → UP, < 0 → DOWN",
    warmup: 18,
    predict: (_candles, ind, i) => {
      const h = ind.macdFast.histogram[i];
      if (isNaN(h)) return "FLAT";
      if (h > 0) return "UP";
      return "DOWN";
    },
  },
  {
    id: "bb20_bounce",
    name: "Bollinger Bounce (20)",
    description: "Close in lower 25% of BB → UP; upper 25% → DOWN",
    warmup: 21,
    predict: (candles, ind, i) => {
      const u = ind.bb20.upper[i];
      const l = ind.bb20.lower[i];
      if (isNaN(u) || isNaN(l)) return "FLAT";
      const bandRange = u - l;
      const pos = (candles[i].close - l) / bandRange;
      if (pos < 0.25) return "UP";
      if (pos > 0.75) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "ema_rsi",
    name: "EMA(5/13) + RSI-14",
    description: "Both EMA cross AND RSI agree → signal, else FLAT",
    warmup: 22,
    predict: (_candles, ind, i) => {
      const emaDir = ind.ema5[i] > ind.ema13[i] ? "UP" : "DOWN";
      const r = ind.rsi14[i];
      if (isNaN(r)) return "FLAT";
      const rsiDir = r < 50 ? "UP" : "DOWN";
      if (emaDir === rsiDir) return emaDir;
      return "FLAT";
    },
  },
  {
    id: "ema_macd",
    name: "EMA(9/21) + MACD",
    description: "Both EMA cross AND MACD histogram agree → signal",
    warmup: 36,
    predict: (_candles, ind, i) => {
      const emaDir = ind.ema9[i] > ind.ema21[i] ? "UP" : "DOWN";
      const h = ind.macdStd.histogram[i];
      if (isNaN(h)) return "FLAT";
      const macdDir = h > 0 ? "UP" : "DOWN";
      if (emaDir === macdDir) return emaDir;
      return "FLAT";
    },
  },
  {
    id: "rsi_bb",
    name: "RSI-7 + BB(20) Squeeze",
    description: "RSI extremes confirmed by Bollinger position",
    warmup: 22,
    predict: (candles, ind, i) => {
      const r = ind.rsi7[i];
      const u = ind.bb20.upper[i];
      const l = ind.bb20.lower[i];
      if (isNaN(r) || isNaN(u) || isNaN(l)) return "FLAT";
      const bandRange = u - l;
      const pos = (candles[i].close - l) / bandRange;
      if (r < 40 && pos < 0.35) return "UP";
      if (r > 60 && pos > 0.65) return "DOWN";
      return "FLAT";
    },
  },
  {
    id: "triple_confirm",
    name: "Triple Confirm (EMA+RSI+MACD)",
    description: "All three agree → signal, else FLAT",
    warmup: 36,
    predict: (_candles, ind, i) => {
      const emaDir = ind.ema5[i] > ind.ema13[i] ? "UP" : "DOWN";
      const r = ind.rsi14[i];
      if (isNaN(r)) return "FLAT";
      const rsiDir = r < 50 ? "UP" : "DOWN";
      const h = ind.macdStd.histogram[i];
      if (isNaN(h)) return "FLAT";
      const macdDir = h > 0 ? "UP" : "DOWN";
      if (emaDir === rsiDir && rsiDir === macdDir) return emaDir;
      return "FLAT";
    },
  },
];

function precompute(candles: Candle[]): PrecomputedIndicators {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  return {
    closes,
    volumes,
    ema5: ema(closes, 5),
    ema9: ema(closes, 9),
    ema13: ema(closes, 13),
    ema21: ema(closes, 21),
    rsi14: rsi(closes, 14),
    rsi7: rsi(closes, 7),
    macdStd: macd(closes, 12, 26, 9),
    macdFast: macd(closes, 6, 13, 5),
    bb20: bollingerBands(closes, 20, 2),
    bb10: bollingerBands(closes, 10, 2),
  };
}

function runStrategy(
  strategy: StrategyDef,
  candles: Candle[],
  indicators: PrecomputedIndicators
): Omit<StrategyResult, "score"> {
  let totalSignals = 0;
  let correctSignals = 0;
  let upSignals = 0;
  let downSignals = 0;
  let correctUp = 0;
  let correctDown = 0;
  let tested = 0;

  for (let i = strategy.warmup; i < candles.length - 1; i++) {
    const pred = strategy.predict(candles, indicators, i);
    if (pred === "FLAT") continue;

    // Actual: did price go up from this candle's close to next candle's close?
    const actualUp = candles[i + 1].close > candles[i].close;
    const actual: Direction = actualUp ? "UP" : "DOWN";

    totalSignals++;
    if (pred === "UP") upSignals++;
    else downSignals++;

    if (pred === actual) {
      correctSignals++;
      if (pred === "UP") correctUp++;
      else correctDown++;
    }
    tested++;
    void tested;
  }

  const testedCandles = candles.length - strategy.warmup - 1;
  const winRate = totalSignals > 0 ? correctSignals / totalSignals : 0;
  const signalRate = testedCandles > 0 ? totalSignals / testedCandles : 0;

  return {
    id: strategy.id,
    name: strategy.name,
    description: strategy.description,
    winRate,
    signalRate,
    totalSignals,
    correctSignals,
    upSignals,
    downSignals,
    correctUp,
    correctDown,
  };
}

export function runBacktest(candles: Candle[]): BacktestSummary {
  const indicators = precompute(candles);

  const strategies: StrategyResult[] = STRATEGIES.map((s) => {
    const result = runStrategy(s, candles, indicators);
    // Score = winRate weighted by signal rate (penalise too-few signals)
    const score = result.winRate * Math.min(result.signalRate, 1);
    return { ...result, score };
  });

  strategies.sort((a, b) => b.score - a.score);

  return {
    totalCandles: candles.length,
    testedCandles: candles.length - 36 - 1,
    fromTime: candles[0]
      ? (candles[0] as unknown as { time: number }).time
      : 0,
    toTime: candles[candles.length - 1]
      ? (candles[candles.length - 1] as unknown as { time: number }).time
      : 0,
    strategies,
    bestStrategyId: strategies[0]?.id ?? "",
  };
}
