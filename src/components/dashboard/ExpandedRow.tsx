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

interface ExpandedRowProps {
  symbol?: string;
  price?: number;
  change24h?: number;
  rsi?: {
    daily: number;
    h4: number;
    h1: number;
  };
  trend?: "Bullish" | "Bearish";
  crossType?: "Bullish Cross" | "Bearish Cross" | null;
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

const RSIIndicator = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-1">
    <h4 className="font-medium">{label}</h4>
    <div className="text-xl">{value}</div>
    <Badge
      variant={
        value > 70 ? "destructive" : value < 30 ? "default" : "secondary"
      }
    >
      {value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral"}
    </Badge>
  </div>
);

const ExpandedRow = ({
  symbol = "BTC/USD",
  price = 45000,
  change24h = 2.5,
  rsi = { daily: 65, h4: 55, h1: 45 },
  trend = "Bullish",
  crossType = null,
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
          <p className="text-sm">Open: ${data.open?.toLocaleString()}</p>
          <p className="text-sm">High: ${data.high?.toLocaleString()}</p>
          <p className="text-sm">Low: ${data.low?.toLocaleString()}</p>
          <p className="text-sm">Close: ${data.close?.toLocaleString()}</p>
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
              <Badge variant={change24h >= 0 ? "default" : "destructive"}>
                {change24h >= 0 ? "+" : ""}
                {change24h}%
              </Badge>
              <Badge variant="outline">
                Volume: ${volume.toLocaleString()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${price.toLocaleString()}</div>
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
              <div className="space-y-2">
                <h4 className="font-medium">MACD Signal</h4>
                <div className="text-xl">{trend}</div>
                <div className="space-x-2">
                  <Badge
                    variant={trend === "Bullish" ? "default" : "destructive"}
                  >
                    {crossType || trend}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="levels">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Nearest Resistance</h4>
                  <div className="text-xl text-destructive">
                    $
                    {nearestResistance
                      ? nearestResistance.level.toLocaleString()
                      : "N/A"}
                  </div>
                  {nearestResistance && (
                    <Badge variant="outline">{nearestResistance.date}</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Nearest Support</h4>
                  <div className="text-xl text-green-500">
                    $
                    {nearestSupport
                      ? nearestSupport.level.toLocaleString()
                      : "N/A"}
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
                        stroke="#22c55e"
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
