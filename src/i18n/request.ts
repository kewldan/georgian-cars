import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["ru", "en", "ka"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  const locale: Locale = locales.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : defaultLocale;
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
