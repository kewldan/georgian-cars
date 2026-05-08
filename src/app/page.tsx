import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ListingsPage } from "@/components/listings-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = `${t("appName")} — ${t("tagline")}`;
  const description = t("tagline");
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function Page() {
  return <ListingsPage />;
}
