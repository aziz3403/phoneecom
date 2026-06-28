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

  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Shop
        </p>
        <h1 className="ptitle">The collection</h1>
        <p className="psub">
          Every phone is certified, graded honestly, and backed by a 12-month warranty. Find your
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
