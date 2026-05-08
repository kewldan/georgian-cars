"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PALETTE_COOKIE = "gc_palette";

function writePaletteCookie(p: string) {
  if (typeof document === "undefined") return;
  // biome-ignore lint/suspicious/noDocumentCookie: simple SSR-readable preference cookie, no auth value
  document.cookie = `${PALETTE_COOKIE}=${p}; path=/; max-age=31536000; samesite=lax`;
}

export type FilterState = {
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  engineFrom?: number;
  engineTo?: number;
  powerFrom?: number;
  powerTo?: number;
  makes?: string[];
  models?: string[];
  fuels?: string[];
  trans?: string[];
  drives?: string[];
  bodies?: string[];
  cities?: string[];
  colors?: string[];
  channel?: string;
  vinOnly?: boolean;
  priceOnly?: boolean;
  bargain?: boolean;
  customsCleared?: boolean;
};

export type Currency = "USD" | "RUB" | "GEL";

export const COMPARE_LIMIT = 4;

type AppState = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  palette: "electric" | "sunset" | "azure" | "tbilisi";
  setPalette: (p: AppState["palette"]) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: AppState["viewMode"]) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (c) => set({ currency: c }),
      palette: "electric",
      setPalette: (p) => {
        writePaletteCookie(p);
        set({ palette: p });
      },
      viewMode: "grid",
      setViewMode: (v) => set({ viewMode: v }),
      compare: [],
      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((x) => x !== id) };
          if (s.compare.length >= COMPARE_LIMIT) return s;
          return { compare: [...s.compare, id] };
        }),
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "gc_app",
      onRehydrateStorage: () => (state) => {
        if (state?.palette) writePaletteCookie(state.palette);
      },
    }
  )
);
