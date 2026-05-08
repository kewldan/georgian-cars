import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CompareBar } from "@/components/compare-bar";
import { SwrProvider } from "@/components/swr-provider";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { TopBar } from "@/components/top-bar";
import { PALETTE_COOKIE } from "@/lib/store";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "react-photo-view/dist/react-photo-view.css";

const PALETTES = ["electric", "sunset", "azure", "tbilisi"] as const;
type Palette = (typeof PALETTES)[number];

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "GeorgianCars",
  description: "Маркетплейс для объявлений",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages, cookieStore] = await Promise.all([getLocale(), getMessages(), cookies()]);
  const cookiePalette = cookieStore.get(PALETTE_COOKIE)?.value as Palette | undefined;
  const palette: Palette = PALETTES.includes(cookiePalette as Palette) ? (cookiePalette as Palette) : "electric";
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-palette={palette}
      className={`${manrope.variable} ${mono.variable}`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static no-flash theme bootstrap, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen w-screen overflow-x-hidden bg-secondary">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <SwrProvider>
            <ThemeProvider>
              <TopBar />
              <main id="main" className="w-screen">
                {children}
              </main>
              <CompareBar />
            </ThemeProvider>
          </SwrProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
