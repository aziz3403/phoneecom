"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BatteryMedium, Star, Plus, Check, Heart } from "lucide-react";
import { useState } from "react";
import { type Device, baseStorage, startingPrice, bestDiscount, renderSrc } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice, cn } from "@/lib/utils";
import { DeviceVisual } from "./DeviceVisual";
import { GradeBadge } from "./Badge";

export function ProductCard({ device, index = 0 }: { device: Device; index?: number }) {
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.slugs.includes(device.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const [added, setAdded] = useState(false);

  const base = baseStorage(device);
  const price = startingPrice(device);
  const off = bestDiscount(device);
  const color = device.colors[0];
  const lowStock = device.stock <= 15;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    add({
      slug: device.slug,
      name: device.name,
      brand: device.brand,
      type: device.type,
      colorName: color.name,
      colorHex: color.hex,
      accent: color.accent,
      gb: base.gb,
      grade: device.grade,
      mode: "retail",
      retailPrice: base.price,
      wholesaleBase: base.wholesale,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault();
    toggleWish(device.slug);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/product/${device.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-850/60 p-4 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_30px_70px_-30px_rgba(116,48,255,.6)]"
      >
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: color.hex }}
        />

        <div className="mb-3 flex items-center justify-between">
          <GradeBadge grade={device.grade} size="sm" />
          <div className="flex items-center gap-2">
            {off > 0 && (
              <span className="rounded-full bg-mint-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-mint-300">
                -{off}%
              </span>
            )}
            <button
              onClick={handleWish}
              aria-label="Save to wishlist"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        </div>

        {/* device visual */}
        <div className="relative grid h-44 place-items-center py-2">
          <DeviceVisual
            colorHex={color.hex}
            accent={color.accent}
            brand={device.brand}
            type={device.type}
            cameraLayout={device.cameraLayout}
            image={device.image ?? renderSrc(device.slug)}
            alt={device.name}
            className="h-full"
          />
        </div>

        <div className="mt-2 flex flex-1 flex-col">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{device.brand}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>
              {device.storage[0].gb}
              {device.storage.length > 1 ? `–${device.storage[device.storage.length - 1].gb}` : ""}GB
            </span>
            {device.type === "tablet" && (
              <span className="rounded bg-glacier-500/15 px-1.5 text-[10px] font-semibold text-glacier-300">iPad</span>
            )}
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-white">{device.name}</h3>

          {/* color swatches */}
          <div className="mt-2 flex items-center gap-1.5">
            {device.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-white/20"
                style={{ background: c.hex }}
              />
            ))}
            {device.colors.length > 5 && (
              <span className="text-[11px] text-white/40">+{device.colors.length - 5}</span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="h-3.5 w-3.5 text-mint-400" />
              {device.batteryHealth}%
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {device.rating}
            </span>
            {lowStock && <span className="font-medium text-amber-300">Only {device.stock} left</span>}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-[11px] text-white/40">from</span>
              <div className="font-display text-2xl font-bold text-white">{formatPrice(price)}</div>
            </div>
            <button
              onClick={handleAdd}
              aria-label={`Add ${device.name} to cart`}
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-300",
                added
                  ? "bg-mint-500 text-ink-950"
                  : "bg-white/10 text-white hover:scale-105 hover:bg-gradient-to-r hover:from-brand-500 hover:to-glacier-400",
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
