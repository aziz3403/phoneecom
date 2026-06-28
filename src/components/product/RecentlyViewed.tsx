"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecent } from "@/lib/recent-store";
import { getDevice, startingPrice } from "@/lib/products";
import { PhImg } from "@/components/home/PhImg";
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
    <section className="shell mt-[90px] pb-5">
      <h2 className="mb-6 text-[22px] font-bold tracking-[-.015em] text-[#1d1d1f]">
        Recently viewed
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {devices.map((d) => (
          <Link
            key={d.slug}
            href={`/product/${d.slug}`}
            className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-[18px] bg-[#f5f5f7] transition hover:-translate-y-1"
          >
            <PhImg
              slug={d.slug}
              src={d.image}
              label={d.name}
              className="!h-32"
              style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }}
            />
            <div className="p-3.5">
              <p className="truncate text-sm font-semibold text-[#1d1d1f]">{d.name}</p>
              <p className="mt-0.5 text-xs text-[#86868b]">
                from {formatPrice(startingPrice(d))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
