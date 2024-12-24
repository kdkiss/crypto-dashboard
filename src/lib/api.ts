import {
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  type MACDResult,
} from "./indicators";

const BINANCE_REST_URL = "https://api.binance.com/api/v3";
const TM_API_KEY = "tm-c20bcf38-0000-43f4-ba11-abc3fe6dc00f";

export interface CryptoData {
  id: string;
  symbol: string;
  price: number;
  previousClose: number;
  previousWeekClose: number;
  change24h: number;
  rsi: {
    daily: number;
    h4: number;
    h1: number;
  };
  macd: {
    daily: MACDResult;
    h4: MACDResult;
    h1: MACDResult;
  };
  stochastic: {
    k: number;
    d: number;
    signal: "Buy" | "Sell" | null;
  };
  volume: number;
  chartData?: Array<{
    timestamp: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  levels?: Array<{
    date: string;
    level: number;
  }>;
}

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "TAOUSDT",
  "AAVEUSDT",
  "LINKUSDT",
  "ENAUSDT",
  "BONKUSDT",
  "TONUSDT",
];

const defaultData: CryptoData[] = [
  {
    id: "btcusdt",
    symbol: "BTC/USDT",
    price: 45000,
    previousClose: 44000,
    previousWeekClose: 43500,
    change24h: 2.5,
    rsi: {
      daily: 65,
      h4: 55,
      h1: 45,
    },
    macd: {
      daily: {
        trend: "Bullish",
        crossType: null,
        currentMACD: 145.2,
        currentSignal: 132.5,
        currentHistogram: 12.7,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
      h4: {
        trend: "Bullish",
        crossType: "Bullish Cross",
        currentMACD: 125.4,
        currentSignal: 115.2,
        currentHistogram: 10.2,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
      h1: {
        trend: "Bullish",
        crossType: null,
        currentMACD: 95.6,
        currentSignal: 88.4,
        currentHistogram: 7.2,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
    },
    stochastic: {
      k: 65,
      d: 60,
      signal: null,
    },
    volume: 1000000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 1000 + 44000,
      open: Math.random() * 1000 + 44000,
      high: Math.random() * 1000 + 45000,
      low: Math.random() * 1000 + 43000,
      close: Math.random() * 1000 + 44000,
    })),
    levels: [
      { date: "2024-03-20", level: 44000 },
      { date: "2024-03-20", level: 46000 },
      { date: "2024-03-20", level: 43000 },
      { date: "2024-03-20", level: 47000 },
    ],
  },
  {
    id: "ethusdt",
    symbol: "ETH/USDT",
    price: 2800,
    previousClose: 2850,
    previousWeekClose: 2750,
    change24h: -1.2,
    rsi: {
      daily: 45,
      h4: 52,
      h1: 48,
    },
    macd: {
      daily: {
        trend: "Bearish",
        crossType: null,
        currentMACD: -45.2,
        currentSignal: -32.5,
        currentHistogram: -12.7,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
      h4: {
        trend: "Bearish",
        crossType: "Bearish Cross",
        currentMACD: -25.4,
        currentSignal: -15.2,
        currentHistogram: -10.2,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
      h1: {
        trend: "Bearish",
        crossType: null,
        currentMACD: -15.6,
        currentSignal: -8.4,
        currentHistogram: -7.2,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
    },
    stochastic: {
      k: 85,
      d: 82,
      signal: "Sell",
    },
    volume: 500000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 100 + 2750,
      open: Math.random() * 100 + 2750,
      high: Math.random() * 100 + 2850,
      low: Math.random() * 100 + 2650,
      close: Math.random() * 100 + 2750,
    })),
    levels: [
      { date: "2024-03-20", level: 2700 },
      { date: "2024-03-20", level: 2900 },
      { date: "2024-03-20", level: 2600 },
      { date: "2024-03-20", level: 3000 },
    ],
  },
];

async function fetchKlines(symbol: string, interval: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${BINANCE_REST_URL}/klines?symbol=${symbol}&interval=${interval}&limit=100`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    return [];
  }
}

async function fetch24hTicker(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `${BINANCE_REST_URL}/ticker/24hr?symbol=${symbol}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching 24h ticker for ${symbol}:`, error);
    return null;
  }
}

async function fetchSupportResistanceLevels(symbol: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.tokenmetrics.com/v2/resistance-support?symbol=${symbol}&limit=1000&page=0`,
      {
        headers: {
          accept: "application/json",
          api_key: TM_API_KEY,
        },
      },
    );
    const data = await response.json();
    if (!data.data?.[0]?.HISTORICAL_RESISTANCE_SUPPORT_LEVELS) {
      throw new Error("No levels data");
    }
    return data.data[0].HISTORICAL_RESISTANCE_SUPPORT_LEVELS.map(
      (level: any) => ({
        date: new Date(level.date).toISOString().split("T")[0],
        level: level.level,
      }),
    );
  } catch (error) {
    console.error(`Error fetching levels for ${symbol}:`, error);
    return [];
  }
}

export async function fetchCryptoData(): Promise<CryptoData[]> {
  try {
    const cryptoData = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        try {
          const [
            dailyKlines,
            weeklyKlines,
            h4Klines,
            h1Klines,
            ticker,
            levels,
          ] = await Promise.all([
            fetchKlines(symbol, "1d"),
            fetchKlines(symbol, "1w"),
            fetchKlines(symbol, "4h"),
            fetchKlines(symbol, "1h"),
            fetch24hTicker(symbol),
            fetchSupportResistanceLevels(symbol.slice(0, -4)),
          ]);

          if (
            !dailyKlines.length ||
            !weeklyKlines.length ||
            !h4Klines.length ||
            !h1Klines.length ||
            !ticker
          ) {
            throw new Error(`No data available for ${symbol}`);
          }

          // Calculate RSI for different timeframes
          const dailyPrices = dailyKlines.map((candle) =>
            parseFloat(candle[4]),
          );
          const h4Prices = h4Klines.map((candle) => parseFloat(candle[4]));
          const h1Prices = h1Klines.map((candle) => parseFloat(candle[4]));

          const rsi = {
            daily: calculateRSI(dailyPrices),
            h4: calculateRSI(h4Prices),
            h1: calculateRSI(h1Prices),
          };

          // Calculate MACD for different timeframes
          const macd = {
            daily: calculateMACD(dailyPrices),
            h4: calculateMACD(h4Prices),
            h1: calculateMACD(h1Prices),
          };

          // Calculate Stochastic using daily timeframe
          const stochastic = calculateStochastic(
            dailyKlines.map((candle) => parseFloat(candle[2])), // highs
            dailyKlines.map((candle) => parseFloat(candle[3])), // lows
            dailyKlines.map((candle) => parseFloat(candle[4])), // closes
          );

          const chartData = h1Klines.map((candle) => ({
            timestamp: new Date(candle[0]).toLocaleTimeString(),
            price: parseFloat(candle[4]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
          }));

          // Get the previous week's closing price
          const previousWeekClose = parseFloat(
            weeklyKlines[weeklyKlines.length - 2][4],
          );

          return {
            id: symbol.toLowerCase(),
            symbol: symbol.slice(0, -4) + "/" + symbol.slice(-4),
            price: parseFloat(ticker.lastPrice),
            previousClose: parseFloat(ticker.prevClosePrice),
            previousWeekClose,
            change24h: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.volume),
            rsi,
            macd,
            stochastic,
            chartData,
            levels,
          };
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error);
          return null;
        }
      }),
    );

    // Filter out any failed requests and duplicates
    const validData = cryptoData.filter(
      // @ts-ignore: Suppress type predicate incompatibility
      (data): data is CryptoData => data !== null && (!data.chartData || Array.isArray(data.chartData))
    );
    const uniqueData = validData.filter(
      (data, index, self) => index === self.findIndex((d) => d.id === data.id),
    );

    return uniqueData.length > 0 ? uniqueData : defaultData;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return defaultData;
  }
}

export async function fetchCoinHistory(symbol: string): Promise<any> {
  try {
    const formattedSymbol = symbol.replace("/", "");
    const [klines, levels] = await Promise.all([
      fetchKlines(formattedSymbol, "1h"),
      fetchSupportResistanceLevels(symbol.split("/")[0]),
    ]);

    if (!klines.length) throw new Error("No historical data");

    return {
      candles: klines.map((candle) => ({
        timestamp: new Date(candle[0]).toLocaleTimeString(),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      })),
      levels,
    };
  } catch (error) {
    console.error("Error fetching coin history:", error);
    return {
      candles: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        open: 45000 + Math.random() * 1000,
        high: 46000 + Math.random() * 1000,
        low: 44000 + Math.random() * 1000,
        close: 45500 + Math.random() * 1000,
        volume: 1000000 + Math.random() * 500000,
      })),
      levels: [],
    };
  }
}
