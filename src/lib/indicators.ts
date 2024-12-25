export function calculateRSI(prices: number[], periods: number = 14): number {
  if (prices.length < periods + 1) return 50; // Default value if not enough data

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= periods; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference > 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / periods;
  let avgLoss = losses / periods;

  // Calculate RSI using the Wilder's smoothing method
  for (let i = periods + 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference > 0) {
      avgGain = (avgGain * (periods - 1) + difference) / periods;
      avgLoss = (avgLoss * (periods - 1)) / periods;
    } else {
      avgGain = (avgGain * (periods - 1)) / periods;
      avgLoss = (avgLoss * (periods - 1) - difference) / periods;
    }
  }

  if (avgLoss === 0) return 100; // No losses mean RSI is 100

  const RS = avgGain / avgLoss;
  return +(100 - 100 / (1 + RS)).toFixed(2); // Rounded to 2 decimal places
}

export function calculateCCI(
  data: { high: number[] | undefined; low: number[] | undefined; close: number[] | undefined },
  period: number = 20
): number[] {
  const { high, low, close } = data;

  // Validate inputs
  if (!high || !low || !close || high.length === 0 || low.length === 0 || close.length === 0) {
    console.warn("Invalid input data for CCI calculation. Missing or empty arrays.", { high, low, close });
    return []; // Return an empty array if any input is missing or invalid
  }

  // Ensure arrays are aligned to the same length
  const minLength = Math.min(high.length, low.length, close.length);
  const alignedHigh = high.slice(0, minLength);
  const alignedLow = low.slice(0, minLength);
  const alignedClose = close.slice(0, minLength);

  if (minLength < period) {
    console.warn("Not enough data to calculate CCI. Minimum required:", period);
    return Array(minLength).fill(NaN); // Fill with NaN if not enough data
  }

  const typicalPrices = alignedHigh.map((h, i) => (h + alignedLow[i] + alignedClose[i]) / 3);
  const cci: number[] = [];

  for (let i = 0; i < typicalPrices.length; i++) {
    if (i < period - 1) {
      cci.push(NaN); // Not enough data for this entry
      continue;
    }

    const tpSlice = typicalPrices.slice(i - period + 1, i + 1);
    const sma = tpSlice.reduce((sum, tp) => sum + tp, 0) / period;
    const meanDeviation = tpSlice.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;

    cci.push(((typicalPrices[i] - sma) / (0.015 * meanDeviation)) || 0);
  }

  return cci;
}


export function calculateEMA(prices: number[], periods: number): number[] {
  const k = 2 / (periods + 1);
  const ema = new Array(prices.length);

  // Initialize with SMA
  let sum = 0;
  for (let i = 0; i < periods; i++) {
    sum += prices[i];
  }
  ema[periods - 1] = sum / periods;

  // Calculate EMA
  for (let i = periods; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }

  return ema.slice(periods - 1);
}

export interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
  currentMACD: number;
  currentSignal: number;
  currentHistogram: number;
  trend: "Bullish" | "Bearish";
  crossType: "Bullish Cross" | "Bearish Cross" | null;
}

export function calculateMACD(
  prices: number[],
  fastPeriods: number = 12,
  slowPeriods: number = 26,
  signalPeriods: number = 9,
): MACDResult {
  if (prices.length < slowPeriods + signalPeriods) {
    throw new Error("Not enough data points to calculate MACD.");
  }

  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriods);
  const slowEMA = calculateEMA(prices, slowPeriods);

  // Align arrays to same length
  const startIndex = slowPeriods - fastPeriods;
  const alignedFastEMA = fastEMA.slice(startIndex);

  // Calculate MACD line
  const macdLine = alignedFastEMA.map((fast, i) => fast - slowEMA[i]);

  // Calculate Signal line (9-day EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriods);

  // Calculate histogram
  const histogram = macdLine
    .slice(-signalLine.length)
    .map((macd, i) => macd - signalLine[i]);

  // Get the most recent values
  const currentMACD = macdLine[macdLine.length - 1];
  const previousMACD = macdLine[macdLine.length - 2];
  const currentSignal = signalLine[signalLine.length - 1];
  const previousSignal = signalLine[signalLine.length - 2];
  const currentHistogram = histogram[histogram.length - 1];

  // Detect crosses and trend
  let crossType: "Bullish Cross" | "Bearish Cross" | null = null;
  if (previousMACD < previousSignal && currentMACD > currentSignal) {
    crossType = "Bullish Cross";
  } else if (previousMACD > previousSignal && currentMACD < currentSignal) {
    crossType = "Bearish Cross";
  }

  // Determine trend based on histogram and MACD line slope
  const trend = (() => {
    const histogramTrend = currentHistogram > 0;
    const macdSlope = currentMACD - previousMACD;
    if (histogramTrend && macdSlope > 0) return "Bullish";
    if (!histogramTrend && macdSlope < 0) return "Bearish";
    return currentHistogram > 0 ? "Bullish" : "Bearish";
  })();

  return {
    macdLine,
    signalLine,
    histogram,
    currentMACD: Number(currentMACD.toFixed(2)),
    currentSignal: Number(currentSignal.toFixed(2)),
    currentHistogram: Number(currentHistogram.toFixed(2)),
    trend,
    crossType,
  };
}

export interface StochasticResult {
  k: number;
  d: number;
  signal: "Buy" | "Sell" | null;
}

export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  periods: number = 14,
  smoothK: number = 3,
  smoothD: number = 3,
): StochasticResult {
  if (
    highs.length < periods ||
    lows.length < periods ||
    closes.length < periods
  ) {
    throw new Error("Not enough data points to calculate Stochastic.");
  }

  // Calculate %K for each period
  const rawK: number[] = [];
  for (let i = periods - 1; i < closes.length; i++) {
    const currentClose = closes[i];
    const highestHigh = Math.max(...highs.slice(i - periods + 1, i + 1));
    const lowestLow = Math.min(...lows.slice(i - periods + 1, i + 1));
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    rawK.push(k);
  }

  // Smooth %K using SMA
  const smoothedK = rawK
    .slice(smoothK - 1)
    .map(
      (_, i) =>
        rawK.slice(i, i + smoothK).reduce((sum, val) => sum + val, 0) / smoothK,
    );

  // Calculate %D (SMA of smoothed %K)
  const d = smoothedK
    .slice(smoothD - 1)
    .map(
      (_, i) =>
        smoothedK.slice(i, i + smoothD).reduce((sum, val) => sum + val, 0) /
        smoothD,
    );

  // Get the most recent values
  const currentK = smoothedK[smoothedK.length - 1];
  const previousK = smoothedK[smoothedK.length - 2];
  const currentD = d[d.length - 1];
  const previousD = d[d.length - 2];

  // Determine buy/sell signal
  let signal: "Buy" | "Sell" | null = null;
  if (previousK < previousD && currentK > currentD && currentK < 20) {
    signal = "Buy";
  } else if (previousK > previousD && currentK < currentD && currentK > 80) {
    signal = "Sell";
  }

  return {
    k: Number(currentK.toFixed(2)),
    d: Number(currentD.toFixed(2)),
    signal,
  };
}
