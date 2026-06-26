"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Plus, Star } from "lucide-react";
import { DEVICES, getDevice, startingPrice, renderSrc, type Device, type CameraLayout } from "@/lib/products";
import { GRADES } from "@/lib/grades";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import { formatPrice, cn } from "@/lib/utils";

const CAMERA_LABEL: Record<CameraLayout, string> = {
  triple: "Triple",
  grid: "Quad",
  circular: "Triple",
  dual: "Dual",
  vertical: "Triple",
  bar: "Dual",
  single: "Single",
};

const ROWS: { label: string; get: (d: Device) => string }[] = [
  { label: "Price from", get: (d) => formatPrice(startingPrice(d)) },
  { label: "Brand", get: (d) => d.brand },
  { label: "Type", get: (d) => (d.type === "tablet" ? "Tablet" : "Phone") },
  { label: "Released", get: (d) => String(d.releaseYear) },
  { label: "Chip", get: (d) => d.chip },
  { label: "RAM", get: (d) => `${d.ram}GB` },
  { label: "Display", get: (d) => `${d.screen}"` },
  { label: "Battery health", get: (d) => `${d.batteryHealth}%` },
  { label: "Storage", get: (d) => d.storage.map((s) => (s.gb >= 1024 ? "1TB" : `${s.gb}GB`)).join(" · ") },
  { label: "Cameras", get: (d) => CAMERA_LABEL[d.cameraLayout] },
  { label: "5G", get: (d) => (d.fiveG ? "Yes" : "—") },
  { label: "Condition", get: (d) => GRADES[d.grade].label },
  { label: "Rating", get: (d) => `${d.rating} / 5` },
];

export function CompareClient() {
  const [slugs, setSlugs] = useState<string[]>(["iphone-15-pro-max", "galaxy-s24-ultra"]);
  const devices = slugs.map(getDevice).filter((d): d is Device => Boolean(d));
  const available = DEVICES.filter((d) => !slugs.includes(d.slug));
  const cols = devices.length + (devices.length < 3 ? 1 : 0);

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="min-w-[640px]"
        style={{ display: "grid", gridTemplateColumns: `150px repeat(${cols}, minmax(170px, 1fr))` }}
      >
        {/* header */}
        <div className="sticky left-0 z-10 bg-ink-950" />
        {devices.map((d) => (
          <div key={d.slug} className="relative rounded-t-2xl border border-white/10 bg-ink-850/50 p-4 text-center">
            <button
              onClick={() => setSlugs((s) => s.filter((x) => x !== d.slug))}
              className="absolute right-2 top-2 text-white/30 hover:text-rose-400"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto h-28 w-20">
              <DeviceVisual
                colorHex={d.colors[0].hex}
                accent={d.colors[0].accent}
                brand={d.brand}
                type={d.type}
                cameraLayout={d.cameraLayout}
                image={renderSrc(d.slug)}
                tilt={false}
                className="h-full"
              />
            </div>
            <Link href={`/product/${d.slug}`} className="mt-2 block text-sm font-semibold text-white hover:text-brand-200">
              {d.name}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs text-white/45">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {d.rating}
            </span>
          </div>
        ))}
        {devices.length < 3 && (
          <div className="rounded-t-2xl border border-dashed border-white/15 p-4">
            <p className="mb-2 text-center text-xs text-white/40">Add a device</p>
            <select
              value=""
              onChange={(e) => e.target.value && setSlugs((s) => [...s, e.target.value])}
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-2 py-2 text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-ink-900">
                Choose…
              </option>
              {available.map((d) => (
                <option key={d.slug} value={d.slug} className="bg-ink-900">
                  {d.name}
                </option>
              ))}
            </select>
            <div className="mt-3 grid place-items-center text-white/20">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* rows */}
        {ROWS.map((row, ri) => (
          <div key={row.label} className="contents">
            <div
              className={cn(
                "sticky left-0 z-10 flex items-center bg-ink-950 px-3 py-3 text-xs font-medium uppercase tracking-wide text-white/40",
                ri % 2 === 0 && "bg-ink-900/40",
              )}
            >
              {row.label}
            </div>
            {devices.map((d) => (
              <div
                key={d.slug}
                className={cn(
                  "flex items-center justify-center border-x border-white/5 px-3 py-3 text-center text-sm text-white/80",
                  ri % 2 === 0 && "bg-white/[0.02]",
                )}
              >
                {row.get(d)}
              </div>
            ))}
            {devices.length < 3 && <div className={cn(ri % 2 === 0 && "bg-white/[0.01]")} />}
          </div>
        ))}
      </div>
    </div>
  );
}
