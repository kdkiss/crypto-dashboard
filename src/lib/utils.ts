import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SMA } from 'trading-signals';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Example function to calculate SMA
 */
export function calculateSMA(data: number[], period: number): string {
  const sma = new SMA(period);

  data.forEach((value) => sma.update(value));

  return sma.getResult().toFixed(2); // Returns SMA result as a string
}
