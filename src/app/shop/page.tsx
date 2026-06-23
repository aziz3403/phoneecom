import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Shop certified pre-owned phones",
  description:
    "Browse certified pre-owned iPhone, Samsung Galaxy, Google Pixel, OnePlus and more. Filter by brand, condition, storage and price.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; max?: string }>;
}) {
  const sp = await searchParams;
  const initialMax = sp.max ? Number(sp.max) : undefined;

  return (
    <div className="pt-28">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8">
          <p className="text-sm text-white/40">Home · Shop</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            The collection
          </h1>
          <p className="mt-3 max-w-xl text-white/55">
            Every phone is certified, graded honestly, and backed by a 12-month warranty. Find your
            next one below.
          </p>
        </div>
      </section>

      <ShopClient initialBrand={sp.brand} initialMax={Number.isFinite(initialMax) ? initialMax : undefined} />
    </div>
  );
}
