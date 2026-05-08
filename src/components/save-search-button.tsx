"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, Bookmark, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useListingsParams } from "@/lib/listings-params";
import { cn } from "@/lib/utils";

export function SaveSearchButton({ className }: { className?: string }) {
  const t = useTranslations();
  const { filters, search, sort } = useListingsParams();
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await api("/saved-searches", {
        method: "POST",
        body: JSON.stringify({ name: trimmed, filters, search, sort, notify }),
      });
      mutate("/saved-searches");
      setOpen(false);
      setName("");
      setNotify(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setName("");
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-semibold transition-colors hover:border-foreground/40 hover:bg-secondary",
            className
          )}
          title={t("listings.saveSearch")}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{t("listings.saveSearch")}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95"
          )}
        >
          <form onSubmit={submit}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Dialog.Title className="text-[13px] font-bold uppercase tracking-wider">{t("save.title")}</Dialog.Title>
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
            <div className="space-y-3 px-4 py-4">
              <label
                htmlFor="save-search-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t("save.name")}
              </label>
              <Input
                id="save-search-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("save.namePlaceholder")}
                autoFocus
                required
              />
              <label htmlFor="save-search-notify" className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox id="save-search-notify" checked={notify} onCheckedChange={(v) => setNotify(!!v)} />
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                {t("save.notify")}
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  {t("save.cancel")}
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={!name.trim() || submitting}>
                {t("save.submit")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
