"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, ChevronRight } from "lucide-react";
import { DEVICES, baseStorage, storageFor } from "@/lib/products";
import { tierForQty, unitPrice, nextTier, MOQ, WHOLESALE_TIERS } from "@/lib/wholesale";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

const QUICK = [5, 25, 100, 250, 500];
const MAX_QTY = 750;

export function SavingsCalculator() {
  const [slug, setSlug] = useState(DEVICES[0].slug);
  const device = useMemo(() => DEVICES.find((d) => d.slug === slug)!, [slug]);
  const [gb, setGb] = useState(baseStorage(device).gb);
  const [qty, setQty] = useState(100);

  const sOpt = storageFor(device, gb);
  const tier = tierForQty(qty);
  const unit = unitPrice(sOpt.wholesale, qty);
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
      </motion.div>
    </div>
  );
}
