"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Truck, ShieldCheck, Recycle, Info, MapPin } from "lucide-react";
import {
  findRow,
  quote,
  GRADE_TAG,
  type TradeInModel,
  type Grade,
  type Lock,
} from "@/lib/trade-in-pricing";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

// Where sellers ship their trade-ins. TODO: replace with reMint's real intake
// address (owner to provide) — a prepaid label is emailed on lock either way.
const SHIP_TO = {
  name: "reMint Trade-ins",
  lines: ["[Street address — to be provided]", "[Unit / suite]", "[City, State ZIP]"],
};

const STEPS = ["Your device", "Its condition", "Your offer"] as const;
const GROUP_ORDER: TradeInModel["group"][] = ["iPhone", "Galaxy", "iPad"];

const SCREEN_OPTS = [
  { id: "flawless", label: "Flawless", desc: "No scratches, no cracks" },
  { id: "light", label: "Light scratches", desc: "Minor marks, glass intact" },
  { id: "cracked", label: "Cracked glass", desc: "Chipped/cracked, display still works" },
  { id: "display", label: "Display fault", desc: "Lines, spots, dead pixels or won't display" },
] as const;
type ScreenId = (typeof SCREEN_OPTS)[number]["id"];

const BODY_OPTS = [
  { id: "mint", label: "Like new", desc: "No visible wear" },
  { id: "light", label: "Light wear", desc: "A few small marks" },
  { id: "heavy", label: "Heavy wear", desc: "Dents or deep scuffs" },
] as const;
type BodyId = (typeof BODY_OPTS)[number]["id"];

const PAYOUTS = [
  { id: "paypal", label: "PayPal", detail: "Your PayPal email", timing: "Paid within 2 business days" },
  { id: "bank", label: "Bank transfer", detail: "Account & routing number (or IBAN)", timing: "Up to 5 business days" },
  { id: "credit", label: "Store credit", detail: "", timing: "+10% bonus · instant" },
] as const;
type PayoutId = (typeof PAYOUTS)[number]["id"];

// Carrier state. AT&T-locked devices sell for less than other carriers, so they
// carry their own (lower) tier in the price book; everything else uses the
// generic carrier-locked tier.
const CARRIERS = [
  { id: "unlocked", label: "Unlocked" },
  { id: "verizon", label: "Verizon" },
  { id: "tmobile", label: "T-Mobile" },
  { id: "att", label: "AT&T" },
  { id: "other", label: "Other" },
] as const;
type CarrierId = (typeof CARRIERS)[number]["id"];

const TRUST = [
  { icon: ShieldCheck, title: "Price-lock for 7 days", body: "Your quote is held for a week — we honor it as long as the device matches." },
  { icon: Truck, title: "Free prepaid shipping", body: "We email a label and a recycled box kit. Drop it off, fully tracked and insured." },
  { icon: Recycle, title: "PayPal, bank or credit", body: "PayPal in ~2 days, bank transfer up to 5, or take +10% as instant store credit." },
];

function deriveGrade(works: boolean, screen: ScreenId, body: BodyId): Grade {
  if (!works) return "doa";
  if (screen === "display") return "d";
  if (screen === "cracked") return "c";
  return screen === "flawless" && body === "mint" ? "a" : "b";
}

export function TradeInWizard({
  models,
  initialSlug,
}: {
  models: TradeInModel[];
  initialSlug?: string;
}) {
  const groups = useMemo(
    () => GROUP_ORDER.filter((g) => models.some((m) => m.group === g)),
    [models],
  );
  const initial = initialSlug ? models.find((m) => m.catalogSlug === initialSlug) : undefined;
  const first = initial ?? models[0];

  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<TradeInModel["group"]>(first?.group ?? "iPhone");
  const modelsInGroup = useMemo(() => models.filter((m) => m.group === group), [models, group]);
  const [key, setKey] = useState(first?.key ?? models[0]?.key);
  const model = useMemo(
    () => models.find((m) => m.key === key) ?? modelsInGroup[0] ?? models[0],
    [models, key, modelsInGroup],
  );

  const [gb, setGb] = useState(first?.storages[0] ?? 0);
  const [carrier, setCarrier] = useState<CarrierId>("unlocked");

  const [works, setWorks] = useState(true);
  const [screen, setScreen] = useState<ScreenId>("light");
  const [body, setBody] = useState<BodyId>("light");
  const [backCracked, setBackCracked] = useState(false);
  const [lensCracked, setLensCracked] = useState(false);
  const [faceIdOk, setFaceIdOk] = useState(true);
  const [battery80, setBattery80] = useState(true);
  const [repairMsg, setRepairMsg] = useState(false);

  const [payout, setPayout] = useState<PayoutId>("paypal");
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [payoutDetail, setPayoutDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // keep gb / carrier valid for the selected model
  useEffect(() => {
    setGb(model?.storages[0] ?? 0);
    setCarrier("unlocked");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const carrierChoice = !!model && model.locks.some((l) => l !== "unlocked");
  // Map the chosen carrier to a price-book lock tier.
  const lock: Lock =
    carrier === "unlocked"
      ? "unlocked"
      : carrier === "att" && model?.locks.includes("att")
        ? "att"
        : "locked";
  const grade = deriveGrade(works, screen, body);

  const q = useMemo(() => {
    const row = model ? findRow(model, gb, lock) : undefined;
    if (!row) return { grade, base: 0, deductions: [], notes: [], total: 0, hasPrice: false };
    return quote(row, {
      grade,
      crackedBack: backCracked,
      crackedLens: lensCracked,
      badFaceId: !faceIdOk,
      batteryLow: !battery80,
      repairMessage: repairMsg,
    });
  }, [model, gb, lock, grade, backCracked, lensCracked, faceIdOk, battery80, repairMsg]);

  const cash = Math.max(5, q.total);
  const credit = Math.round(cash * 1.1);
  const isCredit = payout === "credit";
  const payoutVal = isCredit ? credit : cash;
  const storageLabel = gb >= 1024 ? `${gb / 1024}TB` : gb > 0 ? `${gb}GB` : "";

  const topOffer = useMemo(() => {
    const row = model ? findRow(model, gb, lock) : undefined;
    return row?.a ?? row?.new ?? row?.swap ?? 0;
  }, [model, gb, lock]);

  function changeGroup(g: TradeInModel["group"]) {
    setGroup(g);
    const m = models.find((x) => x.group === g);
    if (m) setKey(m.key);
  }

  const canLock = sellerName.trim() && /.+@.+\..+/.test(sellerEmail) && (isCredit || payoutDetail.trim());

  if (!model) return null;

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
              <p className="mb-5 mt-1 text-[13.5px] text-[#86868b]">
                We buy the full range — {models.length}+ models. Pick yours.
              </p>

              <span className="flabel">Type</span>
              <div className="mb-5 flex flex-wrap gap-2">
                {groups.map((g) => (
                  <button key={g} onClick={() => changeGroup(g)} className={cn("chip", group === g && "on accent")}>
                    {g}
                  </button>
                ))}
              </div>

              <label className="flabel" htmlFor="ti-model">Model</label>
              <select id="ti-model" value={key} onChange={(e) => setKey(e.target.value)} className="sel mb-5">
                {modelsInGroup.map((m) => (
                  <option key={m.key} value={m.key}>{m.name}</option>
                ))}
              </select>

              {model.storages.length > 0 && (
                <>
                  <span className="flabel">Storage</span>
                  <div className="flex flex-wrap gap-2">
                    {model.storages.map((s) => (
                      <button key={s} onClick={() => setGb(s)} className={cn("chip", gb === s && "on accent")}>
                        {s >= 1024 ? `${s / 1024}TB` : `${s}GB`}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {carrierChoice && (
                <>
                  <span className="flabel mt-5 block">Carrier</span>
                  <div className="flex flex-wrap gap-2">
                    {CARRIERS.map((c) => (
                      <button key={c.id} onClick={() => setCarrier(c.id)} className={cn("chip", carrier === c.id && "on accent")}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[12px] text-[#86868b]">
                    Fully unlocked devices are worth the most. Not sure if it&apos;s locked? Pick your
                    carrier — we re-quote up if it turns out unlocked.
                  </p>
                </>
              )}

              <div className="mt-6 flex items-center justify-between gap-4 rounded-[14px] bg-[#edf6f0] px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#0a7d61]">We pay up to</p>
                  <p className="text-[26px] font-bold leading-none tracking-[-.02em] text-[#0a7d61]">
                    {formatPrice(topOffer)}
                  </p>
                </div>
                <p className="max-w-[190px] text-right text-[12px] leading-snug text-[#5c8a78]">
                  for a flawless {model.name}{storageLabel ? ` ${storageLabel}` : ""}. Answer a few
                  questions for your exact offer.
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
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Does it power on and work?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Turns on, boots, and the touchscreen responds.</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setWorks(true)} className={cn("chip", works && "on accent")}>Yes, it powers on</button>
                  <button onClick={() => setWorks(false)} className={cn("chip", !works && "on accent")}>No / no signs of life</button>
                </div>
              </div>

              {works && (
                <>
                  <div className="scard-bord">
                    <h2 className="text-[20px] font-bold tracking-[-.01em]">Screen &amp; display</h2>
                    <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Be honest — we re-grade on arrival and price-match to what we find.</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SCREEN_OPTS.map((o) => (
                        <OptCard key={o.id} active={screen === o.id} onClick={() => setScreen(o.id)} label={o.label} desc={o.desc} />
                      ))}
                    </div>
                  </div>

                  <div className="scard-bord">
                    <h2 className="text-[20px] font-bold tracking-[-.01em]">Body &amp; frame</h2>
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {BODY_OPTS.map((o) => (
                        <OptCard key={o.id} active={body === o.id} onClick={() => setBody(o.id)} label={o.label} desc={o.desc} />
                      ))}
                    </div>
                  </div>

                  <div className="scard-bord">
                    <h2 className="text-[20px] font-bold tracking-[-.01em]">A few things we check</h2>
                    <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">These can affect the final price — tell us up front and there are no surprises.</p>
                    <div className="flex flex-col gap-2.5">
                      <Toggle label="Back glass cracked?" yes={backCracked} onYes={() => setBackCracked(true)} onNo={() => setBackCracked(false)} />
                      <Toggle label="Camera lens cracked?" yes={lensCracked} onYes={() => setLensCracked(true)} onNo={() => setLensCracked(false)} />
                      <Toggle label="Face ID / fingerprint working?" invert yes={faceIdOk} onYes={() => setFaceIdOk(true)} onNo={() => setFaceIdOk(false)} />
                      <Toggle label="Battery health 80% or above?" invert yes={battery80} onYes={() => setBattery80(true)} onNo={() => setBattery80(false)} />
                      <Toggle label="Any repair / non-genuine part messages?" yes={repairMsg} onYes={() => setRepairMsg(true)} onNo={() => setRepairMsg(false)} />
                    </div>
                  </div>
                </>
              )}

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

          {/* STEP 3 — offer + details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-[18px]">
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">How would you like to be paid?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">We pay by PayPal or bank transfer — or take store credit for a 10% bonus. (We don&apos;t send cash.)</p>
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
                        <span className="mt-0.5 block text-[10.5px] leading-tight text-[#86868b]">{p.timing}</span>
                      </button>
                    );
                  })}
                </div>

                {/* price breakdown */}
                <div className="mt-5 rounded-[14px] border border-[#e2e2e6] p-4">
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="text-[#6e6e73]">{GRADE_TAG[q.grade]} — base offer</span>
                    <span className="font-semibold text-[#1d1d1f]">{formatPrice(q.base)}</span>
                  </div>
                  {q.deductions.map((d) => (
                    <div key={d.label} className="mt-1.5 flex items-center justify-between text-[13.5px]">
                      <span className="text-[#b23b3b]">− {d.label}</span>
                      <span className="font-semibold text-[#b23b3b]">−{formatPrice(d.amount)}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex items-center justify-between border-t border-[#e2e2e6] pt-3">
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">Your {isCredit ? "store-credit" : payout === "bank" ? "bank-transfer" : "PayPal"} offer</span>
                    <span className="text-[16px] font-bold text-[#0a8f6e]">{formatPrice(payoutVal)}</span>
                  </div>
                  {q.notes.map((n) => (
                    <p key={n} className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-[#9a6a00]">
                      <Info className="mt-[1px] h-3.5 w-3.5 flex-none" /> {n}
                    </p>
                  ))}
                </div>
              </div>

              {/* seller details */}
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Your details</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">So we can send your prepaid label and your payment.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="flabel" htmlFor="ti-name">Full name</label>
                    <input id="ti-name" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="inpt" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="flabel" htmlFor="ti-email">Email</label>
                    <input id="ti-email" type="email" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} className="inpt" placeholder="you@email.com" />
                  </div>
                  {!isCredit && (
                    <div className="sm:col-span-2">
                      <label className="flabel" htmlFor="ti-payout">
                        {payout === "paypal" ? "PayPal email" : "Bank details"}
                      </label>
                      <input
                        id="ti-payout"
                        value={payoutDetail}
                        onChange={(e) => setPayoutDetail(e.target.value)}
                        className="inpt"
                        placeholder={PAYOUTS.find((p) => p.id === payout)?.detail}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ship-to */}
              <div className="scard-bord">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-[#edf6f0] text-[#0a8f6e]">
                    <MapPin className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Where to ship it</h3>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#6e6e73]">
                      {SHIP_TO.name}
                      <br />
                      {SHIP_TO.lines.join(" · ")}
                    </p>
                    <p className="mt-1.5 text-[12px] text-[#86868b]">
                      Lock your offer and we&apos;ll email a <b>free prepaid shipping label</b> — no need
                      to write this down.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
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
                <h3 className="mt-5 text-2xl font-bold tracking-[-.02em] text-[#1d1d1f]">Offer locked for 7 days</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6e6e73]">
                  We&apos;ll email {sellerEmail || "you"} a prepaid label for your {model.name}. Ship it to{" "}
                  {SHIP_TO.name}; once inspected you&apos;re paid by {isCredit ? "store credit" : payout === "bank" ? "bank transfer (up to 5 business days)" : "PayPal (within 2 business days)"}. (Demo — nothing was sent.)
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
                  <p className="mt-2 text-[12.5px] opacity-90">{isCredit ? `Includes a +10% store-credit bonus (+${formatPrice(credit - cash)}).` : payout === "bank" ? "Bank transfer, up to 5 business days." : "Paid to PayPal within 2 business days."}</p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <PhImg slug={model.catalogSlug ?? model.key} src={model.image} label={model.name} className="h-24 w-16 shrink-0 rounded-[12px]" style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }} />
                    <div>
                      <p className="text-sm text-[#86868b]">Trading in</p>
                      <p className="text-lg font-bold text-[#1d1d1f]">{model.name}</p>
                      <p className="text-xs text-[#86868b]">{[storageLabel, GRADE_TAG[q.grade]].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-2.5 border-t border-[#d2d2d7] pt-4 text-[13.5px]">
                    {([["Device", model.name], ["Storage", storageLabel || "—"], ["Grade", GRADE_TAG[q.grade]], ["Carrier", carrierChoice ? (CARRIERS.find((c) => c.id === carrier)?.label ?? "Unlocked") : "—"]] as const).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <span className="text-[#86868b]">{k}</span>
                        <span className="font-semibold text-[#1d1d1f]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {step === 2 ? (
                    <button onClick={() => canLock && setSubmitted(true)} disabled={!canLock} className={cn("btn mt-6 w-full", !canLock && "opacity-50")}>
                      Lock this offer <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  ) : (
                    <button onClick={() => setStep(step + 1)} className="btn mt-6 w-full">
                      {step === 0 ? "Continue" : "See my offer"} <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  )}
                  {step === 2 && !canLock && (
                    <p className="mt-2 text-center text-[12px] text-[#86868b]">Add your name, email and payout details to lock it.</p>
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

function Toggle({
  label, yes, onYes, onNo, invert,
}: {
  label: string; yes: boolean; onYes: () => void; onNo: () => void; invert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[#1d1d1f]">{label}</span>
      <div className="flex gap-1.5">
        <button
          onClick={onYes}
          className={cn("rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors",
            yes ? (invert ? "border-[#0a8f6e] bg-[#edf6f0] text-[#0a7d61]" : "border-[#d99] bg-[#fbeaea] text-[#b23b3b]") : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#bfbfc7]")}
        >
          Yes
        </button>
        <button
          onClick={onNo}
          className={cn("rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors",
            !yes ? (invert ? "border-[#d99] bg-[#fbeaea] text-[#b23b3b]" : "border-[#0a8f6e] bg-[#edf6f0] text-[#0a7d61]") : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#bfbfc7]")}
        >
          No
        </button>
      </div>
    </div>
  );
}
