import React from "react";
import FilterBar from "@/components/dashboard/FilterBar";
import CryptoGrid from "@/components/dashboard/CryptoGrid";
import {
  fetchCryptoData,
  type CryptoData,
  addSymbol,
  removeSymbol,
} from "@/lib/api";
import { SymbolManager } from "@/components/dashboard/SymbolManager";

interface HomeProps {
  initialFilters?: {
    marketCap?: string;
    volume?: string;
    technicalSignal?: string;
    search?: string;
  };
  activeColumns?: string[];
}

const Home = ({
  initialFilters = {},
  activeColumns = ["price", "24hChange", "rsi", "macd", "volume"],
}: HomeProps) => {
  const [filters, setFilters] = React.useState(initialFilters);
  const [visibleColumns, setVisibleColumns] = React.useState(activeColumns);
  const [cryptoData, setCryptoData] = React.useState<CryptoData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const handleAddSymbol = (symbol: string) => {
    addSymbol(symbol);
    // Trigger a data refresh
    fetchData();
  };

  const handleRemoveSymbol = (symbol: string) => {
    removeSymbol(symbol);
    // Trigger a data refresh
    fetchData();
  };

  const fetchData = async () => {
    try {
      const data = await fetchCryptoData();
      setCryptoData(
        data.filter((item): item is CryptoData =>
          Array.isArray(item.chartData),
        ),
      );
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []); // Only run on mount

  const handleFilterChange = (newFilters: typeof initialFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column],
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">Crypto Scanner Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col">
        <div className="py-4 flex justify-between items-center">
          <FilterBar
            onFilterChange={handleFilterChange}
            onColumnToggle={handleColumnToggle}
            activeColumns={visibleColumns}
          />
          <SymbolManager onAddSymbol={handleAddSymbol} />
        </div>
        <div className="flex-1">
          <CryptoGrid data={cryptoData} onRemoveSymbol={handleRemoveSymbol} />
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-4 text-sm text-muted-foreground">
          <p>
            Data updates every 30 seconds. All times are in your local timezone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
