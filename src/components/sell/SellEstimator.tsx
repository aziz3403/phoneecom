"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CreditCard, CheckCircle2, ArrowRight, Truck } from "lucide-react";
import { DEVICES, baseStorage, storageFor, BRANDS, type Brand } from "@/lib/products";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

const CONDITIONS = [
  { id: "flawless", label: "Flawless", desc: "Like new, no marks", factor: 0.85 },
  { id: "good", label: "Good", desc: "Light wear, no cracks", factor: 0.62 },
  { id: "fair", label: "Fair", desc: "Visible wear, fully working", factor: 0.42 },
  { id: "faulty", label: "Cracked / faulty", desc: "Cracks or a fault", factor: 0.18 },
] as const;

type ConditionId = (typeof CONDITIONS)[number]["id"];

const WHY = [
  { mark: "✓", title: "Price-lock guarantee", body: "Your quote is held for 14 days. We honor it as long as the device matches." },
  { mark: "⤓", title: "Free prepaid shipping", body: "We email a label and a recycled-box kit. Drop it off, fully tracked." },
  { mark: "$", title: "Paid in 48 hours", body: "Choose cash or take +10% in store credit after we verify." },
];

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

  const storageLabel = gb >= 1024 ? "1TB" : `${gb}GB`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* form */}
      <div className="flex flex-col gap-[18px]">
        <div className="scard-bord">
          <div className="mb-1 flex items-baseline gap-3">
            <span className="text-[13px] font-bold text-[#0a8f6e]">01</span>
            <span className="text-[18px] font-bold tracking-[-.01em]">What are you selling?</span>
          </div>
          <p className="mb-[18px] text-[13.5px] text-[#86868b]">Pick a brand, then your model.</p>

          <div className="field">
            <span className="flabel">Brand</span>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => changeBrand(b)}
                  className={cn("chip", brand === b && "on accent")}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="field mt-[18px]">
            <label className="flabel" htmlFor="sell-model">Model</label>
            <select
              id="sell-model"
              value={slug}
              onChange={(e) => changeDevice(e.target.value)}
              className="sel"
            >
              {brandDevices.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="scard-bord">
          <div className="mb-1 flex items-baseline gap-3">
            <span className="text-[13px] font-bold text-[#0a8f6e]">02</span>
            <span className="text-[18px] font-bold tracking-[-.01em]">What condition is it in?</span>
          </div>
          <p className="mb-[18px] text-[13.5px] text-[#86868b]">
            Be honest — we re-grade on arrival and price-match to what we find.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCondition(c.id)}
                className={cn(
                  "rounded-[13px] border px-4 py-3 text-left transition-colors",
                  condition === c.id
                    ? "border-[#0a8f6e] shadow-[0_0_0_1px_#0a8f6e]"
                    : "border-[#d2d2d7] hover:border-[#bfbfc7]",
                )}
              >
                <span className="block text-sm font-semibold text-[#1d1d1f]">{c.label}</span>
                <span className="block text-xs text-[#86868b]">{c.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="scard-bord">
          <div className="mb-1 flex items-baseline gap-3">
            <span className="text-[13px] font-bold text-[#0a8f6e]">03</span>
            <span className="text-[18px] font-bold tracking-[-.01em]">A couple of details</span>
          </div>
          <p className="mb-[18px] text-[13.5px] text-[#86868b]">
            Storage and a quick check fine-tune your offer.
          </p>

          <div className="field">
            <span className="flabel">Storage</span>
            <div className="flex flex-wrap gap-2">
              {device.storage.map((s) => (
                <button
                  key={s.gb}
                  onClick={() => setGb(s.gb)}
                  className={cn("chip", gb === s.gb && "on accent")}
                >
                  {s.gb >= 1024 ? "1TB" : `${s.gb}GB`}
                </button>
              ))}
            </div>
          </div>

          <div className="field mt-[18px]">
            <span className="flabel">Is it fully unlocked &amp; paid off?</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setUnlocked(true)}
                className={cn("chip", unlocked && "on accent")}
              >
                Yes
              </button>
              <button
                onClick={() => setUnlocked(false)}
                className={cn("chip", !unlocked && "on accent")}
              >
                No / not sure
              </button>
            </div>
          </div>
        </div>

        <div className="scard-bord grid gap-[22px] sm:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="flex flex-col gap-1.5">
              <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#edf6f0] text-[15px] font-bold text-[#0a8f6e]">
                {w.mark}
              </div>
              <div className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{w.title}</div>
              <p className="text-[13px] leading-snug text-[#6e6e73]">{w.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* quote */}
      <aside>
        <div className="sticky top-[74px] overflow-hidden rounded-[20px] border border-[#d2d2d7]">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center px-7 py-12 text-center"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#edf6f0]">
                  <CheckCircle2 className="h-9 w-9 text-[#0a8f6e]" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.02em] text-[#1d1d1f]">
                  Offer locked for 14 days
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6e6e73]">
                  We&apos;ll email a prepaid shipping label. Once your {device.name} is inspected,
                  you&apos;re paid within 2 business days. (Demo — nothing was sent.)
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="link mt-6"
                >
                  Start over
                </button>
              </motion.div>
            ) : (
              <motion.div key="quote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  className="px-7 pb-6 pt-6 text-white"
                  style={{ background: "linear-gradient(165deg,#0f9d78,#0a7d61)" }}
                >
                  <p className="text-[13px] font-medium opacity-90">Your instant offer</p>
                  <p className="mt-1.5 flex items-baseline gap-2 text-[46px] font-bold leading-[1.05] tracking-[-.03em]">
                    {formatPrice(cash)}
                    <span className="text-[15px] font-medium opacity-80">USD</span>
                  </p>
                  <p className="mt-2 text-[12.5px] opacity-90">
                    Estimated range {formatPrice(Math.round(cash * 0.9))}–{formatPrice(Math.round(cash * 1.08))}
                  </p>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <PhImg
                      slug={device.slug}
                      src={device.image}
                      label={device.name}
                      className="h-24 w-16 shrink-0 rounded-[12px]"
                      style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }}
                    />
                    <div>
                      <p className="text-sm text-[#86868b]">Your estimate for</p>
                      <p className="text-lg font-bold text-[#1d1d1f]">{device.name}</p>
                      <p className="text-xs text-[#86868b]">
                        {storageLabel} · {cond.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="scard p-4">
                      <p className="inline-flex items-center gap-1 text-xs text-[#6e6e73]">
                        <Banknote className="h-3.5 w-3.5" /> Cash
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-[-.02em] text-[#1d1d1f]">
                        {formatPrice(cash)}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-[#edf6f0] p-4">
                      <p className="inline-flex items-center gap-1 text-xs text-[#0a8f6e]">
                        <CreditCard className="h-3.5 w-3.5" /> Store credit
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-[-.02em] text-[#0a8f6e]">
                        {formatPrice(credit)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#6e6e73]">
                    <Truck className="h-3.5 w-3.5 text-[#0a8f6e]" /> Free prepaid shipping label · paid in 2 days
                  </p>

                  <button onClick={() => setSubmitted(true)} className="btn mt-6 w-full">
                    Lock this offer <ArrowRight className="h-[18px] w-[18px]" />
                  </button>

                  <div className="note2 mt-4">
                    No obligation. Final value confirmed after our free inspection — if it&apos;s
                    higher, you keep the difference.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}
