import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const numberFmt = new Intl.NumberFormat("en-US", { useGrouping: true, maximumFractionDigits: 0 });
const groupedSpace = (n: number) => numberFmt.format(n).replace(/,/g, " ");

const CURRENCY_SYMBOL = { USD: "$", RUB: "₽", GEL: "₾" } as const;
type CurrencyCode = keyof typeof CURRENCY_SYMBOL;

export const fmt = {
  price(usd: number, currency: CurrencyCode, fxRates: Record<string, number>) {
    const v = Math.round(usd * (fxRates[currency] || 1));
    const sym = CURRENCY_SYMBOL[currency] ?? "$";
    const formatted = groupedSpace(v);
    return currency === "USD" ? `${sym}${formatted}` : `${formatted} ${sym}`;
  },
  km(n: number) {
    return groupedSpace(n);
  },
};
