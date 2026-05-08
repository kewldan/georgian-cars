"use client";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/api";

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 15_000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
