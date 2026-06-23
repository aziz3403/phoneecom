"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, ChevronRight } from "lucide-react";
import { PHONES } from "@/lib/products";
import { tierForQty, unitPrice, nextTier, MOQ, WHOLESALE_TIERS } from "@/lib/wholesale";
import { formatPrice, cn } from "@/lib/utils";

const QUICK = [5, 25, 100, 250, 500];
const MAX_QTY = 750;

export function SavingsCalculator() {
  const [slug, setSlug] = useState(PHONES[0].slug);
  const [qty, setQty] = useState(100);

  const phone = useMemo(() => PHONES.find((p) => p.slug === slug)!, [slug]);

  const tier = tierForQty(qty);
  const unit = unitPrice(phone.wholesalePrice, qty);
  const total = unit * qty;
  const retailTotal = phone.price * qty;
  const savings = retailTotal - total;
  const next = nextTier(qty);
  const tierIndex = WHOLESALE_TIERS.findIndex((t) => t.id === tier.id);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* controls */}
      <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Model</label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white focus:border-brand-400/60 focus:outline-none"
        >
          {PHONES.map((p) => (
            <option key={p.slug} value={p.slug} className="bg-ink-900">
              {p.name} · {p.color} · {p.storage}GB
            </option>
          ))}
        </select>

        <div className="mt-6 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Quantity</label>
          <span className="font-display text-2xl font-bold text-white">{qty.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={MOQ}
          max={MAX_QTY}
          step={5}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-3 w-full accent-brand-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setQty(q)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                qty === q ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 text-white/55 hover:border-white/25",
              )}
            >
              {q}
            </button>
          ))}
        </div>

        {/* tier ladder */}
        <div className="mt-7 space-y-2">
          {WHOLESALE_TIERS.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition",
                i === tierIndex
                  ? "border-brand-400/60 bg-brand-500/15 text-white"
                  : "border-white/10 text-white/45",
              )}
            >
              <span>
                {t.label} · {t.min}
                {t.max ? `–${t.max}` : "+"}
              </span>
              <span className={cn("font-semibold", i === tierIndex ? "text-mint-300" : "")}>
                {t.discount === 0 ? "Base" : `-${Math.round(t.discount * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* result */}
      <motion.div
        key={`${slug}-${tier.id}`}
        initial={{ opacity: 0.6, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-brand-500/10 to-ink-900/60 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/30 blur-[90px]" />
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-200">
          {tier.label} tier
        </span>

        <div className="mt-5">
          <p className="text-sm text-white/45">Your unit price</p>
          <div className="flex items-end gap-3">
            <motion.span
              key={unit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-extrabold text-white"
            >
              {formatPrice(unit)}
            </motion.span>
            <span className="mb-1.5 text-white/40 line-through">{formatPrice(phone.price)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs text-white/45">Order total</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{formatPrice(total)}</p>
          </div>
          <div className="rounded-2xl bg-mint-500/10 p-4">
            <p className="inline-flex items-center gap-1 text-xs text-mint-300">
              <TrendingDown className="h-3.5 w-3.5" /> You save
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-mint-300">{formatPrice(savings)}</p>
          </div>
        </div>

        {next ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
            <ChevronRight className="h-4 w-4 text-brand-300" />
            Add <span className="font-semibold text-white">{next.min - qty}</span> more to reach{" "}
            <span className="font-semibold text-white">{next.label}</span> ({Math.round(next.discount * 100)}% off)
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-mint-400/30 bg-mint-500/10 px-4 py-3 text-sm text-mint-300">
            🎉 You&apos;ve unlocked our deepest tier. Talk to us about locked quarterly pricing.
          </div>
        )}
      </motion.div>
    </div>
  );
}
