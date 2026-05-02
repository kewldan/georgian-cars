import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites — GeorgianCars",
  description: "Cars you saved with the heart icon.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
