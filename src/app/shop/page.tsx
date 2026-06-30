import type { Metadata } from "next";
import Link from "next/link";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop certified pre-owned phones",
  description:
    "Browse certified pre-owned iPhone, Samsung Galaxy, Google Pixel, OnePlus and more. Filter by brand, condition, storage and price.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; max?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const initialMax = sp.max ? Number(sp.max) : undefined;

  const typeLabel = sp.type === "tablet" ? "Tablets" : sp.type === "phone" ? "Phones" : null;
  const brandLabel =
    sp.brand === "Apple" ? "Apple" : sp.brand === "Samsung" ? "Samsung" : null;
  const title = [brandLabel, typeLabel].filter(Boolean).join(" ") || "The collection";
  const noun = sp.type === "tablet" ? "tablet" : sp.type === "phone" ? "phone" : "device";

  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · {title === "The collection" ? "Shop" : title}
        </p>
        <h1 className="ptitle">{title}</h1>
        <p className="psub">
          Every {noun} is certified, graded honestly, and ships with a free charger and 30-day returns. Find your
          next one below.
        </p>
      </header>

      <ShopClient
        initialBrand={sp.brand}
        initialType={sp.type}
        initialMax={Number.isFinite(initialMax) ? initialMax : undefined}
      />
    </div>
  );
}
