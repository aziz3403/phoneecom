"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, ChevronRight } from "lucide-react";
import { DEVICES, baseStorage, storageFor } from "@/lib/products";
import { tierForQty, nextTier, MOQ, WHOLESALE_TIERS } from "@/lib/wholesale";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

const QUICK = [5, 25, 100, 250, 500];
const MAX_QTY = 750;

/** Cosmetic condition floor — scales the per-unit price. */
const GRADES = [
  { id: "a", label: "Grade A", sub: "Pristine / Excellent", mult: 1.18 },
  { id: "b", label: "Grade B", sub: "Good", mult: 1.0 },
  { id: "c", label: "Grade C", sub: "Fair / functional", mult: 0.82 },
] as const;

export function SavingsCalculator() {
  const [slug, setSlug] = useState(DEVICES[0].slug);
  const device = useMemo(() => DEVICES.find((d) => d.slug === slug)!, [slug]);
  const [gb, setGb] = useState(baseStorage(device).gb);
  const [qty, setQty] = useState(100);
  const [gradeId, setGradeId] = useState<(typeof GRADES)[number]["id"]>("b");

  const grade = GRADES.find((g) => g.id === gradeId)!;
  const sOpt = storageFor(device, gb);
  const tier = tierForQty(qty);
  // Grade scales the base wholesale unit price; the tier discount applies on top.
  const gradedBase = sOpt.wholesale * grade.mult;
  const unit = Math.round(gradedBase * (1 - tier.discount));
  const total = unit * qty;
  const retailTotal = sOpt.price * qty;
  const savings = retailTotal - total;
  const next = nextTier(qty);
  const tierIndex = WHOLESALE_TIERS.findIndex((t) => t.id === tier.id);

  function changeDevice(newSlug: string) {
    setSlug(newSlug);
    const d = DEVICES.find((x) => x.slug === newSlug)!;
    setGb(baseStorage(d).gb);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── controls ── */}
      <div className="scard-bord">
        <div className="flex items-center gap-4">
          <PhImg
            slug={device.slug}
            src={device.image}
            label={device.name}
            className="h-20 w-16 shrink-0 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <label className="flabel">Model</label>
            <select
              aria-label="Model"
              value={slug}
              onChange={(e) => changeDevice(e.target.value)}
              className="sel mt-1.5"
            >
              {DEVICES.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flabel mt-6 block">Storage</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {device.storage.map((s) => (
            <button
              key={s.gb}
              onClick={() => setGb(s.gb)}
              className={cn("chip", gb === s.gb && "on accent")}
            >
              {s.gb}GB
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="flabel">Quantity</label>
          <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">{qty.toLocaleString()}</span>
        </div>
        <input
          type="range"
          aria-label="Quantity"
          min={MOQ}
          max={MAX_QTY}
          step={5}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#e3e3e8] accent-[#0a8f6e]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setQty(q)}
              className={cn("chip", qty === q && "on accent")}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <label className="flabel">Grade standard</label>
          <span className="text-xs text-[#86868b]">cosmetic condition floor</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGradeId(g.id)}
              aria-label={g.label}
              aria-pressed={gradeId === g.id}
              className={cn("chip flex-col items-start gap-0 py-2 text-left", gradeId === g.id && "on accent")}
            >
              <span className="font-semibold">{g.label}</span>
              <span
                className="text-[11px] font-normal"
                style={{ color: gradeId === g.id ? "rgba(255,255,255,.82)" : "#86868b" }}
              >
                {g.sub}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-7 space-y-2">
          {WHOLESALE_TIERS.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors",
                i === tierIndex
                  ? "border-[#0a8f6e] bg-[#f1f7f3] text-[#1d1d1f]"
                  : "border-[#d2d2d7] text-[#86868b]",
              )}
            >
              <span>
                {t.label} · {t.min}
                {t.max ? `–${t.max}` : "+"}
              </span>
              <span
                className="font-semibold"
                style={{ color: i === tierIndex ? "#0a8f6e" : undefined }}
              >
                {t.discount === 0 ? "Base" : `-${Math.round(t.discount * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── quote panel (dark, on-brand) ── */}
      <motion.div
        key={`${slug}-${gb}-${tier.id}`}
        initial={{ opacity: 0.6, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col justify-center rounded-[22px] bg-[#1d1d1f] p-6 text-[#f5f5f7] sm:p-8"
      >
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#41d6a0]">
          {tier.label} tier · {device.name} {gb}GB
        </span>

        <div className="mt-5">
          <p className="text-sm text-[#a1a1a6]">Your unit price</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold tracking-tight">{formatPrice(unit)}</span>
            <span className="mb-1.5 text-[#86868b] line-through">{formatPrice(sOpt.price)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-xs text-[#a1a1a6]">Order total</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatPrice(total)}</p>
          </div>
          <div className="rounded-2xl bg-[#41d6a0]/10 p-4">
            <p className="inline-flex items-center gap-1 text-xs text-[#41d6a0]">
              <TrendingDown className="h-3.5 w-3.5" /> You save
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#41d6a0]">{formatPrice(savings)}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex justify-between py-1.5 text-sm text-[#a1a1a6]">
            <span>Retail value</span>
            <span className="font-semibold text-[#f5f5f7]">{formatPrice(retailTotal)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm text-[#a1a1a6]">
            <span>Volume discount</span>
            <span className="font-semibold text-[#41d6a0]">
              {tier.discount === 0 ? "Base" : `−${Math.round(tier.discount * 100)}%`}
            </span>
          </div>
          <div className="flex justify-between py-1.5 text-sm text-[#a1a1a6]">
            <span>Per-unit average</span>
            <span className="font-semibold text-[#f5f5f7]">{formatPrice(unit)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-sm font-semibold text-[#f5f5f7]">Your price</span>
            <span className="text-2xl font-bold tracking-tight">{formatPrice(total)}</span>
          </div>
        </div>

        {next ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#d8d8da]">
            <ChevronRight className="h-4 w-4 shrink-0 text-[#41d6a0]" />
            <span>
              Add <span className="font-semibold text-white">{next.min - qty}</span> more to reach{" "}
              <span className="font-semibold text-white">{next.label}</span> ({Math.round(next.discount * 100)}% off)
            </span>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#41d6a0]/30 bg-[#41d6a0]/10 px-4 py-3 text-sm text-[#41d6a0]">
            🎉 You&apos;ve unlocked our deepest tier. Talk to us about locked quarterly pricing.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href="#apply"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#41d6a0] text-[15px] font-semibold text-[#06291e] transition-all duration-200 hover:bg-[#5fe0b3] active:scale-[.98]"
          >
            Apply for this pricing
          </a>
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-[15px] font-semibold text-[#f5f5f7] transition-all duration-200 hover:bg-white/[0.12] active:scale-[.98]"
          >
            Download price list
          </button>
          <p className="mt-1 text-center text-xs leading-relaxed text-[#86868b]">
            Estimate only. Final pricing is confirmed by your account rep.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
