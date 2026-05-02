"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
};

type AppState = {
  favorites: string[];
  toggleFav: (id: string) => void;
  currency: "USD" | "RUB";
  setCurrency: (c: "USD" | "RUB") => void;
  palette: "electric" | "sunset" | "azure" | "tbilisi";
  setPalette: (p: AppState["palette"]) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: AppState["viewMode"]) => void;
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFav: (id) =>
        set((st) => ({
          favorites: st.favorites.includes(id) ? st.favorites.filter((x) => x !== id) : [...st.favorites, id],
        })),
      currency: "USD",
      setCurrency: (c) => set({ currency: c }),
      palette: "electric",
      setPalette: (p) => set({ palette: p }),
      viewMode: "grid",
      setViewMode: (v) => set({ viewMode: v }),
    }),
    { name: "gc_app" }
  )
);
