"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Plus, Star, Check } from "lucide-react";
import {
  DEVICES,
  getDevice,
  startingPrice,
  bestDiscount,
  displaySpec,
  rearCameraSpec,
  waterResistance,
  type Device,
} from "@/lib/products";
import { GRADES } from "@/lib/grades";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

type Row = {
  section?: string;
  label: string;
  get: (d: Device) => string;
  /** higher/lower is better → the winning cell gets highlighted */
  best?: "min" | "max";
  /** numeric value used to pick the winner */
  val?: (d: Device) => number;
};

const ROWS: Row[] = [
  // Overview
  { section: "Overview", label: "Price from", get: (d) => formatPrice(startingPrice(d)), best: "min", val: (d) => startingPrice(d) },
  { label: "You save vs new", get: (d) => `${bestDiscount(d)}%`, best: "max", val: (d) => bestDiscount(d) },
  { label: "Brand", get: (d) => d.brand },
  { label: "Type", get: (d) => (d.type === "tablet" ? "Tablet" : "Phone") },
  { label: "Condition grade", get: (d) => GRADES[d.grade].label, best: "max", val: (d) => GRADES[d.grade].score },
  { label: "Rating", get: (d) => `${d.rating} / 5`, best: "max", val: (d) => d.rating },
  // Performance
  { section: "Performance", label: "Chip", get: (d) => d.chip },
  { label: "RAM", get: (d) => `${d.ram}GB`, best: "max", val: (d) => d.ram },
  { label: "Release year", get: (d) => String(d.releaseYear), best: "max", val: (d) => d.releaseYear },
  // Hardware
  { section: "Hardware", label: "Display", get: (d) => displaySpec(d) },
  { label: "Camera", get: (d) => rearCameraSpec(d) },
  { label: "Battery health", get: (d) => `${d.batteryHealth}%+`, best: "max", val: (d) => d.batteryHealth },
  { label: "Storage", get: (d) => d.storage.map((s) => (s.gb >= 1024 ? "1TB" : `${s.gb}GB`)).join(" · ") },
  { label: "Connectivity", get: (d) => (d.fiveG ? "5G" : "4G LTE") },
  { label: "Water resistance", get: (d) => waterResistance(d) },
];

const MAX = 3;

export function CompareClient() {
  const [slugs, setSlugs] = useState<string[]>(["iphone-15-pro-max", "galaxy-s24-ultra"]);
  const devices = slugs.map(getDevice).filter((d): d is Device => Boolean(d));
  const available = DEVICES.filter((d) => !slugs.includes(d.slug));
  const cols = devices.length + (devices.length < MAX ? 1 : 0);
  const full = devices.length >= MAX;

  function toggle(slug: string) {
    setSlugs((s) => {
      if (s.includes(slug)) return s.filter((x) => x !== slug);
      if (s.length >= MAX) return s;
      return [...s, slug];
    });
  }

  // For each comparable row, find the index of the winning device (or -1 / all-tied).
  function bestIndex(row: Row): number {
    if (!row.best || !row.val || devices.length < 2) return -1;
    const vals = devices.map(row.val);
    if (vals.every((v) => v === vals[0])) return -1;
    let idx = 0;
    for (let i = 1; i < vals.length; i++) {
      if (row.best === "min" ? vals[i] < vals[idx] : vals[i] > vals[idx]) idx = i;
    }
    return idx;
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* device picker — chips toggle on/off */}
      <div className="mb-2 text-[13px] font-semibold text-[#86868b]">Add a device to compare</div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {DEVICES.slice(0, 10).map((d) => {
          const on = slugs.includes(d.slug);
          const disabled = !on && full;
          return (
            <button
              key={d.slug}
              onClick={() => toggle(d.slug)}
              disabled={disabled}
              className={cn(
                "chip disabled:cursor-not-allowed disabled:opacity-45",
                on && "on accent",
              )}
            >
              {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {d.name}
            </button>
          );
        })}
      </div>
      <p className="mb-6 text-[13px] text-[#86868b]">
        {full
          ? "Comparing 3 devices. Tap a selected chip to swap one out."
          : `Tap up to ${MAX - devices.length} more to compare. Best value in each row is highlighted in green.`}
      </p>

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
              onClick={() => toggle(d.slug)}
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
            <Link href={`/product/${d.slug}`} className="btn btn-lt mt-3 w-full justify-center text-[13px]">
              View
            </Link>
          </div>
        ))}
        {devices.length < MAX && (
          <div className="border-b border-l border-[#d2d2d7] p-4">
            <p className="mb-2 text-center text-xs text-[#86868b]">Add a device</p>
            <select
              aria-label="Add a device to compare"
              value=""
              onChange={(e) => e.target.value && toggle(e.target.value)}
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
        {ROWS.map((row, ri) => {
          const winner = bestIndex(row);
          const striped = ri % 2 === 1;
          return (
            <div key={row.label} className="contents">
              {row.section && (
                <div
                  className="border-t border-[#d2d2d7] bg-white px-4 pb-1.5 pt-5 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#86868b]"
                  style={{ gridColumn: "1 / -1" }}
                >
                  {row.section}
                </div>
              )}
              <div
                className={cn(
                  "flex items-center border-t border-[#d2d2d7] px-4 py-3.5 text-[13.5px] font-semibold text-[#6e6e73]",
                  striped && "bg-[#f5f5f7]",
                )}
              >
                {row.label}
              </div>
              {devices.map((d, ci) => {
                const isWinner = ci === winner;
                return (
                  <div
                    key={d.slug}
                    className={cn(
                      "flex items-center justify-center gap-1 border-l border-t border-[#d2d2d7] px-4 py-3.5 text-center text-[14.5px]",
                      striped && "bg-[#f5f5f7]",
                      isWinner ? "font-semibold text-[#0a8f6e]" : "text-[#1d1d1f]",
                    )}
                    style={isWinner ? { background: "rgba(10,143,110,.1)" } : undefined}
                  >
                    {isWinner && <Check className="h-3.5 w-3.5 shrink-0 text-[#0a8f6e]" />}
                    {row.get(d)}
                  </div>
                );
              })}
              {devices.length < MAX && (
                <div className={cn("border-l border-t border-[#d2d2d7]", striped && "bg-[#f5f5f7]")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
