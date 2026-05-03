"use client";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function SwrError({
  error,
  onRetry,
  className,
  compact = false,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations();
  const msg = errorMessage(error);
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 text-center text-destructive",
        compact ? "px-3 py-4" : "px-4 py-10",
        className
      )}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="font-bold">{t("error.title")}</div>
      <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground">
        {msg}
      </pre>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 text-[12px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors"
        >
          {t("error.retry")}
        </button>
      ) : null}
    </div>
  );
}
