"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecent } from "@/lib/recent-store";
import { getDevice, startingPrice } from "@/lib/products";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import { formatPrice } from "@/lib/utils";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const slugs = useRecent((s) => s.slugs);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const devices = slugs
    .filter((s) => s !== exclude)
    .map(getDevice)
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, 6);

  if (devices.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <h2 className="mb-6 font-display text-2xl font-bold text-white">Recently viewed</h2>
      <div className="mask-fade-x flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {devices.map((d) => {
          const c = d.colors[0];
          return (
            <Link
              key={d.slug}
              href={`/product/${d.slug}`}
              className="group flex w-40 shrink-0 flex-col rounded-2xl border border-white/10 bg-ink-850/50 p-3 transition hover:border-white/20"
            >
              <div className="grid h-28 place-items-center">
                <DeviceVisual
                  colorHex={c.hex}
                  accent={c.accent}
                  brand={d.brand}
                  type={d.type}
                  cameraLayout={d.cameraLayout}
                  image={d.image}
                  alt={d.name}
                  className="h-full"
                />
              </div>
              <p className="mt-2 truncate text-sm font-medium text-white">{d.name}</p>
              <p className="text-xs text-white/45">from {formatPrice(startingPrice(d))}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
