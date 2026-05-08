"use client";
import { Bell, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR, { useSWRConfig } from "swr";
import { SwrError } from "@/components/swr-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, fetcher } from "@/lib/api";
import type { FilterState } from "@/lib/store";
import { cn } from "@/lib/utils";

type Saved = {
  id: string;
  name: string;
  crit: string;
  filters: FilterState;
  notify: boolean;
  total: number;
  fresh: number;
  lastMatchAt: string | null;
};

const KEY = "/saved-searches";

export default function SavedPage() {
  const t = useTranslations();
  const { data, error, isLoading, mutate: mutateSelf } = useSWR<{ items: Saved[] }>(KEY, fetcher);
  const { mutate } = useSWRConfig();
  const items = data?.items ?? [];
  const total = items.reduce((s, i) => s + i.total, 0);
  const fresh = items.reduce((s, i) => s + (i.notify ? i.fresh : 0), 0);

  const toggleNotify = async (it: Saved) => {
    mutate(KEY, { items: items.map((x) => (x.id === it.id ? { ...x, notify: !x.notify } : x)) }, false);
    try {
      await api(`${KEY}/${it.id}`, { method: "PATCH", body: JSON.stringify({ notify: !it.notify }) });
      mutate(KEY);
    } catch {
      mutate(KEY);
    }
  };

  const remove = async (it: Saved) => {
    mutate(KEY, { items: items.filter((x) => x.id !== it.id) }, false);
    try {
      await api(`${KEY}/${it.id}`, { method: "DELETE" });
      mutate(KEY);
    } catch {
      mutate(KEY);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-4">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-extrabold tabular-nums">{items.length}</span>
            <span className="text-[13px] text-muted-foreground">{t("saved.title").toLowerCase()}</span>
          </div>
          <div className="mt-1 max-w-md text-xs text-muted-foreground">{t("saved.desc")}</div>
        </div>
        <Button asChild>
          <Link href="/">{t("saved.newAlert")} →</Link>
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3.5">
        <Card className="p-4">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("saved.matches")}
          </div>
          <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight">{total}</div>
        </Card>
        <Card className="bg-accent text-accent-foreground p-4 border-accent">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
            {t("saved.newToday")}
          </div>
          <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight">{fresh}</div>
        </Card>
      </div>

      <div className="grid gap-3">
        {error && items.length === 0 ? (
          <SwrError error={error} onRetry={() => mutateSelf()} />
        ) : isLoading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
              key={i}
              className="h-[68px] animate-pulse"
            />
          ))
        ) : items.length === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">{t("saved.empty")}</Card>
        ) : null}
        {items.map((it) => (
          <Card key={it.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3.5 px-4 py-3.5">
            <div>
              <div className="text-[15px] font-bold">{it.name}</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">{it.crit}</div>
            </div>
            <div className="text-right">
              {it.fresh > 0 && it.notify ? (
                <span className="inline-block rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-accent-foreground">
                  +{it.fresh} {t("saved.newToday")}
                </span>
              ) : null}
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {it.total} {t("saved.matches")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleNotify(it)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                it.notify ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              )}
            >
              <Bell className="h-3 w-3" /> {it.notify ? "Telegram" : "off"}
            </button>
            <button
              type="button"
              onClick={() => remove(it)}
              aria-label={t("saved.delete")}
              title={t("saved.delete")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
