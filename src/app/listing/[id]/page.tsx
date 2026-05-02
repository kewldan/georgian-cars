import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail-view";
import { LISTINGS } from "@/lib/data";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = LISTINGS.find((l) => l.id === id);
  if (!listing) return { title: "Listing not found — GeorgianCars" };
  const title = `${listing.year} ${listing.make} ${listing.model} · $${listing.price.toLocaleString("en-US")} — GeorgianCars`;
  const description = `${listing.make} ${listing.model} ${listing.year} in ${listing.city}. ${listing.power} hp · ${listing.mileage.toLocaleString("en-US")} km · ${listing.transmission}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = LISTINGS.find((l) => l.id === id);
  if (!listing) notFound();
  return <DetailView listing={listing} />;
}
