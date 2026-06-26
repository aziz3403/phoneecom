"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { getDevice } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { ButtonLink } from "@/components/ui/Button";

export function WishlistClient() {
  const slugs = useWishlist((s) => s.slugs);
  const clear = useWishlist((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 pb-24 sm:px-8 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        ))}
      </div>
    );
  }

  const devices = slugs.map(getDevice).filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (devices.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/5">
          <Heart className="h-9 w-9 text-white/30" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-white">No saved devices yet</h1>
        <p className="mt-2 text-white/55">Tap the heart on any device to save it here for later.</p>
        <div className="mt-7 flex justify-center">
          <ButtonLink href="/shop" size="lg">
            Browse the collection
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-white/45">
          <span className="font-semibold text-white">{devices.length}</span> saved
        </p>
        <button onClick={clear} className="text-sm text-white/45 hover:text-rose-400">
          Clear all
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {devices.map((d, i) => (
          <ProductCard key={d.id} device={d} index={i} />
        ))}
      </div>
    </div>
  );
}
