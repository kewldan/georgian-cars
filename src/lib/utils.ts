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

// next/image needs an absolute URL for backend-served paths so the optimizer
// fetches them via the public host (in prod that's cars.kewldan.ru, dev is
// localhost). Backend returns paths like "/api/images/123.webp"; we prepend
// NEXT_PUBLIC_SITE_URL when missing a scheme.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function photoSrc(src: string): string {
  if (!src) return src;
  if (/^(https?:|data:)/.test(src)) return src;
  if (src.startsWith("/")) return `${SITE_URL}${src}`;
  return src;
}
