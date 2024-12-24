import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import ExpandedRow from "./ExpandedRow";

interface CryptoData {
  id: string;
  symbol: string;
  price: number;
  previousClose?: number;
  change24h: number;
  rsi: {
    daily: number;
    h4: number;
    h1: number;
  };
  macd: {
    daily: {
      trend: "Bullish" | "Bearish";
      crossType: "Bullish Cross" | "Bearish Cross" | null;
      currentMACD: number;
      currentSignal: number;
      currentHistogram: number;
      macdLine: number[];
      signalLine: number[];
      histogram: number[];
    };
    h4: {
      trend: "Bullish" | "Bearish";
      crossType: "Bullish Cross" | "Bearish Cross" | null;
      currentMACD: number;
      currentSignal: number;
      currentHistogram: number;
      macdLine: number[];
      signalLine: number[];
      histogram: number[];
    };
    h1: {
      trend: "Bullish" | "Bearish";
      crossType: "Bullish Cross" | "Bearish Cross" | null;
      currentMACD: number;
      currentSignal: number;
      currentHistogram: number;
      macdLine: number[];
      signalLine: number[];
      histogram: number[];
    };
  };
  stochastic: {
    k: number;
    d: number;
    signal: "Buy" | "Sell" | null;
  };
  volume: number;
  chartData: Array<{
    timestamp: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}

interface CryptoGridProps {
  data?: CryptoData[];
}

const defaultData: CryptoData[] = [
  {
    id: "1",
    symbol: "BTC/USD",
    price: 45000,
    previousClose: 44000,
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
  },
  {
    id: "2",
    symbol: "ETH/USD",
    price: 2800,
    previousClose: 2850,
    change24h: -1.2,
    rsi: {
      daily: 45,
      h4: 52,
      h1: 48,
    },
    macd: {
      daily: {
        trend: "Bearish",
        crossType: "Bearish Cross",
        currentMACD: -45.2,
        currentSignal: -32.5,
        currentHistogram: -12.7,
        macdLine: [],
        signalLine: [],
        histogram: [],
      },
      h4: {
        trend: "Bearish",
        crossType: null,
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
  },
];

const CryptoGrid = ({ data = defaultData }: CryptoGridProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="w-full h-full bg-background p-4 space-y-4 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead>RSI (1H)</TableHead>
            <TableHead>MACD (D)</TableHead>
            <TableHead>Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((crypto) => (
            <React.Fragment key={crypto.id}>
              <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  setExpandedRow(expandedRow === crypto.id ? null : crypto.id)
                }
              >
                <TableCell>
                  {expandedRow === crypto.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{crypto.symbol}</TableCell>
                <TableCell>
                  $
                  {crypto.price < 0.01
                    ? crypto.price.toFixed(8)
                    : crypto.price < 1
                    ? crypto.price.toFixed(4)
                    : crypto.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor:
                        crypto.change24h >= 0
                          ? "hsl(var(--bullish))"
                          : "hsl(var(--destructive))",
                      color:
                        crypto.change24h >= 0
                          ? "hsl(var(--bullish-foreground))"
                          : "hsl(var(--destructive-foreground))",
                    }}
                  >
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      crypto.rsi.h1 > 70
                        ? "bg-red-500 text-white"
                        : crypto.rsi.h1 < 30
                        ? "bg-blue-300 text-black"
                        : "bg-gray-300 text-black"
                    }
                  >
                    {crypto.rsi.h1.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      crypto.macd.daily.trend === "Bullish"
                        ? "bg-blue-300 text-black"
                        : "bg-red-500 text-white"
                    }
                  >
                    {crypto.macd.daily.crossType || crypto.macd.daily.trend}
                  </Badge>
                </TableCell>
                <TableCell>${crypto.volume.toLocaleString()}</TableCell>
              </TableRow>
              {expandedRow === crypto.id && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div className="p-4">
                      <ExpandedRow {...crypto} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoGrid;
