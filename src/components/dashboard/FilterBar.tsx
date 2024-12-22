import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ChevronDown, Columns, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  onColumnToggle?: (column: string) => void;
  activeColumns?: string[];
}

interface FilterState {
  marketCap: string;
  volume: string;
  technicalSignal: string;
  search: string;
}

const FilterBar = ({
  onFilterChange = () => {},
  onColumnToggle = () => {},
  activeColumns = ["price", "24hChange", "rsi", "macd", "volume"],
}: FilterBarProps) => {
  return (
    <div className="p-4 border-b bg-background flex flex-wrap gap-4 items-center justify-between w-full">
      <div className="flex flex-1 items-center gap-4 min-w-[300px]">
        <Input
          placeholder="Search cryptocurrencies..."
          className="max-w-xs"
          onChange={(e) =>
            onFilterChange({ search: e.target.value } as FilterState)
          }
        />

        <Select
          onValueChange={(value) =>
            onFilterChange({ marketCap: value } as FilterState)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Market Cap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-to-low">Highest to Lowest</SelectItem>
            <SelectItem value="low-to-high">Lowest to Highest</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            onFilterChange({ volume: value } as FilterState)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Volume" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-to-low">Highest to Lowest</SelectItem>
            <SelectItem value="low-to-high">Lowest to Highest</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            onFilterChange({ technicalSignal: value } as FilterState)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Technical Signal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullish">Bullish</SelectItem>
            <SelectItem value="bearish">Bearish</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Columns
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={activeColumns.includes("price")}
              onCheckedChange={() => onColumnToggle("price")}
            >
              Price
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeColumns.includes("24hChange")}
              onCheckedChange={() => onColumnToggle("24hChange")}
            >
              24h Change
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeColumns.includes("rsi")}
              onCheckedChange={() => onColumnToggle("rsi")}
            >
              RSI
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeColumns.includes("macd")}
              onCheckedChange={() => onColumnToggle("macd")}
            >
              MACD
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeColumns.includes("volume")}
              onCheckedChange={() => onColumnToggle("volume")}
            >
              Volume
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
