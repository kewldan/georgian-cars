"use client";
import useSWR, { useSWRConfig } from "swr";
import { api, fetcher } from "@/lib/api";

const KEY = "/favorites/ids";

export function useFavorites() {
  const { data, isLoading } = useSWR<{ ids: string[] }>(KEY, fetcher);
  const { mutate } = useSWRConfig();

  const ids = data?.ids ?? [];
  const set = new Set(ids);

  const isFav = (id: string) => set.has(id);

  const toggle = async (id: string) => {
    const wasFav = set.has(id);
    const next = wasFav ? ids.filter((x) => x !== id) : [...ids, id];
    // Optimistic update
    mutate(KEY, { ids: next }, false);
    try {
      await api(`/favorites/${id}`, { method: wasFav ? "DELETE" : "POST" });
      mutate(KEY);
      mutate("/favorites");
    } catch (e) {
      mutate(KEY);
      throw e;
    }
  };

  return { ids, isFav, toggle, isLoading };
}
