"use client";
import { GitCompare, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export function CompareBar() {
  const t = useTranslations();
  const compare = useApp((s) => s.compare);
  const clearCompare = useApp((s) => s.clearCompare);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || compare.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-5">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/95 px-2.5 py-1.5 shadow-lg backdrop-blur sm:gap-3 sm:px-3.5 sm:py-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <GitCompare className="h-3.5 w-3.5" />
          {t("listings.compareSelected", { n: compare.length })}
        </span>
        <Button asChild size="sm">
          <Link href={`/compare?ids=${compare.map(encodeURIComponent).join(",")}`}>{t("compare.title")} →</Link>
        </Button>
        <button
          type="button"
          onClick={clearCompare}
          aria-label="clear"
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
