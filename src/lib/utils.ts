import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = {
  price(usd: number, currency: "USD" | "RUB", fxRates: Record<string, number>) {
    const v = Math.round(usd * (fxRates[currency] || 1));
    const sym = ({ USD: "$", RUB: "₽" } as const)[currency] || "$";
    const formatted = v.toLocaleString("en-US").replace(/,/g, " ");
    return currency === "USD" ? `${sym}${formatted}` : `${formatted} ${sym}`;
  },
  km(n: number) {
    return n.toLocaleString("en-US").replace(/,/g, " ");
  },
};
