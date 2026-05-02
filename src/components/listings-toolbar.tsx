"use client";
import { Grid, List as ListIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { MobileFiltersButton } from "@/components/filters-panel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useListingsParams } from "@/lib/listings-params";
import { useApp } from "@/lib/store";

export function ListingsToolbar({ count }: { count: number }) {
  const t = useTranslations();
  const { viewMode, setViewMode } = useApp();
  const { sort, setSort, search, setSearch } = useListingsParams();

  // Local input state so typing stays snappy; commit to the URL after a pause.
  const [searchDraft, setSearchDraft] = useState(search);
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);
  const commitSearch = useDebouncedCallback((value: string) => setSearch(value), 250);

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg sm:text-[22px] font-extrabold tracking-tight tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-xs sm:text-[13px] text-muted-foreground">{t("search.results")}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64 hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchDraft}
            onChange={(e) => {
              setSearchDraft(e.target.value);
              commitSearch(e.target.value);
            }}
            placeholder={t("search.placeholder")}
            className="pl-8"
          />
        </div>
        <MobileFiltersButton />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[170px] sm:w-[200px]">
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
