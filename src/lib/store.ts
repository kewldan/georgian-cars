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
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  search: string;
  setSearch: (s: string) => void;
  sort: string;
  setSort: (s: string) => void;
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
      filters: {},
      setFilters: (f) => set({ filters: f }),
      search: "",
      setSearch: (s) => set({ search: s }),
      sort: "newest",
      setSort: (s) => set({ sort: s }),
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
