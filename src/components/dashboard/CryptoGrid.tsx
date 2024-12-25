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
import { CryptoData } from "@/lib/api";

interface CryptoGridProps {
  data?: CryptoData[];
  onRemoveSymbol?: (symbol: string) => void;
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
      price: Math.random() * 1000 + 44000,
      open: Math.random() * 1000 + 44000,
      high: Math.random() * 1000 + 45000,
      low: Math.random() * 1000 + 43000,
      close: Math.random() * 1000 + 44000,
    })),
  },
];

const CryptoGrid = ({
  data = defaultData,
  onRemoveSymbol,
}: CryptoGridProps) => {
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
            <TableHead>RSI (D)</TableHead>
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
                    className={
                      crypto.change24h >= 0
                        ? "bg-blue-400 hover:bg-blue-500 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }
                  >
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      crypto.rsi?.daily > 70
                        ? "bg-red-500 text-white"
                        : crypto.rsi?.daily < 30
                          ? "bg-blue-400 text-white"
                          : "bg-gray-300 text-black"
                    }
                  >
                    {crypto.rsi?.daily.toFixed(2) ?? "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      crypto.macd?.daily.trend === "Bullish"
                        ? "bg-blue-400 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {crypto.macd?.daily.crossType ||
                      crypto.macd?.daily.trend ||
                      "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>${crypto.volume.toLocaleString()}</TableCell>
              </TableRow>
              {expandedRow === crypto.id && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div className="p-4">
                      <ExpandedRow
                        {...crypto}
                        onRemoveSymbol={onRemoveSymbol}
                      />
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
