"use client";
import { GitCompare, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import { FX, type Listing } from "@/lib/data";
import { ratingLabel as getRatingLabel } from "@/lib/rating";
import { useApp } from "@/lib/store";
import { fmt } from "@/lib/utils";

function CompareCol({ id, onRemove }: { id: string; onRemove: (id: string) => void }) {
  const t = useTranslations();
  const { currency } = useApp();
  const { data, isLoading } = useSWR<Listing>(`/listings/${encodeURIComponent(id)}`, fetcher);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card p-3">
        <div className="aspect-[16/10] animate-pulse rounded-sm bg-muted" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  if (!data) return null;

  const rows: Array<[string, string | number]> = [
    [t("filters.year"), data.year],
    [t("filters.mileage"), `${fmt.km(data.mileage)} ${t("card.km")}`],
    [t("filters.engine"), data.fuel === "Electric" ? "EV" : `${data.engine} L`],
    [t("filters.power"), `${data.power} ${t("card.hp")}`],
    [t("filters.fuel"), data.fuel],
    [t("filters.transmission"), data.transmission],
    [t("filters.drive"), data.drive],
    [t("filters.body"), data.body],
    [t("filters.color"), data.color],
    [t("filters.city"), data.city],
    ["VIN", data.vinChecked ? "✓" : "—"],
  ];

  return (
    <div className="flex flex-col rounded-md border border-border bg-card">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-md bg-muted">
        <Image
          src={data.photos[0]}
          alt={`${data.make} ${data.model}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={t("compare.remove")}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="border-b border-border p-3">
        <Link href={`/listing/${data.id}`} className="block">
          <div className="text-[15px] font-bold tracking-tight hover:underline">
            {data.make} {data.model}
          </div>
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant={data.priceRating}>{getRatingLabel(t, data.priceRating)}</Badge>
        </div>
        <div className="mt-2 font-mono text-xl font-extrabold tracking-tight tabular-nums">
          {fmt.price(data.price, currency, FX)}
        </div>
      </div>
      <dl className="divide-y divide-border text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{k}</dt>
            <dd className="font-mono text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CompareView() {
  const t = useTranslations();
  const sp = useSearchParams();
  const compare = useApp((s) => s.compare);
  const toggleCompare = useApp((s) => s.toggleCompare);
  const clearCompare = useApp((s) => s.clearCompare);

  // Hydrate selection from ?ids= so links from the bar are shareable.
  const urlIds = useMemo(() => {
    const raw = sp.get("ids");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [sp]);

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    for (const id of urlIds) {
      if (!compare.includes(id)) toggleCompare(id);
    }
  }, [urlIds, compare, toggleCompare]);

  const ids = compare.length ? compare : urlIds;

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-6">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight">{t("compare.title")}</h1>
        <div className="text-sm text-muted-foreground">{t("compare.empty")}</div>
        <Button asChild className="mt-4">
          <Link href="/">← {t("detail.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1640px] px-5 pb-16 pt-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <GitCompare className="h-5 w-5" />
          <h1 className="text-2xl font-extrabold tracking-tight">{t("compare.title")}</h1>
          <span className="font-mono text-xs text-muted-foreground">{t("compare.max")}</span>
        </div>
        <button
          type="button"
          onClick={clearCompare}
          className="text-[12px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground"
        >
          {t("search.clearAll")}
        </button>
      </div>

      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: `repeat(${Math.min(ids.length, 4)}, minmax(0, 1fr))` }}
      >
        {ids.map((id) => (
          <CompareCol key={id} id={id} onRemove={toggleCompare} />
        ))}
      </div>
    </div>
  );
}
