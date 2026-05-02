import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved searches — GeorgianCars",
  description: "Get a Telegram ping the moment a new listing matches your filters.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
