"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  Boxes,
  ArrowRight,
} from "lucide-react";
import type { Phone } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { GRADES } from "@/lib/grades";
import { unitPrice, MOQ } from "@/lib/wholesale";
import { formatPrice, pct, cn } from "@/lib/utils";
import { GradeBadge } from "@/components/ui/Badge";

export function ProductBuyPanel({ phone }: { phone: Phone }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const off = pct(phone.price, phone.originalPrice);
  const g = GRADES[phone.grade];
  const bulkUnit = unitPrice(phone.wholesalePrice, MOQ);

  const item = {
    slug: phone.slug,
    name: phone.name,
    brand: phone.brand,
    color: phone.color,
    colorHex: phone.colorHex,
    grade: phone.grade,
    storage: phone.storage,
    mode: "retail" as const,
    retailPrice: phone.price,
    wholesaleBase: phone.wholesalePrice,
  };

  function addToCart() {
    add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function buyNow() {
    add(item, qty);
    setOpen(false);
    router.push("/cart");
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="flex flex-wrap items-center gap-3">
        <GradeBadge grade={phone.grade} />
        <span className="inline-flex items-center gap-1.5 text-sm text-white/55">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {phone.rating} · {phone.reviews.toLocaleString()} reviews
        </span>
        {phone.fiveG && (
          <span className="rounded-full bg-glacier-500/15 px-2.5 py-0.5 text-xs font-semibold text-glacier-300">
            5G
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium uppercase tracking-wider text-brand-200">{phone.brand}</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {phone.name}
      </h1>
      <p className="mt-2 text-white/55">
        {phone.color} · {phone.storage}GB · {phone.chip}
      </p>

      {/* price */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <span className="font-display text-4xl font-extrabold text-white">{formatPrice(phone.price)}</span>
        {off > 0 && (
          <>
            <span className="text-lg text-white/35 line-through">{formatPrice(phone.originalPrice)}</span>
            <span className="rounded-full bg-mint-500/15 px-3 py-1 text-sm font-semibold text-mint-300">
              Save {formatPrice(phone.originalPrice - phone.price)} ({off}%)
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-sm text-white/45">
        or {formatPrice(Math.round(phone.price / 12))}/mo for 12 months
      </p>

      {/* battery + grade quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <BatteryRing value={phone.batteryHealth} />
        <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-white/40">Condition</p>
          <p className="mt-1 font-display text-xl font-bold" style={{ color: g.hexSoft }}>
            {g.label}
          </p>
          <p className="mt-0.5 text-xs text-white/50">{g.tagline}</p>
        </div>
      </div>

      {/* qty + actions */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold text-white">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-white/45">{phone.stock} in stock</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={addToCart}
          className={cn(
            "group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
            added
              ? "bg-mint-500 text-ink-950"
              : "glass-strong text-white hover:bg-white/10",
          )}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to bag
            </>
          ) : (
            "Add to bag"
          )}
        </button>
        <button
          onClick={buyNow}
          className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-glacier-400 font-medium text-white shadow-[0_14px_50px_-12px_rgba(116,48,255,.9)] transition hover:-translate-y-0.5"
        >
          Buy now <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* wholesale hint */}
      <Link
        href="/wholesale"
        className="mt-4 flex items-center justify-between rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 transition hover:bg-brand-500/15"
      >
        <span className="inline-flex items-center gap-2 text-sm text-white/80">
          <Boxes className="h-4 w-4 text-brand-300" />
          Need {MOQ}+? Trade price from{" "}
          <span className="font-semibold text-white">{formatPrice(bulkUnit)}/unit</span>
        </span>
        <ArrowRight className="h-4 w-4 text-brand-300" />
      </Link>

      {/* trust badges */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: "12-mo warranty" },
          { icon: RefreshCw, label: "30-day returns" },
          { icon: Truck, label: "Free 2-day" },
        ].map((b) => (
          <div key={b.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-4">
            <b.icon className="mx-auto h-5 w-5 text-mint-400" />
            <p className="mt-2 text-xs text-white/55">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatteryRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="#34e6a8"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c - (value / 100) * c }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold text-white">
          {value}%
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40">Battery</p>
        <p className="mt-0.5 text-sm font-medium text-white">Health verified</p>
      </div>
    </div>
  );
}
