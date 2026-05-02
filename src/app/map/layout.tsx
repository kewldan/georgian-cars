import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map — GeorgianCars",
  description: "Listings across Georgia, on a map.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
