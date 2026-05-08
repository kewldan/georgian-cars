import { cn } from "@/lib/utils";

export function ListingCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div
        aria-hidden
        className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 sm:px-3.5 sm:py-3"
      >
        <div className="h-14 w-20 shrink-0 animate-pulse rounded-sm bg-muted" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  return (
    <div aria-hidden className={cn("flex flex-col overflow-hidden rounded-md border border-border bg-card")}>
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-auto flex items-end justify-between border-t border-dashed border-border pt-2">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeletonGrid({
  count = 8,
  viewMode = "grid",
}: {
  count?: number;
  viewMode?: "grid" | "list";
}) {
  return (
    <div
      className={cn("grid gap-3.5", viewMode === "list" && "grid-cols-1")}
      style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" } : undefined}
    >
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeletons are positional placeholders
        <ListingCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
