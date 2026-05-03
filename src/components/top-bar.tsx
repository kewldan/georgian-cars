"use client";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bookmark,
  ChevronDown,
  Heart,
  List as ListIcon,
  type LucideIcon,
  MapPinned,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { setLocale as setLocaleAction } from "@/app/actions";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/request";
import { Mark } from "@/lib/og";
import { useApp } from "@/lib/store";
import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@/lib/utils";

type Currency = "USD" | "RUB";

const LOCALE_OPTIONS: Array<{ code: Locale; flag: string; label: string }> = [
  { code: "ru", flag: "ru", label: "Русский" },
  { code: "en", flag: "gb", label: "English" },
  { code: "ka", flag: "ge", label: "ქართული" },
];

function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${code}.svg`}
      alt=""
      aria-hidden="true"
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

const CURRENCY_OPTIONS: Array<{ code: Currency; symbol: string; label: string }> = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "RUB", symbol: "₽", label: "Российский рубль" },
];

export function TopBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const { currency, setCurrency, palette } = useApp();
  const { ids: favorites } = useFavorites();

  // Apply palette as data-attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
  }, [palette]);

  const onSelectLocale = (l: Locale) => {
    startTransition(async () => {
      await setLocaleAction(l);
    });
  };

  const navItems: Array<{ href: string; label: string; icon: LucideIcon; badge?: number }> = [
    { href: "/", label: t("nav.listings"), icon: ListIcon },
    { href: "/favorites", label: t("nav.favorites"), icon: Heart, badge: favorites.length },
    { href: "/saved", label: t("nav.saved"), icon: Bookmark },
    { href: "/map", label: t("nav.map"), icon: MapPinned },
  ];

  return (
    <header className="sticky top-0 z-50 flex min-h-[53px] items-center gap-3 border-b border-border bg-background px-4">
      <BurgerMenu navItems={navItems} pathname={pathname} />

      <Link
        href="/"
        aria-label={t("appName")}
        className="flex items-center gap-2.5 font-extrabold text-base tracking-tight shrink-0"
      >
        <Mark size={28} />
        <span>
          Georgian<span className="text-accent">Cars</span>
        </span>
      </Link>

      <nav className="hidden flex-1 items-center gap-1 min-w-0 overflow-hidden md:flex">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="font-mono text-[10px] font-bold rounded-full bg-accent text-accent-foreground px-1.5">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 shrink-0 md:ml-0">
        <LanguageSwitch locale={locale} disabled={isPending} onSelect={onSelectLocale} />
        <div className="hidden sm:inline-flex">
          <CurrencySwitch currency={currency} onSelect={(c) => setCurrency(c)} />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="theme"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </header>
  );
}

function BurgerMenu({
  navItems,
  pathname,
}: {
  navItems: Array<{ href: string; label: string; icon: LucideIcon; badge?: number }>;
  pathname: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 left-0 z-[60] flex w-full max-w-[280px] flex-col border-r border-border bg-card shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title asChild>
              <span className="flex items-center gap-2.5 font-extrabold text-base tracking-tight">
                <Mark size={24} />
                <span>
                  Georgian<span className="text-accent">Cars</span>
                </span>
              </span>
            </Dialog.Title>
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
          <nav className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Dialog.Close asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="font-mono text-[10px] font-bold rounded-full bg-accent text-accent-foreground px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </Dialog.Close>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border px-4 py-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            {t("appName")}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LanguageSwitch({
  locale,
  disabled,
  onSelect,
}: {
  locale: Locale;
  disabled: boolean;
  onSelect: (l: Locale) => void;
}) {
  const current = LOCALE_OPTIONS.find((l) => l.code === locale) ?? LOCALE_OPTIONS[0];
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={current.label}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-50 transition-colors"
        >
          <Flag code={current.flag} className="h-3 w-[18px] rounded-[1px] object-cover" />
          <span className="hidden sm:inline">{current.code}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[160px] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
        >
          {LOCALE_OPTIONS.map((opt) => (
            <DropdownMenu.Item
              key={opt.code}
              onSelect={() => onSelect(opt.code)}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs outline-none focus:bg-secondary",
                opt.code === locale && "bg-secondary font-semibold"
              )}
            >
              <Flag code={opt.flag} className="h-3.5 w-[21px] rounded-[1px] object-cover" />
              <span className="flex-1">{opt.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{opt.code}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function CurrencySwitch({ currency, onSelect }: { currency: Currency; onSelect: (c: Currency) => void }) {
  const current = CURRENCY_OPTIONS.find((c) => c.code === currency) ?? CURRENCY_OPTIONS[0];
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={current.label}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          <span className="text-sm leading-none">{current.symbol}</span>
          <span className="hidden sm:inline">{current.code}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[160px] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
        >
          {CURRENCY_OPTIONS.map((opt) => (
            <DropdownMenu.Item
              key={opt.code}
              onSelect={() => onSelect(opt.code)}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs outline-none focus:bg-secondary",
                opt.code === currency && "bg-secondary font-semibold"
              )}
            >
              <span className="grid h-5 w-5 place-items-center font-mono text-[13px]">{opt.symbol}</span>
              <span className="flex-1">{opt.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{opt.code}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
