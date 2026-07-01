"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Truck, ShieldCheck, Recycle } from "lucide-react";
import { DEVICES, baseStorage, storageFor, BRANDS, type Brand } from "@/lib/products";
import type { TradeInPricing } from "@/lib/trade-in-pricing";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

const STEPS = ["Your device", "Its condition", "Your offer"] as const;

/** Best-case condition factor (flawless + unlocked) — the sheet's payout is the
 *  price we pay in exactly that state, so it anchors the top of the scale. */
const MAX_FACTOR = 0.85;

const SCREEN_OPTS = [
  { id: "flawless", label: "Flawless", desc: "No scratches at all", rank: 0 },
  { id: "minor", label: "Light scratches", desc: "Faint marks, no cracks", rank: 1 },
  { id: "worn", label: "Heavily scratched", desc: "Deep scratches, still works", rank: 2 },
  { id: "cracked", label: "Cracked", desc: "Glass is cracked or chipped", rank: 3 },
] as const;
const BODY_OPTS = [
  { id: "flawless", label: "Flawless", desc: "Like new", rank: 0 },
  { id: "light", label: "Light wear", desc: "A few small marks", rank: 1 },
  { id: "heavy", label: "Heavy wear", desc: "Dents or deep scuffs", rank: 2 },
] as const;

type ScreenId = (typeof SCREEN_OPTS)[number]["id"];
type BodyId = (typeof BODY_OPTS)[number]["id"];

const PAYOUTS = [
  { id: "cash", label: "Cash" },
  { id: "paypal", label: "PayPal" },
  { id: "credit", label: "Store credit" },
] as const;
type PayoutId = (typeof PAYOUTS)[number]["id"];

const TRUST = [
  { icon: ShieldCheck, title: "Price-lock for 14 days", body: "Your quote is held for two weeks — we honor it as long as the device matches." },
  { icon: Truck, title: "Free prepaid shipping", body: "We email a label and a recycled box kit. Drop it off, fully tracked and insured." },
  { icon: Recycle, title: "Paid in 48 hours", body: "Pick cash, PayPal, or take +10% as store credit after a quick inspection." },
];

/** Combined condition factor from the wizard answers (share of trade-in value). */
function conditionFactor(works: boolean, screen: ScreenId, body: BodyId, unlocked: boolean) {
  let factor: number;
  if (!works || screen === "cracked") {
    factor = 0.18;
  } else {
    const wear = Math.max(
      SCREEN_OPTS.find((s) => s.id === screen)!.rank,
      BODY_OPTS.find((b) => b.id === body)!.rank,
    );
    factor = wear <= 0 ? 0.85 : wear === 1 ? 0.62 : 0.42;
  }
  return factor * (unlocked ? 1 : 0.9);
}

export function TradeInWizard({
  initialSlug,
  pricing,
}: {
  initialSlug?: string;
  pricing?: TradeInPricing;
}) {
  const initial = initialSlug ? DEVICES.find((d) => d.slug === initialSlug) : undefined;
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState<Brand>(initial?.brand ?? "Apple");
  const brandDevices = useMemo(() => DEVICES.filter((d) => d.brand === brand), [brand]);
  const [slug, setSlug] = useState(initial?.slug ?? brandDevices[0].slug);
  const device = useMemo(() => DEVICES.find((d) => d.slug === slug) ?? brandDevices[0], [slug, brandDevices]);
  const [gb, setGb] = useState(baseStorage(initial ?? brandDevices[0]).gb);

  const [works, setWorks] = useState(true);
  const [screen, setScreen] = useState<ScreenId>("minor");
  const [body, setBody] = useState<BodyId>("light");
  const [unlocked, setUnlocked] = useState(true);
  const [payout, setPayout] = useState<PayoutId>("cash");
  const [submitted, setSubmitted] = useState(false);

  const sOpt = storageFor(device, gb);
  const factor = conditionFactor(works, screen, body, unlocked);
  // Real payout we pay for this exact model/capacity, from the owner's sheet
  // (top = flawless & unlocked). Fall back to the catalog estimate if the sheet
  // has no price for it. `top / MAX_FACTOR` re-bases so a flawless unit pays the
  // sheet price exactly, and lesser conditions scale down from there.
  const devicePricing = pricing?.[device.slug];
  const sheetTop = devicePricing?.byGb?.[gb] ?? devicePricing?.top;
  const base = sheetTop ? sheetTop / MAX_FACTOR : sOpt.wholesale;
  const cash = Math.max(15, Math.round(base * factor));
  const credit = Math.round(cash * 1.1);
  // Headline "we pay up to" for the selected model/capacity (flawless + unlocked).
  const topOffer = Math.round(base * MAX_FACTOR);
  const livePrice = sheetTop != null;
  const isCredit = payout === "credit";
  const payoutVal = isCredit ? credit : cash;
  const storageLabel = gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`;
  const condLabel = !works || screen === "cracked" ? "Cracked / faulty" : factor >= 0.8 ? "Flawless" : factor >= 0.58 ? "Good" : "Fair";

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
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      {/* ── wizard ── */}
      <div>
        {/* progress */}
        <div className="mb-7 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-2 text-[13px] font-semibold transition-colors",
                  i === step ? "text-[#0a8f6e]" : i < step ? "text-[#1d1d1f]" : "text-[#b0b0b6]",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full text-[12px]",
                    i < step ? "bg-[#0a8f6e] text-white" : i === step ? "border-2 border-[#0a8f6e] text-[#0a8f6e]" : "border border-[#d2d2d7]",
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-[#e2e2e6]" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — device */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="scard-bord">
              <h2 className="text-[20px] font-bold tracking-[-.01em]">Which device are you trading in?</h2>
              <p className="mb-5 mt-1 text-[13.5px] text-[#86868b]">Pick the brand, model and storage.</p>

              <span className="flabel">Brand</span>
              <div className="mb-5 flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <button key={b} onClick={() => changeBrand(b)} className={cn("chip", brand === b && "on accent")}>
                    {b}
                  </button>
                ))}
              </div>

              <label className="flabel" htmlFor="ti-model">Model</label>
              <select id="ti-model" value={slug} onChange={(e) => changeDevice(e.target.value)} className="sel mb-5">
                {brandDevices.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>

              <span className="flabel">Storage</span>
              <div className="flex flex-wrap gap-2">
                {device.storage.map((s) => (
                  <button key={s.gb} onClick={() => setGb(s.gb)} className={cn("chip", gb === s.gb && "on accent")}>
                    {s.gb >= 1024 ? `${s.gb / 1024}TB` : `${s.gb}GB`}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-[14px] bg-[#edf6f0] px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#0a7d61]">
                    We pay up to{livePrice ? "" : " an estimated"}
                  </p>
                  <p className="text-[26px] font-bold leading-none tracking-[-.02em] text-[#0a7d61]">
                    {formatPrice(topOffer)}
                  </p>
                </div>
                <p className="max-w-[190px] text-right text-[12px] leading-snug text-[#5c8a78]">
                  for a flawless, unlocked {device.name} {storageLabel}. Answer a few questions for
                  your exact offer.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(1)} className="btn">
                  Continue <ArrowRight className="h-[18px] w-[18px]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — condition */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-[18px]">
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Does it power on and work normally?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Screen, buttons, cameras and Face/Touch ID all functioning.</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setWorks(true)} className={cn("chip", works && "on accent")}>Yes, works fully</button>
                  <button onClick={() => setWorks(false)} className={cn("chip", !works && "on accent")}>No / has a fault</button>
                </div>
              </div>

              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Screen condition</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Be honest — we re-grade on arrival and price-match to what we find.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SCREEN_OPTS.map((o) => (
                    <OptCard key={o.id} active={screen === o.id} onClick={() => setScreen(o.id)} label={o.label} desc={o.desc} />
                  ))}
                </div>
              </div>

              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Body &amp; frame condition</h2>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {BODY_OPTS.map((o) => (
                    <OptCard key={o.id} active={body === o.id} onClick={() => setBody(o.id)} label={o.label} desc={o.desc} />
                  ))}
                </div>
              </div>

              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Is it unlocked &amp; fully paid off?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Carrier-unlocked, no iCloud/Google lock, no outstanding balance.</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setUnlocked(true)} className={cn("chip", unlocked && "on accent")}>Yes</button>
                  <button onClick={() => setUnlocked(false)} className={cn("chip", !unlocked && "on accent")}>No / not sure</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(0)} className="link inline-flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={() => setStep(2)} className="btn">
                  See my offer <ArrowRight className="h-[18px] w-[18px]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — offer */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="scard-bord">
              <h2 className="text-[20px] font-bold tracking-[-.01em]">How would you like to be paid?</h2>
              <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Store credit adds a 10% bonus you can spend right away.</p>
              <div className="grid grid-cols-3 gap-2.5">
                {PAYOUTS.map((p) => {
                  const amount = p.id === "credit" ? credit : cash;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPayout(p.id)}
                      className={cn(
                        "rounded-[13px] border px-3 py-3 text-center transition-colors",
                        payout === p.id ? "border-[#0a8f6e] shadow-[0_0_0_1px_#0a8f6e]" : "border-[#d2d2d7] hover:border-[#bfbfc7]",
                      )}
                    >
                      <span className="block text-[14px] font-semibold text-[#1d1d1f]">{p.label}</span>
                      <span className="mt-0.5 block text-[12px] font-semibold text-[#0a8f6e]">
                        {p.id === "credit" ? `${formatPrice(amount)} · +10%` : formatPrice(amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="link inline-flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* trust row */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="flex flex-col gap-1.5">
              <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#edf6f0] text-[#0a8f6e]">
                <t.icon className="h-[18px] w-[18px]" />
              </div>
              <div className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{t.title}</div>
              <p className="text-[13px] leading-snug text-[#6e6e73]">{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── live offer ── */}
      <aside>
        <div className="sticky top-[74px] overflow-hidden rounded-[20px] border border-[#d2d2d7]">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center px-7 py-12 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#edf6f0]">
                  <Check className="h-9 w-9 text-[#0a8f6e]" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.02em] text-[#1d1d1f]">Offer locked for 14 days</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6e6e73]">
                  We&apos;ll email a prepaid label for your {device.name}. Once it&apos;s inspected, you&apos;re paid within 2 business days. (Demo — nothing was sent.)
                </p>
                {isCredit && (
                  <Link href="/shop" className="btn mt-6">Shop with my {formatPrice(credit)} credit</Link>
                )}
                <button onClick={() => { setSubmitted(false); setStep(0); }} className="link mt-4">Start over</button>
              </motion.div>
            ) : (
              <motion.div key="offer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="px-7 pb-6 pt-6 text-white" style={{ background: "linear-gradient(165deg,#0f9d78,#0a7d61)" }}>
                  <p className="text-[13px] font-medium opacity-90">{step === 2 ? "Your instant offer" : "Estimated offer so far"}</p>
                  <p className="mt-1.5 flex items-baseline gap-2 text-[44px] font-bold leading-[1.05] tracking-[-.03em]">
                    {formatPrice(payoutVal)}
                    <span className="text-[15px] font-medium opacity-80">USD</span>
                  </p>
                  <p className="mt-2 text-[12.5px] opacity-90">{isCredit ? `Includes a +10% store-credit bonus (+${formatPrice(credit - cash)}).` : "Cash or PayPal, paid within 48 hours."}</p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <PhImg slug={device.slug} src={device.image} label={device.name} className="h-24 w-16 shrink-0 rounded-[12px]" style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }} />
                    <div>
                      <p className="text-sm text-[#86868b]">Trading in</p>
                      <p className="text-lg font-bold text-[#1d1d1f]">{device.name}</p>
                      <p className="text-xs text-[#86868b]">{storageLabel} · {condLabel}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-2.5 border-t border-[#d2d2d7] pt-4 text-[13.5px]">
                    {([["Device", device.name], ["Storage", storageLabel], ["Condition", condLabel], ["Unlocked", unlocked ? "Yes" : "No / unsure"]] as const).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <span className="text-[#86868b]">{k}</span>
                        <span className="font-semibold text-[#1d1d1f]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {step === 2 ? (
                    <button onClick={() => setSubmitted(true)} className="btn mt-6 w-full">
                      Lock this offer <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  ) : (
                    <button onClick={() => setStep(step + 1)} className="btn mt-6 w-full">
                      {step === 0 ? "Continue" : "See my offer"} <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  )}
                  <p className="note2 mt-4">No obligation. Final value confirmed after our free inspection — if it&apos;s higher, you keep the difference.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}

function OptCard({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[13px] border px-4 py-3 text-left transition-colors",
        active ? "border-[#0a8f6e] shadow-[0_0_0_1px_#0a8f6e]" : "border-[#d2d2d7] hover:border-[#bfbfc7]",
      )}
    >
      <span className="block text-sm font-semibold text-[#1d1d1f]">{label}</span>
      <span className="block text-xs text-[#86868b]">{desc}</span>
    </button>
  );
}
