import type { Metadata } from "next";
import { ListingsPage } from "@/components/listings-page";

export const metadata: Metadata = {
  title: "GeorgianCars — авто из Telegram-каналов Грузии",
  description: "Маркетплейс для объявлений из Telegram-каналов, нормализованных ИИ.",
};

export default function Page() {
  return <ListingsPage />;
}
