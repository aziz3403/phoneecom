"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BatteryMedium, Star, Plus, Check } from "lucide-react";
import { useState } from "react";
import type { Phone } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { formatPrice, pct, cn } from "@/lib/utils";
import { PhoneMock } from "./PhoneMock";
import { GradeBadge } from "./Badge";

export function ProductCard({ phone, index = 0 }: { phone: Phone; index?: number }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const off = pct(phone.price, phone.originalPrice);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    add({
      slug: phone.slug,
      name: phone.name,
      brand: phone.brand,
      color: phone.color,
      colorHex: phone.colorHex,
      grade: phone.grade,
      storage: phone.storage,
      mode: "retail",
      retailPrice: phone.price,
      wholesaleBase: phone.wholesalePrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/product/${phone.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-850/60 p-4 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_30px_70px_-30px_rgba(116,48,255,.6)]"
      >
        {/* glow halo in phone color */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: phone.colorHex }}
        />

        <div className="mb-3 flex items-center justify-between">
          <GradeBadge grade={phone.grade} size="sm" />
          {off > 0 && (
            <span className="rounded-full bg-mint-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-mint-300">
              -{off}%
            </span>
          )}
        </div>

        {/* phone visual */}
        <div className="relative grid h-44 place-items-center py-2">
          <PhoneMock colorHex={phone.colorHex} accentHex={phone.accentHex} brand={phone.brand} className="h-full" />
        </div>

        <div className="mt-2 flex flex-1 flex-col">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{phone.brand}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>{phone.storage}GB</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-white">{phone.name}</h3>
          <p className="text-sm text-white/45">{phone.color}</p>

          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="h-3.5 w-3.5 text-mint-400" />
              {phone.batteryHealth}%
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {phone.rating}
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-white">{formatPrice(phone.price)}</span>
                {off > 0 && (
                  <span className="text-sm text-white/35 line-through">{formatPrice(phone.originalPrice)}</span>
                )}
              </div>
              <span className="text-[11px] text-white/40">or from {formatPrice(Math.round(phone.price / 12))}/mo</span>
            </div>

            <button
              onClick={handleAdd}
              aria-label={`Add ${phone.name} to cart`}
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-300",
                added
                  ? "bg-mint-500 text-ink-950"
                  : "bg-white/10 text-white hover:bg-gradient-to-r hover:from-brand-500 hover:to-glacier-400 hover:scale-105",
              )}
            >
              {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
