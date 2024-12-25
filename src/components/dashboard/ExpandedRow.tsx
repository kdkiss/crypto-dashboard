import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { MACDResult } from "@/lib/indicators";

interface ExpandedRowProps {
  symbol?: string;
  price?: number;
  change24h?: number;
  previousClose?: number;
  previousWeekClose?: number;
  rsi?: {
    daily: number;
    h4: number;
    h1: number;
  };
  macd?: {
    daily: MACDResult;
    h4: MACDResult;
    h1: MACDResult;
  };
  stochastic?: {
    k: number;
    d: number;
    signal: "Buy" | "Sell" | null;
  };
  volume?: number;
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

const defaultChartData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  price: Math.random() * 1000 + 20000,
  open: Math.random() * 1000 + 20000,
  high: Math.random() * 1000 + 21000,
  low: Math.random() * 1000 + 19000,
  close: Math.random() * 1000 + 20000,
}));

const formatPrice = (price: number) => {
  if (price < 0.01) return price.toFixed(8);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString();
};

const RSIIndicator = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-1">
    <h4 className="font-medium">{label}</h4>
    <div className="text-xl">{value.toFixed(2)}</div>
    <Badge
      className={
        value > 70
          ? "bg-red-500 text-white"
          : value < 30
            ? "bg-blue-400 text-white"
            : "bg-gray-300 text-black"
      }
    >
      {value.toFixed(2)} -{" "}
      {value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral"}
    </Badge>
  </div>
);

const MACDIndicator = ({
  data,
  label,
}: {
  data: MACDResult;
  label: string;
}) => (
  <div className="space-y-1">
    <h4 className="font-medium">{label}</h4>
    <Badge
      className={
        data.trend === "Bullish"
          ? "bg-blue-400 text-white"
          : "bg-red-500 text-white"
      }
    >
      {data.crossType || data.trend}
    </Badge>
  </div>
);

const StochasticIndicator = ({
  k,
  d,
  signal,
}: {
  k: number;
  d: number;
  signal: "Buy" | "Sell" | null;
}) => (
  <div className="space-y-2">
    <h4 className="font-medium">Stochastic Daily (14,3,3)</h4>
    <div className="flex space-x-4">
      <div>
        <div className="text-sm text-muted-foreground">%K</div>
        <div className="text-xl">{k.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">%D</div>
        <div className="text-xl">{d.toFixed(2)}</div>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Badge
        className={
          k > 80
            ? "bg-red-500 text-white"
            : k < 20
              ? "bg-blue-400 text-white"
              : "bg-gray-300 text-black"
        }
      >
        {k > 80 ? "Overbought" : k < 20 ? "Oversold" : "Neutral"}
      </Badge>
      {signal && (
        <Badge
          className={
            signal === "Buy"
              ? "bg-blue-400 text-white"
              : "bg-red-500 text-white"
          }
        >
          {signal} Signal
        </Badge>
      )}
    </div>
  </div>
);

const ExpandedRow = ({
  symbol = "BTC/USD",
  price = 45000,
  change24h = 2.5,
  previousClose = 44000,
  previousWeekClose = 43500,
  rsi = { daily: 65, h4: 55, h1: 45 },
  macd = {
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
  stochastic = { k: 65, d: 60, signal: null },
  volume = 1000000,
  chartData = defaultChartData,
  levels = [],
}: ExpandedRowProps) => {
  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
  const currentPrice = price;
  const nearestSupport = sortedLevels
    .reverse()
    .find((l) => l.level < currentPrice);
  const nearestResistance = sortedLevels.find((l) => l.level > currentPrice);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-2 shadow-lg">
          <p className="text-sm font-medium">{data.timestamp}</p>
          <p className="text-sm">Open: ${formatPrice(data.open)}</p>
          <p className="text-sm">High: ${formatPrice(data.high)}</p>
          <p className="text-sm">Low: ${formatPrice(data.low)}</p>
          <p className="text-sm">Close: ${formatPrice(data.close)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background border rounded-lg w-full">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{symbol}</h3>
            <div className="flex space-x-2">
              <Badge
                className={
                  change24h >= 0
                    ? "bg-blue-400 hover:bg-blue-500 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {change24h >= 0 ? "+" : ""}
                {change24h}%
              </Badge>
              <Badge
                className={
                  price >= previousClose
                    ? "bg-blue-400 text-white"
                    : "bg-red-500 text-white"
                }
              >
                Daily Close: ${formatPrice(previousClose)}
                <span className="ml-1 text-xs">
                  (
                  {(((price - previousClose) / previousClose) * 100).toFixed(2)}
                  %)
                </span>
              </Badge>
              <Badge
                className={
                  price >= previousWeekClose
                    ? "bg-blue-400 text-white"
                    : "bg-red-500 text-white"
                }
              >
                Weekly Close: ${formatPrice(previousWeekClose)}
                <span className="ml-1 text-xs">
                  (
                  {(
                    ((price - previousWeekClose) / previousWeekClose) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </Badge>
              <Badge variant="outline">
                Volume: ${volume.toLocaleString()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${formatPrice(price)}</div>
          </div>
        </div>

        <Tabs defaultValue="price" className="w-full">
          <TabsList>
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  stroke="#3b82f6"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="indicators">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <RSIIndicator value={rsi.daily} label="RSI (Daily)" />
                <RSIIndicator value={rsi.h4} label="RSI (4H)" />
                <RSIIndicator value={rsi.h1} label="RSI (1H)" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <MACDIndicator data={macd.daily} label="MACD (Daily)" />
                <MACDIndicator data={macd.h4} label="MACD (4H)" />
                <MACDIndicator data={macd.h1} label="MACD (1H)" />
              </div>
              <StochasticIndicator {...stochastic} />
            </div>
          </TabsContent>

          <TabsContent value="levels">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Nearest Resistance</h4>
                  <div className="text-xl text-red-500">
                    $
                    {nearestResistance
                      ? formatPrice(nearestResistance.level)
                      : "N/A"}
                  </div>
                  {nearestResistance && (
                    <Badge variant="outline">{nearestResistance.date}</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Nearest Support</h4>
                  <div className="text-xl text-blue-400">
                    $
                    {nearestSupport ? formatPrice(nearestSupport.level) : "N/A"}
                  </div>
                  {nearestSupport && (
                    <Badge variant="outline">{nearestSupport.date}</Badge>
                  )}
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="close"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      stroke="#3b82f6"
                    />
                    {nearestSupport && (
                      <ReferenceLine
                        y={nearestSupport.level}
                        stroke="#60a5fa"
                        strokeDasharray="3 3"
                        label="Support"
                      />
                    )}
                    {nearestResistance && (
                      <ReferenceLine
                        y={nearestResistance.level}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label="Resistance"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default ExpandedRow;
