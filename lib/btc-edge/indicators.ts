export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = NaN;

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(prev);
    } else {
      prev = values[i] * k + prev * (1 - k);
      result.push(prev);
    }
  }
  return result;
}

export function rsi(closes: number[], period = 14): number[] {
  const result: number[] = Array(period).fill(NaN);
  if (closes.length <= period) return result;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain += diff > 0 ? diff : 0;
    avgLoss += diff < 0 ? -diff : 0;
  }
  avgGain /= period;
  avgLoss /= period;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return result;
}

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);

  const macdLine: number[] = emaFast.map((f, i) => {
    const s = emaSlow[i];
    return isNaN(f) || isNaN(s) ? NaN : f - s;
  });

  // Build signal line aligned to macdLine indices
  const signalLine: number[] = Array(macdLine.length).fill(NaN);
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalValues = ema(validMacd, signalPeriod);

  let validIdx = 0;
  let sigIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (!isNaN(macdLine[i])) {
      if (!isNaN(signalValues[sigIdx])) signalLine[i] = signalValues[sigIdx];
      validIdx++;
      sigIdx++;
    }
  }
  void validIdx;

  const histogram = macdLine.map((m, i) => {
    const s = signalLine[i];
    return isNaN(m) || isNaN(s) ? NaN : m - s;
  });

  return { macdLine, signalLine, histogram };
}

export function bollingerBands(
  closes: number[],
  period = 20,
  mult = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
    upper.push(mean + mult * std);
    middle.push(mean);
    lower.push(mean - mult * std);
  }

  return { upper, middle, lower };
}
