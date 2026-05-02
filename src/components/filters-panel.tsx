"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BODIES, CITIES, COLORS, DRIVES, FUELS, MAKES, TG_CHANNELS, TRANSMISSIONS } from "@/lib/data";
import { type FilterState, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

function FilterGroup({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0">
      <h4 className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
        {count != null && count > 0 ? <span className="font-mono font-medium text-foreground/60">{count}</span> : null}
      </h4>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const set = new Set(value);
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const on = set.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              const ns = new Set(set);
              if (on) ns.delete(opt);
              else ns.add(opt);
              onChange([...ns]);
            }}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Range({
  from,
  to,
  onFrom,
  onTo,
  fromPh,
  toPh,
}: {
  from?: number;
  to?: number;
  onFrom: (v?: number) => void;
  onTo: (v?: number) => void;
  fromPh: string;
  toPh: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <Input
        type="number"
        placeholder={fromPh}
        value={from ?? ""}
        onChange={(e) => onFrom(e.target.value === "" ? undefined : +e.target.value)}
      />
      <Input
        type="number"
        placeholder={toPh}
        value={to ?? ""}
        onChange={(e) => onTo(e.target.value === "" ? undefined : +e.target.value)}
      />
    </div>
  );
}

function FiltersBody({ showHeader = true }: { showHeader?: boolean }) {
  const t = useTranslations();
  const { filters, setFilters } = useApp();
  const f = filters;
  const upd = (patch: Partial<FilterState>) => setFilters({ ...f, ...patch });

  const allMakes = useMemo(() => Object.keys(MAKES).sort(), []);
  const modelOptions = useMemo(() => (f.makes || []).flatMap((m) => MAKES[m] || []), [f.makes]);

  return (
    <div className="px-3.5 pb-6 pt-3.5">
      {showHeader ? (
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-wider">{t("filters.title")}</h3>
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-[11px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors"
          >
            {t("filters.reset")}
          </button>
        </div>
      ) : null}

      <FilterGroup title={t("filters.price")}>
        <Range
          from={f.priceFrom}
          to={f.priceTo}
          onFrom={(v) => upd({ priceFrom: v })}
          onTo={(v) => upd({ priceTo: v })}
          fromPh={t("filters.from")}
          toPh={t("filters.to")}
        />
      </FilterGroup>

      <FilterGroup title={t("filters.year")}>
        <Range
          from={f.yearFrom}
          to={f.yearTo}
          onFrom={(v) => upd({ yearFrom: v })}
          onTo={(v) => upd({ yearTo: v })}
          fromPh="2005"
          toPh="2025"
        />
      </FilterGroup>

      <FilterGroup title={t("filters.mileage")}>
        <Range
          from={f.mileageFrom}
          to={f.mileageTo}
          onFrom={(v) => upd({ mileageFrom: v })}
          onTo={(v) => upd({ mileageTo: v })}
          fromPh="0"
          toPh="300000"
        />
      </FilterGroup>

      <FilterGroup title={t("filters.make")} count={(f.makes || []).length}>
        <Select
          value=""
          onValueChange={(v) => {
            if (!v) return;
            const cur = f.makes || [];
            if (!cur.includes(v)) upd({ makes: [...cur, v] });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`${t("filters.any")}…`} />
          </SelectTrigger>
          <SelectContent>
            {allMakes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(f.makes || []).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {f.makes?.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => upd({ makes: f.makes?.filter((x) => x !== m) })}
                className="rounded-full border border-primary bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
              >
                {m} ×
              </button>
            ))}
          </div>
        )}
      </FilterGroup>

      {modelOptions.length > 0 && (
        <FilterGroup title={t("filters.model")} count={(f.models || []).length}>
          <Chips options={modelOptions} value={f.models || []} onChange={(v) => upd({ models: v })} />
        </FilterGroup>
      )}

      <FilterGroup title={t("filters.engine")}>
        <Range
          from={f.engineFrom}
          to={f.engineTo}
          onFrom={(v) => upd({ engineFrom: v })}
          onTo={(v) => upd({ engineTo: v })}
          fromPh="1.0"
          toPh="5.0"
        />
      </FilterGroup>

      <FilterGroup title={t("filters.power")}>
        <Range
          from={f.powerFrom}
          to={f.powerTo}
          onFrom={(v) => upd({ powerFrom: v })}
          onTo={(v) => upd({ powerTo: v })}
          fromPh="80"
          toPh="500"
        />
      </FilterGroup>

      <FilterGroup title={t("filters.fuel")}>
        <Chips options={FUELS} value={f.fuels || []} onChange={(v) => upd({ fuels: v })} />
      </FilterGroup>
      <FilterGroup title={t("filters.transmission")}>
        <Chips options={TRANSMISSIONS} value={f.trans || []} onChange={(v) => upd({ trans: v })} />
      </FilterGroup>
      <FilterGroup title={t("filters.drive")}>
        <Chips options={DRIVES} value={f.drives || []} onChange={(v) => upd({ drives: v })} />
      </FilterGroup>
      <FilterGroup title={t("filters.body")}>
        <Chips options={BODIES} value={f.bodies || []} onChange={(v) => upd({ bodies: v })} />
      </FilterGroup>
      <FilterGroup title={t("filters.city")}>
        <Chips options={CITIES} value={f.cities || []} onChange={(v) => upd({ cities: v })} />
      </FilterGroup>
      <FilterGroup title={t("filters.color")}>
        <Chips options={COLORS} value={f.colors || []} onChange={(v) => upd({ colors: v })} />
      </FilterGroup>

      <FilterGroup title={t("filters.source")}>
        <Select value={f.channel || "any"} onValueChange={(v) => upd({ channel: v === "any" ? undefined : v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("filters.any")}</SelectItem>
            {TG_CHANNELS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="">
        <label htmlFor="filter-vin-only" className="flex items-center gap-2 py-1 text-xs cursor-pointer">
          <Checkbox id="filter-vin-only" checked={!!f.vinOnly} onCheckedChange={(v) => upd({ vinOnly: !!v })} />
          {t("filters.vin")}
        </label>
        <label htmlFor="filter-price-only" className="flex items-center gap-2 py-1 text-xs cursor-pointer">
          <Checkbox id="filter-price-only" checked={!!f.priceOnly} onCheckedChange={(v) => upd({ priceOnly: !!v })} />
          {t("filters.withPrice")}
        </label>
      </FilterGroup>
    </div>
  );
}

export function FiltersPanel() {
  return (
    <aside className="sticky top-[53px] hidden h-[calc(100vh-53px)] w-[280px] shrink-0 border-r border-border bg-card lg:block">
      <ScrollArea className="h-full">
        <FiltersBody />
      </ScrollArea>
    </aside>
  );
}

export function MobileFiltersButton() {
  const t = useTranslations();
  const { filters, setFilters } = useApp();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-semibold hover:border-foreground/40 hover:bg-secondary transition-colors lg:hidden"
          aria-label={t("filters.title")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t("filters.title")}</span>
          {activeCount > 0 ? (
            <span className="font-mono text-[10px] font-bold rounded-full bg-accent text-accent-foreground px-1.5">
              {activeCount}
            </span>
          ) : null}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-[60] flex w-full max-w-[340px] flex-col border-l border-border bg-card shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
            <Dialog.Title className="text-[13px] font-bold uppercase tracking-wider">{t("filters.title")}</Dialog.Title>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilters({})}
                className="text-[11px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors"
              >
                {t("filters.reset")}
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <FiltersBody showHeader={false} />
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function countActiveFilters(f: FilterState) {
  let n = 0;
  if (f.priceFrom != null || f.priceTo != null) n++;
  if (f.yearFrom != null || f.yearTo != null) n++;
  if (f.mileageFrom != null || f.mileageTo != null) n++;
  if (f.engineFrom != null || f.engineTo != null) n++;
  if (f.powerFrom != null || f.powerTo != null) n++;
  if (f.makes?.length) n++;
  if (f.models?.length) n++;
  if (f.fuels?.length) n++;
  if (f.trans?.length) n++;
  if (f.drives?.length) n++;
  if (f.bodies?.length) n++;
  if (f.cities?.length) n++;
  if (f.colors?.length) n++;
  if (f.channel) n++;
  if (f.vinOnly) n++;
  if (f.priceOnly) n++;
  return n;
}
