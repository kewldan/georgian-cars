"use client";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gc_recent";
const MAX = 20;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

const subs = new Set<(ids: string[]) => void>();
function broadcast(ids: string[]) {
  for (const fn of subs) fn(ids);
}

export function useRecentIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const fn = (next: string[]) => setIds(next);
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  }, []);

  const push = useCallback((id: string) => {
    const cur = read();
    const next = [id, ...cur.filter((x) => x !== id)].slice(0, MAX);
    write(next);
    broadcast(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    broadcast([]);
  }, []);

  return { ids, push, clear };
}
