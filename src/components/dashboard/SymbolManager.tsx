import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface SymbolManagerProps {
  onAddSymbol: (symbol: string) => void;
}

export const SymbolManager = ({ onAddSymbol }: SymbolManagerProps) => {
  const [newSymbol, setNewSymbol] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleAddSymbol = () => {
    if (newSymbol) {
      const formattedSymbol = newSymbol.toUpperCase();
      const withSlash = formattedSymbol.includes("/")
        ? formattedSymbol
        : `${formattedSymbol.slice(0, -4)}/${formattedSymbol.slice(-4)}`;
      onAddSymbol(withSlash);
      setNewSymbol("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Symbol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Symbol</DialogTitle>
          <DialogDescription>
            Enter a trading pair symbol (e.g., BTC/USDT or BTCUSDT)
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter symbol..."
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
          />
          <Button onClick={handleAddSymbol}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
