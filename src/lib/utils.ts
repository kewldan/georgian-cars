import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const numberFmt = new Intl.NumberFormat("en-US", { useGrouping: true, maximumFractionDigits: 0 });
const groupedSpace = (n: number) => numberFmt.format(n).replace(/,/g, " ");

export const fmt = {
  price(usd: number, currency: "USD" | "RUB", fxRates: Record<string, number>) {
    const v = Math.round(usd * (fxRates[currency] || 1));
    const sym = ({ USD: "$", RUB: "₽" } as const)[currency] || "$";
    const formatted = groupedSpace(v);
    return currency === "USD" ? `${sym}${formatted}` : `${formatted} ${sym}`;
  },
  km(n: number) {
    return groupedSpace(n);
  },
};
