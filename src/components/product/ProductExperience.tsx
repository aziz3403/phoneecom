"use client";

import { useEffect, useState } from "react";
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
  Heart,
  RotateCw,
} from "lucide-react";
import { type Device, baseStorage, storageFor } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useRecent } from "@/lib/recent-store";
import { GRADES, GRADE_ORDER, type GradeId } from "@/lib/grades";
import { unitPrice, MOQ } from "@/lib/wholesale";
import { formatPrice, pct, cn } from "@/lib/utils";
import { GradeBadge } from "@/components/ui/Badge";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import PhoneViewer from "@/components/three/PhoneViewer";

const scoreOf = (id: GradeId) => GRADES[id].score;

export function ProductExperience({ device }: { device: Device }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const wished = useWishlist((s) => s.slugs.includes(device.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const visit = useRecent((s) => s.visit);

  const [colorIdx, setColorIdx] = useState(0);
  const [gb, setGb] = useState(baseStorage(device).gb);
  const [gradeId, setGradeId] = useState<GradeId>(device.grade);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [view, setView] = useState<"3d" | "front" | "back">("3d");

  useEffect(() => {
    visit(device.slug);
  }, [device.slug, visit]);

  const color = device.colors[colorIdx];
  const sOpt = storageFor(device, gb);
  const mult = 1 + (scoreOf(gradeId) - scoreOf(device.grade)) * 0.06;
  const priceFor = (base: number) => Math.round(base * mult);
  const price = priceFor(sOpt.price);
  const off = pct(price, sOpt.original);
  const bulkUnit = unitPrice(sOpt.wholesale, MOQ);
  const lowStock = device.stock <= 18;

  function buildItem() {
    return {
      slug: device.slug,
      name: device.name,
      brand: device.brand,
      type: device.type,
      colorName: color.name,
      colorHex: color.hex,
      accent: color.accent,
      gb,
      grade: gradeId,
      mode: "retail" as const,
      retailPrice: price,
      wholesaleBase: sOpt.wholesale,
    };
  }

  function addToCart() {
    add(buildItem(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
  function buyNow() {
    add(buildItem(), qty);
    setOpen(false);
    router.push("/cart");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* viewer */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-ink-800/60 to-ink-900/70">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[90px] transition-colors duration-500"
            style={{ background: color.hex }}
          />
          {view === "3d" ? (
            <>
              <PhoneViewer
                colorHex={color.hex}
                accentHex={color.accent}
                cameraLayout={device.cameraLayout}
                brand={device.brand}
                formFactor={device.type}
                mode="viewer"
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
                <span className="inline-flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5" /> Drag to rotate · scroll to zoom
                </span>
              </div>
            </>
          ) : (
            <div className="grid h-full w-full place-items-center p-12">
              <DeviceVisual
                colorHex={color.hex}
                accent={color.accent}
                brand={device.brand}
                type={device.type}
                cameraLayout={device.cameraLayout}
                face={view}
                tilt={false}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* view toggle */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {(["3d", "front", "back"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-xl border px-5 py-2 text-xs font-medium uppercase tracking-wide transition",
                view === v ? "border-brand-400/60 bg-brand-500/15 text-white" : "border-white/10 text-white/55 hover:border-white/30",
              )}
            >
              {v === "3d" ? "3D" : v}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-white/45">
          Showing <span className="font-medium text-white">{color.name}</span>
        </p>
      </div>

      {/* controls */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-wrap items-center gap-3">
          <GradeBadge grade={gradeId} />
          <span className="inline-flex items-center gap-1.5 text-sm text-white/55">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {device.rating} · {device.reviews.toLocaleString()} reviews
          </span>
          {device.fiveG && (
            <span className="rounded-full bg-glacier-500/15 px-2.5 py-0.5 text-xs font-semibold text-glacier-300">5G</span>
          )}
        </div>

        <p className="mt-4 text-sm font-medium uppercase tracking-wider text-brand-200">{device.brand}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{device.name}</h1>
        <p className="mt-2 text-white/55">
          {device.chip} · {device.screen}&quot; · {device.ram}GB RAM
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <span className="font-display text-4xl font-extrabold text-white">{formatPrice(price)}</span>
          {off > 0 && (
            <>
              <span className="text-lg text-white/35 line-through">{formatPrice(sOpt.original)}</span>
              <span className="rounded-full bg-mint-500/15 px-3 py-1 text-sm font-semibold text-mint-300">
                Save {formatPrice(sOpt.original - price)} ({off}%)
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-sm text-white/45">or {formatPrice(Math.round(price / 12))}/mo for 12 months</p>

        {/* color */}
        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Color — <span className="font-normal text-white/55">{color.name}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {device.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setColorIdx(i)}
                title={c.name}
                aria-label={c.name}
                className={cn(
                  "h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-ink-950 transition",
                  i === colorIdx ? "ring-white scale-105" : "ring-white/20 hover:ring-white/50",
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* storage */}
        <div className="mt-6">
          <span className="text-sm font-semibold text-white">Storage</span>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {device.storage.map((s) => (
              <button
                key={s.gb}
                onClick={() => setGb(s.gb)}
                className={cn(
                  "rounded-2xl border px-4 py-2.5 text-left transition",
                  gb === s.gb
                    ? "border-brand-400/60 bg-brand-500/15 text-white"
                    : "border-white/10 text-white/60 hover:border-white/30",
                )}
              >
                <span className="block text-sm font-semibold">{s.gb}GB</span>
                <span className="block text-xs text-white/45">{formatPrice(priceFor(s.price))}</span>
              </button>
            ))}
          </div>
        </div>

        {/* condition */}
        <div className="mt-6">
          <span className="text-sm font-semibold text-white">Condition</span>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADE_ORDER.map((id) => {
              const g = GRADES[id];
              const p = priceFor(sOpt.price) + Math.round(sOpt.price * (scoreOf(id) - scoreOf(gradeId)) * 0.06);
              const active = id === gradeId;
              return (
                <button
                  key={id}
                  onClick={() => setGradeId(id)}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-left transition",
                    active ? "border-white bg-white/10" : "border-white/10 hover:border-white/30",
                  )}
                  style={active ? { borderColor: g.hex } : undefined}
                >
                  <span className="block text-sm font-semibold" style={{ color: g.hexSoft }}>
                    {g.label}
                  </span>
                  <span className="block text-xs text-white/45">{formatPrice(p)}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/50">
            {GRADES[gradeId].cosmetic}{" "}
            <Link href="/grades" className="text-brand-300 hover:text-brand-200">
              Grading explained →
            </Link>
          </p>
        </div>

        {/* qty + stock */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-white">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className={cn("text-sm", lowStock ? "font-medium text-amber-300" : "text-white/45")}>
            {lowStock ? `Only ${device.stock} left in stock` : `${device.stock} in stock`}
          </span>
        </div>

        {/* actions */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={addToCart}
            className={cn(
              "inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
              added ? "bg-mint-500 text-ink-950" : "glass-strong text-white hover:bg-white/10",
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
          <button
            onClick={() => toggleWish(device.slug)}
            aria-label="Save to wishlist"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/5"
          >
            <Heart className={cn("h-5 w-5", wished && "fill-rose-500 text-rose-500")} />
          </button>
        </div>

        {/* wholesale hint */}
        <Link
          href="/wholesale"
          className="mt-4 flex items-center justify-between rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 transition hover:bg-brand-500/15"
        >
          <span className="inline-flex items-center gap-2 text-sm text-white/80">
            <Boxes className="h-4 w-4 text-brand-300" />
            Buying {MOQ}+? Trade price from <span className="font-semibold text-white">{formatPrice(bulkUnit)}/unit</span>
          </span>
          <ArrowRight className="h-4 w-4 text-brand-300" />
        </Link>

        {/* trust */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: ShieldCheck, label: "12-mo warranty" },
            { icon: RefreshCw, label: "14-day RMA" },
            { icon: Truck, label: "Free 2-day" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-4">
              <b.icon className="mx-auto h-5 w-5 text-mint-400" />
              <p className="mt-2 text-xs text-white/55">{b.label}</p>
            </div>
          ))}
        </div>

        {/* guarantees */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <BatteryRing />
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">Guaranteed on every device</p>
            <p className="mt-0.5 text-sm font-medium text-white">
              80%+ battery health · fully unlocked · fully functional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BatteryRing() {
  const r = 26;
  const c = 2 * Math.PI * r;
  const fill = 0.86;
  return (
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
          whileInView={{ strokeDashoffset: c - fill * c }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-xs font-bold text-white">80%+</span>
    </div>
  );
}
