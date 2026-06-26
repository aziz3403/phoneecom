"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CreditCard, CheckCircle2, ArrowRight, Truck } from "lucide-react";
import { DEVICES, baseStorage, storageFor, BRANDS, type Brand } from "@/lib/products";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import { formatPrice, cn } from "@/lib/utils";

const CONDITIONS = [
  { id: "flawless", label: "Flawless", desc: "Like new, no marks", factor: 0.85 },
  { id: "good", label: "Good", desc: "Light wear, no cracks", factor: 0.62 },
  { id: "fair", label: "Fair", desc: "Visible wear, fully working", factor: 0.42 },
  { id: "faulty", label: "Cracked / faulty", desc: "Cracks or a fault", factor: 0.18 },
] as const;

type ConditionId = (typeof CONDITIONS)[number]["id"];

export function SellEstimator() {
  const [brand, setBrand] = useState<Brand>("Apple");
  const brandDevices = useMemo(() => DEVICES.filter((d) => d.brand === brand), [brand]);
  const [slug, setSlug] = useState(brandDevices[0].slug);
  const device = useMemo(
    () => DEVICES.find((d) => d.slug === slug) ?? brandDevices[0],
    [slug, brandDevices],
  );
  const [gb, setGb] = useState(baseStorage(device).gb);
  const [condition, setCondition] = useState<ConditionId>("good");
  const [unlocked, setUnlocked] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const sOpt = storageFor(device, gb);
  const cond = CONDITIONS.find((c) => c.id === condition)!;
  const base = sOpt.wholesale;
  const cash = Math.max(15, Math.round(base * cond.factor * (unlocked ? 1 : 0.9)));
  const credit = Math.round(cash * 1.1);

  function changeBrand(b: Brand) {
    setBrand(b);
    const first = DEVICES.find((d) => d.brand === b)!;
    setSlug(first.slug);
    setGb(baseStorage(first).gb);
  }
  function changeDevice(newSlug: string) {
    setSlug(newSlug);
    const d = DEVICES.find((x) => x.slug === newSlug)!;
    setGb(baseStorage(d).gb);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* form */}
      <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Brand</label>
        <div className="mt-2 flex gap-2">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => changeBrand(b)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                brand === b ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 text-white/55 hover:border-white/25",
              )}
            >
              {b}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Model</label>
        <select
          value={slug}
          onChange={(e) => changeDevice(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white focus:border-brand-400/60 focus:outline-none"
        >
          {brandDevices.map((d) => (
            <option key={d.slug} value={d.slug} className="bg-ink-900">
              {d.name}
            </option>
          ))}
        </select>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Storage</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {device.storage.map((s) => (
            <button
              key={s.gb}
              onClick={() => setGb(s.gb)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                gb === s.gb ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 text-white/55 hover:border-white/25",
              )}
            >
              {s.gb >= 1024 ? "1TB" : `${s.gb}GB`}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Condition</label>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCondition(c.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                condition === c.id ? "border-brand-400/60 bg-brand-500/15" : "border-white/10 hover:border-white/30",
              )}
            >
              <span className="block text-sm font-semibold text-white">{c.label}</span>
              <span className="block text-xs text-white/45">{c.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setUnlocked((v) => !v)}
          className={cn(
            "mt-6 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
            unlocked ? "border-brand-400/50 bg-brand-500/15 text-white" : "border-white/10 text-white/60",
          )}
        >
          <span>Carrier unlocked</span>
          <span className={cn("h-5 w-9 rounded-full p-0.5 transition", unlocked ? "bg-brand-500" : "bg-white/15")}>
            <span className={cn("block h-4 w-4 rounded-full bg-white transition", unlocked && "translate-x-4")} />
          </span>
        </button>
      </div>

      {/* quote */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-mint-500/10 to-ink-900/60 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mint-500/25 blur-[90px]" />
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center py-8 text-center"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-mint-500/20">
                <CheckCircle2 className="h-9 w-9 text-mint-400" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-white">Offer locked for 14 days</h3>
              <p className="mt-2 max-w-xs text-sm text-white/55">
                We&apos;ll email a prepaid shipping label. Once your {device.name} is inspected, you&apos;re paid
                within 2 business days. (Demo — nothing was sent.)
              </p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-mint-300 hover:text-mint-400">
                Start over
              </button>
            </motion.div>
          ) : (
            <motion.div key="quote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-4">
                <div className="h-24 w-16 shrink-0">
                  <DeviceVisual
                    colorHex={device.colors[0].hex}
                    accent={device.colors[0].accent}
                    brand={device.brand}
                    type={device.type}
                    cameraLayout={device.cameraLayout}
                    tilt={false}
                    className="h-full"
                  />
                </div>
                <div>
                  <p className="text-sm text-white/45">Your estimate for</p>
                  <p className="font-display text-lg font-bold text-white">{device.name}</p>
                  <p className="text-xs text-white/45">
                    {gb >= 1024 ? "1TB" : `${gb}GB`} · {cond.label}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="inline-flex items-center gap-1 text-xs text-white/45">
                    <Banknote className="h-3.5 w-3.5" /> Cash
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-white">{formatPrice(cash)}</p>
                </div>
                <div className="rounded-2xl bg-mint-500/10 p-4">
                  <p className="inline-flex items-center gap-1 text-xs text-mint-300">
                    <CreditCard className="h-3.5 w-3.5" /> Store credit
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-mint-300">{formatPrice(credit)}</p>
                </div>
              </div>

              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/50">
                <Truck className="h-3.5 w-3.5 text-mint-400" /> Free prepaid shipping label · paid in 2 days
              </p>

              <button
                onClick={() => setSubmitted(true)}
                className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-500 to-glacier-400 py-3.5 font-medium text-ink-950 transition hover:-translate-y-0.5"
              >
                Lock this offer <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
