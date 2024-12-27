import {
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  calculateCCIFromLibrary,
  type MACDResult,
} from "./indicators";

const BYBIT_REST_URL = "https://api.bybit.com/v5";
const TM_API_KEY = "tm-c20bcf38-0000-43f4-ba11-abc3fe6dc00f";
const WS_URL = "wss://stream.bybit.com/v5/public/linear";

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
  chartData: Array<{
    timestamp: string;
    price?: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  levels?: Array<{
    date: string;
    level: number;
  }>;
}

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
      open: Math.random() * 1000 + 44000,
      high: Math.random() * 1000 + 45000,
      low: Math.random() * 1000 + 43000,
      close: Math.random() * 1000 + 44000,
      volume: Math.random() * 1000000,
    })),
    levels: [
      { date: "2024-01-20", level: 44500 },
      { date: "2024-01-19", level: 43000 },
    ],
  },
];

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;
let pingInterval: NodeJS.Timeout | null = null;
const latestData: { [key: string]: any } = {};

function handleKlineData(data: any) {
  if (!data.data || !Array.isArray(data.data)) return;

  const klineData = data.data[0];
  if (!klineData) return;

  const [symbol] = data.topic.split(".").slice(-1);
  if (!symbol) return;

  if (!latestData[symbol]) {
    latestData[symbol] = {};
  }
  latestData[symbol].kline = klineData;
}

function handleTickerData(data: any) {
  if (!data.data || !Array.isArray(data.data)) return;

  const tickerData = data.data[0];
  if (!tickerData) return;

  const [symbol] = data.topic.split(".").slice(-1);
  if (!symbol) return;

  if (!latestData[symbol]) {
    latestData[symbol] = {};
  }
  latestData[symbol].ticker = tickerData;
}

function initWebSocket() {
  if (ws) {
    ws.close();
  }

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectAttempts = 0;
      subscribeToSymbols();

      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ op: "ping" }));
        }
      }, 20000);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts++;
          initWebSocket();
        }, RECONNECT_DELAY);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.ret_msg === "pong" || data.success === false) return;

        if (!data || !data.data) {
          return;
        }

        if (data.topic?.includes("kline")) {
          handleKlineData(data);
        } else if (data.topic?.includes("ticker")) {
          handleTickerData(data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
  }
}

let activeSymbols = new Set([
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "XRP/USDT",
  "MOTHER/USDT",
  "AAVE/USDT",
  "ENA/USDT",
]);

const formatSymbolForDisplay = (symbol: string) =>
  symbol.includes("/") ? symbol : `${symbol.slice(0, -4)}/${symbol.slice(-4)}`;

const formatSymbolForAPI = (symbol: string) => symbol.replace("/", "");

function subscribeToSymbols() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    const symbols = Array.from(activeSymbols).map(formatSymbolForAPI);
    const intervals = ["1", "60", "240", "D"];

    intervals.forEach((interval) => {
      ws?.send(
        JSON.stringify({
          op: "subscribe",
          args: symbols.map((symbol) => `kline.${interval}.${symbol}`),
        }),
      );
    });

    ws?.send(
      JSON.stringify({
        op: "subscribe",
        args: symbols.map((symbol) => `ticker.${symbol}`),
      }),
    );
  } catch (error) {
    console.error("Error subscribing to symbols:", error);
  }
}

export const addSymbol = (symbol: string) => {
  const formattedSymbol = formatSymbolForDisplay(symbol);
  activeSymbols.add(symbol.includes("/") ? symbol : formattedSymbol);
  subscribeToSymbols();
};

export const removeSymbol = (symbol: string) => {
  activeSymbols.delete(symbol);
  if (ws && ws.readyState === WebSocket.OPEN) {
    const formattedSymbol = formatSymbolForAPI(symbol);
    ws.send(
      JSON.stringify({
        op: "unsubscribe",
        args: [`ticker.${formattedSymbol}`],
      }),
    );
  }
};

export const getActiveSymbols = () =>
  Array.from(activeSymbols).map(formatSymbolForDisplay);

async function fetchKlines(symbol: string, interval: string): Promise<any[]> {
  try {
    const formattedSymbol = formatSymbolForAPI(symbol);
    const response = await fetch(
      `${BYBIT_REST_URL}/market/kline?category=linear&symbol=${formattedSymbol}&interval=${interval}&limit=100`,
    );
    const data = await response.json();
    if (data.retCode !== 0) {
      throw new Error(data.retMsg || "Failed to fetch klines");
    }
    return data.result?.list || [];
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    return [];
  }
}

async function fetch24hTicker(symbol: string): Promise<any> {
  try {
    const formattedSymbol = formatSymbolForAPI(symbol);
    const response = await fetch(
      `${BYBIT_REST_URL}/market/tickers?category=linear&symbol=${formattedSymbol}`,
    );
    const data = await response.json();
    if (data.retCode !== 0) {
      throw new Error(data.retMsg || "Failed to fetch ticker");
    }
    return data.result?.list?.[0] || null;
  } catch (error) {
    console.error(`Error fetching ticker for ${symbol}:`, error);
    return null;
  }
}

async function fetchSupportResistanceLevels(symbol: string): Promise<any[]> {
  try {
    const baseSymbol = symbol.split("/")[0];
    const response = await fetch(
      `https://api.tokenmetrics.com/v2/resistance-support?symbol=${baseSymbol}&limit=1000&page=0`,
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
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    initWebSocket();
  }

  try {
    const symbols = getActiveSymbols();
    const cryptoData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [dailyKlines, h4Klines, h1Klines, ticker, levels] =
            await Promise.all([
              fetchKlines(symbol, "D"),
              fetchKlines(symbol, "240"),
              fetchKlines(symbol, "60"),
              fetch24hTicker(symbol),
              fetchSupportResistanceLevels(symbol),
            ]);

          if (!ticker || !dailyKlines.length) {
            throw new Error(`No data available for ${symbol}`);
          }

          // Calculate RSI for different timeframes
          const dailyPrices = dailyKlines.map((candle) =>
            parseFloat(candle[4]),
          );
          const h4Prices = h4Klines.map((candle) => parseFloat(candle[4]));
          const h1Prices = h1Klines.map((candle) => parseFloat(candle[4]));

          const dailyHighs = dailyKlines.map((candle) => parseFloat(candle[2]));
          const dailyLows = dailyKlines.map((candle) => parseFloat(candle[3]));
          const dailyCloses = dailyKlines.map((candle) =>
            parseFloat(candle[4]),
          );

          const h4Highs = h4Klines.map((candle) => parseFloat(candle[2]));
          const h4Lows = h4Klines.map((candle) => parseFloat(candle[3]));
          const h4Closes = h4Klines.map((candle) => parseFloat(candle[4]));

          const h1Highs = h1Klines.map((candle) => parseFloat(candle[2]));
          const h1Lows = h1Klines.map((candle) => parseFloat(candle[3]));
          const h1Closes = h1Klines.map((candle) => parseFloat(candle[4]));

          const rsi = {
            daily: calculateRSI(dailyPrices),
            h4: calculateRSI(h4Prices),
            h1: calculateRSI(h1Prices),
          };

          const cci = {
            daily:
              calculateCCIFromLibrary(
                { high: dailyHighs, low: dailyLows, close: dailyCloses },
                20, // Period
              ).pop() || NaN,
            h4:
              calculateCCIFromLibrary(
                { high: h4Highs, low: h4Lows, close: h4Closes },
                20,
              ).pop() || NaN,
            h1:
              calculateCCIFromLibrary(
                { high: h1Highs, low: h1Lows, close: h1Closes },
                20,
              ).pop() || NaN,
          };

          const macd = {
            daily: calculateMACD(dailyPrices),
            h4: calculateMACD(h4Prices),
            h1: calculateMACD(h1Prices),
          };

          const stochastic = calculateStochastic(
            dailyKlines.map((k) => parseFloat(k[2])).reverse(),
            dailyKlines.map((k) => parseFloat(k[3])).reverse(),
            dailyKlines.map((k) => parseFloat(k[4])).reverse(),
          );

          const chartData = h1Klines
            .map((k) => ({
              timestamp: new Date(parseInt(k[0])).toLocaleTimeString(),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5]),
            }))
            .reverse();

          return {
            id: symbol.toLowerCase().replace("/", ""),
            symbol,
            price: parseFloat(ticker.lastPrice),
            previousClose: parseFloat(ticker.prevPrice24h),
            previousWeekClose: parseFloat(dailyKlines[1]?.[4] || 0),
            change24h: parseFloat(ticker.price24hPcnt) * 100,
            volume: parseFloat(ticker.volume24h),
            rsi,
            cci,
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

    const validData = cryptoData.filter(
      (data): data is CryptoData =>
        data !== null && (!data.chartData || Array.isArray(data.chartData)),
    );

    return validData.length > 0 ? validData : defaultData;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return defaultData;
  }
}

initWebSocket();
