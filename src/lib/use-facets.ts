"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type Facets = {
  makes: Record<string, string[]>;
  fuels: string[];
  transmissions: string[];
  drives: string[];
  bodies: string[];
  cities: string[];
  colors: string[];
  channels: { id: string; name: string; subs: number }[];
  ranges: {
    price: { min: number; max: number };
    year: { min: number; max: number };
    mileage: { min: number; max: number };
    engine: { min: number; max: number };
    power: { min: number; max: number };
  };
};

const FALLBACK: Facets = {
  makes: {},
  fuels: ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"],
  transmissions: ["Automatic", "Manual", "Robot", "CVT"],
  drives: ["FWD", "RWD", "AWD", "4WD"],
  bodies: ["Sedan", "SUV", "Hatchback", "Wagon", "Coupe", "Pickup", "Minivan"],
  cities: ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Gori", "Zugdidi", "Poti", "Telavi"],
  colors: ["Black", "White", "Silver", "Grey", "Blue", "Red", "Green", "Beige"],
  channels: [],
  ranges: {
    price: { min: 0, max: 0 },
    year: { min: 0, max: 0 },
    mileage: { min: 0, max: 0 },
    engine: { min: 0, max: 0 },
    power: { min: 0, max: 0 },
  },
};

export function useFacets() {
  const { data, error, isLoading, mutate } = useSWR<Facets>("/facets", fetcher, {
    dedupingInterval: 30_000,
    revalidateOnFocus: false,
  });
  return { facets: data ?? FALLBACK, isLoading, error, mutate };
}
