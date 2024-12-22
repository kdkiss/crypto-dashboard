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

export function calculateEMA(prices: number[], periods: number): number[] {
  if (prices.length < periods) {
    throw new Error("Not enough data points to calculate EMA.");
  }

  const multiplier = 2 / (periods + 1);
  const ema = Array(prices.length).fill(0);
  ema[periods - 1] =
    prices.slice(0, periods).reduce((sum, price) => sum + price, 0) / periods;

  for (let i = periods; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }

  return ema.slice(periods - 1); // Return only the valid EMA values
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

  const fastEMA = calculateEMA(prices, fastPeriods);
  const slowEMA = calculateEMA(prices, slowPeriods);
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriods);

  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

  // Get the most recent values
  const currentMACD = macdLine[macdLine.length - 1];
  const previousMACD = macdLine[macdLine.length - 2];
  const currentSignal = signalLine[signalLine.length - 1];
  const previousSignal = signalLine[signalLine.length - 2];
  const currentHistogram = currentMACD - currentSignal;

  // Detect crosses
  let crossType: "Bullish Cross" | "Bearish Cross" | null = null;
  if (previousMACD < previousSignal && currentMACD > currentSignal) {
    crossType = "Bullish Cross";
  } else if (previousMACD > previousSignal && currentMACD < currentSignal) {
    crossType = "Bearish Cross";
  }

  return {
    macdLine,
    signalLine,
    histogram,
    currentMACD: Number(currentMACD.toFixed(2)),
    currentSignal: Number(currentSignal.toFixed(2)),
    currentHistogram: Number(currentHistogram.toFixed(2)),
    trend: currentHistogram > 0 ? "Bullish" : "Bearish",
    crossType,
  };
}
