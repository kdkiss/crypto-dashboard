import { calculateRSI, calculateMACD } from "./indicators";

const BINANCE_REST_URL = "https://api.binance.com/api/v3";
const TM_API_KEY = "tm-c20bcf38-0000-43f4-ba11-abc3fe6dc00f";

export interface CryptoData {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  rsi: number;
  trend: "Bullish" | "Bearish";
  crossType: "Bullish Cross" | "Bearish Cross" | null;
  volume: number;
  chartData?: Array<{
    timestamp: string;
    price: number;
  }>;
  levels?: Array<{
    date: string;
    level: number;
  }>;
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];

const defaultData: CryptoData[] = [
  {
    id: "btcusdt",
    symbol: "BTC/USDT",
    price: 45000,
    change24h: 2.5,
    rsi: 65,
    trend: "Bullish",
    crossType: null,
    volume: 1000000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 1000 + 44000,
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
    change24h: -1.2,
    rsi: 45,
    trend: "Bearish",
    crossType: "Bearish Cross",
    volume: 500000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 100 + 2750,
    })),
    levels: [
      { date: "2024-03-20", level: 2700 },
      { date: "2024-03-20", level: 2900 },
      { date: "2024-03-20", level: 2600 },
      { date: "2024-03-20", level: 3000 },
    ],
  },
  {
    id: "solusdt",
    symbol: "SOL/USDT",
    price: 120,
    change24h: 5.8,
    rsi: 72,
    trend: "Bullish",
    crossType: "Bullish Cross",
    volume: 200000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 10 + 115,
    })),
    levels: [
      { date: "2024-03-20", level: 115 },
      { date: "2024-03-20", level: 125 },
      { date: "2024-03-20", level: 110 },
      { date: "2024-03-20", level: 130 },
    ],
  },
];

async function fetchKlines(symbol: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${BINANCE_REST_URL}/klines?symbol=${symbol}&interval=1h&limit=100`,
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
          const [klines, ticker, levels] = await Promise.all([
            fetchKlines(symbol),
            fetch24hTicker(symbol),
            fetchSupportResistanceLevels(symbol.slice(0, -4)),
          ]);

          if (!klines.length || !ticker) {
            throw new Error(`No data available for ${symbol}`);
          }

          const prices = klines.map((candle) => parseFloat(candle[4])); // Close prices
          const rsi = calculateRSI(prices);
          const macdResult = calculateMACD(prices);

          const chartData = klines.map((candle) => ({
            timestamp: new Date(candle[0]).toLocaleTimeString(),
            price: parseFloat(candle[4]), // Keep for compatibility
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
          }));

          return {
            id: symbol.toLowerCase(),
            symbol: symbol.slice(0, -4) + "/" + symbol.slice(-4),
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.volume),
            rsi,
            trend: macdResult.trend,
            crossType: macdResult.crossType,
            chartData,
            levels,
          };
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error);
          return (
            defaultData.find((d) => d.id === symbol.toLowerCase()) ||
            defaultData[0]
          );
        }
      }),
    );

    return cryptoData.filter(Boolean);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return defaultData;
  }
}

export async function fetchCoinHistory(symbol: string): Promise<any> {
  try {
    const formattedSymbol = symbol.replace("/", "");
    const [klines, levels] = await Promise.all([
      fetchKlines(formattedSymbol),
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
