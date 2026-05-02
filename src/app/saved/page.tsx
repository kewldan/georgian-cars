"use client";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Saved = { id: number; name: string; crit: string; total: number; fresh: number; on: boolean };
const INITIAL: Saved[] = [
  { id: 1, name: "BMW X5 до $30k", crit: "BMW X5 · 2018+ · до 30 000$ · Tbilisi", total: 27, fresh: 4, on: true },
  { id: 2, name: "Электро SUV", crit: "EV · SUV · до 200 000 км · любой город", total: 14, fresh: 2, on: true },
  { id: 3, name: "Дешёвые Toyota", crit: "Toyota · до $10k · АКП · с фото", total: 41, fresh: 0, on: false },
  { id: 4, name: "Mercedes E-Class", crit: "Mercedes E-Class · 2015+ · растаможено", total: 8, fresh: 1, on: true },
];

export default function SavedPage() {
  const t = useTranslations();
  const [items, setItems] = useState<Saved[]>(INITIAL);
  const total = items.reduce((s, i) => s + i.total, 0);
  const fresh = items.reduce((s, i) => s + (i.on ? i.fresh : 0), 0);

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
        <Button>
          <Plus className="h-3.5 w-3.5" /> {t("saved.newAlert")}
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
        {items.length === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">{t("saved.empty")}</Card>
        ) : null}
        {items.map((it) => (
          <Card key={it.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3.5 px-4 py-3.5">
            <div>
              <div className="text-[15px] font-bold">{it.name}</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">{it.crit}</div>
            </div>
            <div className="text-right">
              {it.fresh > 0 && it.on ? (
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
              onClick={() => setItems((s) => s.map((x) => (x.id === it.id ? { ...x, on: !x.on } : x)))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                it.on ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              )}
            >
              <Bell className="h-3 w-3" /> {it.on ? "Telegram" : "off"}
            </button>
            <button
              type="button"
              onClick={() => setItems((s) => s.filter((x) => x.id !== it.id))}
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
