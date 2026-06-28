"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Plus, Star } from "lucide-react";
import { DEVICES, getDevice, startingPrice, type Device, type CameraLayout } from "@/lib/products";
import { GRADES } from "@/lib/grades";
import { PhImg } from "@/components/home/PhImg";
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
  { label: "Battery health", get: () => "80%+ guaranteed" },
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
      {/* device picker */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-semibold text-[#86868b]">Add a device</span>
        {available.length === 0 ? (
          <span className="text-sm text-[#86868b]">Comparing the max of three devices.</span>
        ) : (
          available.slice(0, 8).map((d) => (
            <button
              key={d.slug}
              onClick={() => devices.length < 3 && setSlugs((s) => [...s, d.slug])}
              disabled={devices.length >= 3}
              className="chip disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Plus className="h-3.5 w-3.5" /> {d.name}
            </button>
          ))
        )}
      </div>

      <div
        className="min-w-[640px] overflow-hidden rounded-[18px] border border-[#d2d2d7]"
        style={{ display: "grid", gridTemplateColumns: `190px repeat(${cols}, minmax(170px, 1fr))` }}
      >
        {/* header */}
        <div className="border-b border-[#d2d2d7] bg-[#f5f5f7]" />
        {devices.map((d) => (
          <div
            key={d.slug}
            className="relative border-b border-l border-[#d2d2d7] bg-[#f5f5f7] p-4 text-center"
          >
            <button
              onClick={() => setSlugs((s) => s.filter((x) => x !== d.slug))}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-[#6e6e73] transition-colors hover:bg-[#ececef] hover:text-[#1d1d1f]"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="mx-auto h-28 w-20 overflow-hidden rounded-[12px]">
              <PhImg slug={d.slug} label={d.name} className="h-full w-full" />
            </div>
            <Link
              href={`/product/${d.slug}`}
              className="mt-3 block text-sm font-semibold text-[#1d1d1f] transition-colors hover:text-[#0a8f6e]"
            >
              {d.name}
            </Link>
            <div className="mt-1 text-base font-bold text-[#1d1d1f]">{formatPrice(startingPrice(d))}</div>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#86868b]">
              <Star className="h-3 w-3 fill-[#f5a623] text-[#f5a623]" /> {d.rating}
            </span>
          </div>
        ))}
        {devices.length < 3 && (
          <div className="border-b border-l border-[#d2d2d7] p-4">
            <p className="mb-2 text-center text-xs text-[#86868b]">Add a device</p>
            <select
              aria-label="Add a device to compare"
              value=""
              onChange={(e) => e.target.value && setSlugs((s) => [...s, e.target.value])}
              className="sel text-sm"
            >
              <option value="">Choose…</option>
              {available.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="mt-3 grid place-items-center text-[#86868b]">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* rows */}
        {ROWS.map((row, ri) => (
          <div key={row.label} className="contents">
            <div
              className={cn(
                "flex items-center border-t border-[#d2d2d7] px-4 py-3.5 text-[13.5px] font-semibold text-[#6e6e73]",
                ri % 2 === 1 && "bg-[#f5f5f7]",
              )}
            >
              {row.label}
            </div>
            {devices.map((d) => (
              <div
                key={d.slug}
                className={cn(
                  "flex items-center justify-center border-l border-t border-[#d2d2d7] px-4 py-3.5 text-center text-[14.5px] text-[#1d1d1f]",
                  ri % 2 === 1 && "bg-[#f5f5f7]",
                )}
              >
                {row.get(d)}
              </div>
            ))}
            {devices.length < 3 && (
              <div className={cn("border-l border-t border-[#d2d2d7]", ri % 2 === 1 && "bg-[#f5f5f7]")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
