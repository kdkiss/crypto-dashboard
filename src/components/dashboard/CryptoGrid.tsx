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
  change24h: number;
  rsi: number;
  trend: "Bullish" | "Bearish";
  crossType: "Bullish Cross" | "Bearish Cross" | null;
  volume: number;
  chartData: Array<{
    timestamp: string;
    price: number;
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
    change24h: 2.5,
    rsi: 65,
    trend: "Bullish",
    crossType: null,
    volume: 1000000,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      price: Math.random() * 1000 + 44000,
    })),
  },
  {
    id: "2",
    symbol: "ETH/USD",
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
  },
  {
    id: "3",
    symbol: "SOL/USD",
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
            <TableHead>RSI</TableHead>
            <TableHead>MACD</TableHead>
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
                <TableCell>${crypto.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={crypto.change24h >= 0 ? "default" : "destructive"}
                  >
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      crypto.rsi > 70
                        ? "destructive"
                        : crypto.rsi < 30
                          ? "default"
                          : "secondary"
                    }
                  >
                    {crypto.rsi}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      crypto.trend === "Bullish" ? "default" : "destructive"
                    }
                  >
                    {crypto.crossType ? crypto.crossType : crypto.trend}
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
