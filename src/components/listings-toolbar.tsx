"use client";
import { Grid, List as ListIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useApp } from "@/lib/store";

export function ListingsToolbar({ count }: { count: number }) {
  const t = useTranslations();
  const { sort, setSort, viewMode, setViewMode, search, setSearch } = useApp();
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-extrabold tracking-tight tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-[13px] text-muted-foreground">{t("search.results")}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-64 hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search.placeholder")}
            className="pl-8"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("sort.newest")}</SelectItem>
            <SelectItem value="best_deal">{t("sort.best_deal")}</SelectItem>
            <SelectItem value="cheap">{t("sort.cheap")}</SelectItem>
            <SelectItem value="expensive">{t("sort.expensive")}</SelectItem>
            <SelectItem value="mileage_asc">{t("sort.mileage_asc")}</SelectItem>
            <SelectItem value="year_desc">{t("sort.year_desc")}</SelectItem>
            <SelectItem value="year_asc">{t("sort.year_asc")}</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "grid" | "list")}>
          <ToggleGroupItem value="grid">
            <Grid className="h-3 w-3" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <ListIcon className="h-3 w-3" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
