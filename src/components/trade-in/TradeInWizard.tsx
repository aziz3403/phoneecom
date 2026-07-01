"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, ArrowRight, ArrowLeft, Truck, ShieldCheck, Recycle, Info, MapPin,
  Plus, Minus, Trash2, PartyPopper, Mail, Banknote, Trophy,
} from "lucide-react";
import {
  findRow, quote, GRADE_TAG, FREE_SHIP_MIN,
  type TradeInModel, type Grade, type Lock, type Deduction,
} from "@/lib/trade-in-pricing";
import { PhImg } from "@/components/home/PhImg";
import { formatPrice, cn } from "@/lib/utils";

// Where sellers ship trade-ins. TODO: owner to provide the real intake address —
// a prepaid label is emailed on lock when the order qualifies for free shipping.
const SHIP_TO = {
  name: "reMint Trade-ins",
  lines: ["[Street address — to be provided]", "[Unit / suite]", "[City, State ZIP]"],
};

const GROUP_ORDER: TradeInModel["group"][] = ["iPhone", "Galaxy", "iPad"];

const SCREEN_OPTS = [
  { id: "flawless", label: "Flawless", desc: "No scratches or cracks" },
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
  { id: "paypal", label: "PayPal", detail: "Your PayPal email", timing: "~2 business days" },
  { id: "bank", label: "Bank transfer", detail: "Account & routing number (or IBAN)", timing: "Up to 5 business days" },
  { id: "credit", label: "Store credit", detail: "", timing: "+10% bonus · instant" },
] as const;
type PayoutId = (typeof PAYOUTS)[number]["id"];

const CARRIERS = [
  { id: "unlocked", label: "Unlocked" },
  { id: "verizon", label: "Verizon" },
  { id: "tmobile", label: "T-Mobile" },
  { id: "att", label: "AT&T" },
  { id: "other", label: "Other" },
] as const;
type CarrierId = (typeof CARRIERS)[number]["id"];

function deriveGrade(works: boolean, screen: ScreenId, body: BodyId): Grade {
  if (!works) return "doa";
  if (screen === "display") return "d";
  if (screen === "cracked") return "c";
  return screen === "flawless" && body === "mint" ? "a" : "b";
}

interface Line {
  sig: string;
  modelKey: string;
  name: string;
  image?: string;
  catalogSlug?: string;
  gb: number;
  storageLabel: string;
  color: string;
  carrier: CarrierId;
  carrierLabel: string;
  grade: Grade;
  gradeTag: string;
  unit: number;
  base: number;
  deductions: Deduction[];
  notes: string[];
  qty: number;
}

export function TradeInWizard({
  models,
  initialSlug,
}: {
  models: TradeInModel[];
  initialSlug?: string;
}) {
  const groups = useMemo(() => GROUP_ORDER.filter((g) => models.some((m) => m.group === g)), [models]);
  const initial = initialSlug ? models.find((m) => m.catalogSlug === initialSlug) : undefined;
  const firstModel = initial ?? models[0];

  const [phase, setPhase] = useState<"build" | "checkout" | "done">("build");

  // ---- builder ----
  const [group, setGroup] = useState<TradeInModel["group"]>(firstModel?.group ?? "iPhone");
  const modelsInGroup = useMemo(() => models.filter((m) => m.group === group), [models, group]);
  const [key, setKey] = useState(firstModel?.key ?? models[0]?.key);
  const model = useMemo(() => models.find((m) => m.key === key) ?? modelsInGroup[0] ?? models[0], [models, key, modelsInGroup]);
  const [gb, setGb] = useState(firstModel?.storages[0] ?? 0);
  const [colorName, setColorName] = useState(firstModel?.colors[0]?.name ?? "Black");
  const [carrier, setCarrier] = useState<CarrierId>("unlocked");
  // Start at the best possible condition so the buyer sees the highest price first.
  const [works, setWorks] = useState(true);
  const [screen, setScreen] = useState<ScreenId>("flawless");
  const [body, setBody] = useState<BodyId>("mint");
  const [backCracked, setBackCracked] = useState(false);
  const [lensCracked, setLensCracked] = useState(false);
  const [faceIdOk, setFaceIdOk] = useState(true);
  const [battery80, setBattery80] = useState(true);
  const [repairMsg, setRepairMsg] = useState(false);
  const [qtyToAdd, setQtyToAdd] = useState(1);

  // ---- basket + checkout ----
  const [basket, setBasket] = useState<Line[]>([]);
  const [payout, setPayout] = useState<PayoutId>("paypal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const carrierChoice = !!model && model.locks.some((l) => l !== "unlocked");
  const lock: Lock = carrier === "unlocked" ? "unlocked" : carrier === "att" && model?.locks.includes("att") ? "att" : "locked";
  const grade = deriveGrade(works, screen, body);

  function pickModel(k: string) {
    const m = models.find((x) => x.key === k);
    setKey(k);
    setGb(m?.storages[0] ?? 0);
    setColorName(m?.colors[0]?.name ?? "Black");
    setCarrier("unlocked");
  }
  function pickGroup(g: TradeInModel["group"]) {
    setGroup(g);
    const m = models.find((x) => x.group === g);
    if (m) pickModel(m.key);
  }

  const q = useMemo(() => {
    const row = model ? findRow(model, gb, lock) : undefined;
    if (!row) return null;
    return quote(row, { grade, crackedBack: backCracked, crackedLens: lensCracked, badFaceId: !faceIdOk, batteryLow: !battery80, repairMessage: repairMsg });
  }, [model, gb, lock, grade, backCracked, lensCracked, faceIdOk, battery80, repairMsg]);

  const unit = q?.hasPrice ? Math.max(5, q.total) : 0;
  const storageLabel = gb >= 1024 ? `${gb / 1024}TB` : gb > 0 ? `${gb}GB` : "";
  // Photo follows the chosen colour when we have one, else the model's base shot.
  const colorImage = model?.colors.find((c) => c.name === colorName)?.image ?? model?.image;
  const carrierLabel = carrierChoice ? (CARRIERS.find((c) => c.id === carrier)?.label ?? "Unlocked") : "Unlocked";
  const topOffer = useMemo(() => {
    const row = model ? findRow(model, gb, lock) : undefined;
    return row?.a ?? row?.new ?? row?.swap ?? 0;
  }, [model, gb, lock]);

  function addToTrade() {
    if (!q?.hasPrice || !model) return;
    const sig = [model.key, gb, colorName, carrier, grade, backCracked, lensCracked, faceIdOk, battery80, repairMsg].join("~");
    setBasket((b) => {
      const i = b.findIndex((l) => l.sig === sig);
      if (i >= 0) { const copy = [...b]; copy[i] = { ...copy[i], qty: copy[i].qty + qtyToAdd }; return copy; }
      return [...b, {
        sig, modelKey: model.key, name: model.name, image: colorImage, catalogSlug: model.catalogSlug,
        gb, storageLabel, color: colorName, carrier, carrierLabel,
        grade: q.grade, gradeTag: GRADE_TAG[q.grade], unit, base: q.base, deductions: q.deductions, notes: q.notes, qty: qtyToAdd,
      }];
    });
    setQtyToAdd(1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }
  const setQty = (sig: string, d: number) =>
    setBasket((b) => b.map((l) => (l.sig === sig ? { ...l, qty: Math.max(1, l.qty + d) } : l)));
  const removeLine = (sig: string) => setBasket((b) => b.filter((l) => l.sig !== sig));

  const count = basket.reduce((n, l) => n + l.qty, 0);
  const subtotal = basket.reduce((n, l) => n + l.unit * l.qty, 0);
  const isCredit = payout === "credit";
  const total = isCredit ? Math.round(subtotal * 1.1) : subtotal;
  const freeShip = count >= FREE_SHIP_MIN;
  const payoutOk = isCredit || (payout === "paypal" ? /.+@.+\..+/.test(paypalEmail) : !!(routing.trim() && account.trim()));
  const canLock = !!(count > 0 && firstName.trim() && lastName.trim() && phone.trim() && /.+@.+\..+/.test(sellerEmail) && payoutOk);

  if (!model) return null;

  // ================= DONE — full-width, money-forward celebration =================
  if (phase === "done") {
    const paidBy = isCredit
      ? "as store credit, with your +10% bonus"
      : payout === "bank"
        ? "by bank transfer, in up to 5 business days"
        : "to PayPal, in about 2 business days";
    return (
      <div className="mx-auto max-w-[760px] py-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto grid h-[70px] w-[70px] place-items-center rounded-full bg-[#0a8f6e] shadow-[0_12px_30px_rgba(10,143,110,.32)]">
            <PartyPopper className="h-9 w-9 text-white" />
          </div>
          <p className="mt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-[#0a8f6e]">Offer locked · held 7 days</p>
          <h1 className="mt-2 text-[clamp(32px,5.5vw,52px)] font-bold leading-[1.03] tracking-[-.03em] text-[#1d1d1f]">
            {firstName ? `Nice one, ${firstName}. ` : ""}You&apos;re getting
            <br />
            <span className="text-gradient">{formatPrice(total)}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-relaxed text-[#6e6e73]">
            for {count} device{count === 1 ? "" : "s"} — paid {paidBy}, the moment we&apos;ve inspected{" "}
            {count === 1 ? "it" : "them"}. That&apos;s real money in your pocket, from among the highest
            payouts in the US.
          </p>
        </motion.div>

        {/* what you're sending + payout */}
        <div className="scard-bord mt-9">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">What you&apos;re sending</h3>
            <span className="text-[13px] text-[#86868b]">{count} device{count === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-[#eee]">
            {basket.map((l) => (
              <div key={l.sig} className="flex items-center gap-3 py-2.5 first:pt-0">
                <PhImg slug={l.catalogSlug ?? l.modelKey} src={l.image} label={l.name} className="h-14 w-10 shrink-0 rounded-[8px]" style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-[#1d1d1f]">{l.name}{l.qty > 1 ? ` · ×${l.qty}` : ""}</p>
                  <p className="truncate text-[11.5px] text-[#86868b]">{[l.storageLabel, l.color, l.carrierLabel, l.gradeTag].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="text-[13.5px] font-semibold text-[#1d1d1f]">{formatPrice(l.unit * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#eee] pt-3">
            <span className="text-[15px] font-semibold text-[#1d1d1f]">You get</span>
            <span className="text-[20px] font-bold text-[#0a8f6e]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* next steps */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, t: "Check your email", b: `We're sending ${sellerEmail || "you"} ${freeShip ? "a free prepaid label" : "shipping details"} and your kit.` },
            { icon: Truck, t: freeShip ? "Ship it free" : "Send it in", b: freeShip ? "Drop the labeled box — fully tracked & insured." : "Post it to us — inspection is always free." },
            { icon: Banknote, t: "Get paid", b: isCredit ? "Store credit lands instantly after inspection." : payout === "bank" ? "Bank transfer within 5 business days." : "PayPal within ~2 business days." },
          ].map((s) => (
            <div key={s.t} className="scard-bord">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-[11px] bg-[#edf6f0] text-[#0a8f6e]"><s.icon className="h-[19px] w-[19px]" /></div>
              <p className="text-[15px] font-semibold text-[#1d1d1f]">{s.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">{s.b}</p>
            </div>
          ))}
        </div>

        {/* price-beat reassurance */}
        <div className="mt-5 flex items-center justify-center gap-2.5 rounded-[14px] bg-[#edf6f0] px-5 py-3.5 text-center">
          <Trophy className="h-[18px] w-[18px] shrink-0 text-[#0a8f6e]" />
          <p className="text-[13.5px] text-[#0a7d61]">Found a higher quote elsewhere? We price-match <b>and beat</b> it — just reply to your email.</p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {isCredit && <Link href="/shop" className="btn">Spend my {formatPrice(total)} credit</Link>}
          <Link href="/shop" className={cn(isCredit ? "btn btn-lt" : "btn")}>Keep shopping</Link>
          <button onClick={() => { setBasket([]); setPhase("build"); }} className="link">Trade in more devices</button>
        </div>
        <p className="mt-5 text-center text-[12px] text-[#b0b0b6]">Demo — nothing was actually sent.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      {/* ── main column ── */}
      <div>
        {/* progress */}
        <div className="mb-7 flex items-center gap-2">
          {(["Add your devices", "Your details", "Done"] as const).map((s, i) => {
            const active = (phase === "build" && i === 0) || (phase === "checkout" && i === 1);
            const doneStep = phase === "checkout" && i === 0;
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => i === 0 && phase === "checkout" && setPhase("build")}
                  disabled={!(i === 0 && phase === "checkout")}
                  className={cn("flex items-center gap-2 text-[13px] font-semibold transition-colors",
                    active ? "text-[#0a8f6e]" : doneStep ? "text-[#1d1d1f]" : "text-[#b0b0b6]")}
                >
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[12px]",
                    doneStep ? "bg-[#0a8f6e] text-white" : active ? "border-2 border-[#0a8f6e] text-[#0a8f6e]" : "border border-[#d2d2d7]")}>
                    {doneStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < 2 && <span className="h-px flex-1 bg-[#e2e2e6]" />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ================= BUILD ================= */}
          {phase === "build" && (
            <motion.div key="build" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-[18px]">
              {/* device */}
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">Which device are you trading in?</h2>
                <p className="mb-5 mt-1 text-[13.5px] text-[#86868b]">We buy the full range — {models.length}+ models. Add as many as you like.</p>

                <span className="flabel">Type</span>
                <div className="mb-5 flex flex-wrap gap-2">
                  {groups.map((g) => (
                    <button key={g} onClick={() => pickGroup(g)} className={cn("chip", group === g && "on accent")}>{g}</button>
                  ))}
                </div>

                <label className="flabel" htmlFor="ti-model">Model</label>
                <select id="ti-model" value={key} onChange={(e) => pickModel(e.target.value)} className="sel mb-5">
                  {modelsInGroup.map((m) => (<option key={m.key} value={m.key}>{m.name}</option>))}
                </select>

                {model.storages.length > 0 && (
                  <>
                    <span className="flabel">Storage</span>
                    <div className="mb-5 flex flex-wrap gap-2">
                      {model.storages.map((s) => (
                        <button key={s} onClick={() => setGb(s)} className={cn("chip", gb === s && "on accent")}>
                          {s >= 1024 ? `${s / 1024}TB` : `${s}GB`}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mb-1 flex items-baseline justify-between">
                  <span className="flabel">Color</span>
                  <span className="text-[12.5px] text-[#86868b]">{colorName}</span>
                </div>
                <div className="mb-5 flex flex-wrap gap-2.5">
                  {model.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColorName(c.name)}
                      title={c.name}
                      aria-label={c.name}
                      className={cn("h-8 w-8 rounded-full border-2 transition", colorName === c.name ? "border-[#0a8f6e] shadow-[0_0_0_2px_#fff,0_0_0_3px_#0a8f6e]" : "border-[#e2e2e6]")}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>

                {carrierChoice && (
                  <>
                    <span className="flabel">Carrier</span>
                    <div className="flex flex-wrap gap-2">
                      {CARRIERS.map((c) => (
                        <button key={c.id} onClick={() => setCarrier(c.id)} className={cn("chip", carrier === c.id && "on accent")}>{c.label}</button>
                      ))}
                    </div>
                    <p className="mt-2 text-[12px] text-[#86868b]">Unlocked pays the most. Not sure? Pick your carrier — we re-quote up if it turns out unlocked.</p>
                  </>
                )}
              </div>

              {/* condition */}
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">What condition is it in?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">Starts at our best price — adjust honestly and watch your live offer. We re-grade on arrival and price-match to what we find.</p>

                <span className="flabel">Powers on &amp; works?</span>
                <div className="mb-4 flex flex-wrap gap-2">
                  <button onClick={() => setWorks(true)} className={cn("chip", works && "on accent")}>Yes, it powers on</button>
                  <button onClick={() => setWorks(false)} className={cn("chip", !works && "on accent")}>No / no signs of life</button>
                </div>

                {works && (
                  <>
                    <span className="flabel">Screen &amp; display</span>
                    <div className="mb-4 grid grid-cols-2 gap-2.5">
                      {SCREEN_OPTS.map((o) => (
                        <OptCard key={o.id} active={screen === o.id} onClick={() => setScreen(o.id)} label={o.label} desc={o.desc} />
                      ))}
                    </div>

                    <span className="flabel">Body &amp; frame</span>
                    <div className="mb-4 grid grid-cols-3 gap-2.5">
                      {BODY_OPTS.map((o) => (
                        <OptCard key={o.id} active={body === o.id} onClick={() => setBody(o.id)} label={o.label} desc={o.desc} />
                      ))}
                    </div>

                    <span className="flabel">A few things we check</span>
                    <div className="mt-1.5 flex flex-col gap-2.5">
                      <Toggle label="Back glass cracked?" yes={backCracked} onYes={() => setBackCracked(true)} onNo={() => setBackCracked(false)} />
                      <Toggle label="Camera lens cracked?" yes={lensCracked} onYes={() => setLensCracked(true)} onNo={() => setLensCracked(false)} />
                      <Toggle label="Face ID / fingerprint working?" invert yes={faceIdOk} onYes={() => setFaceIdOk(true)} onNo={() => setFaceIdOk(false)} />
                      <Toggle label="Battery health 80% or above?" invert yes={battery80} onYes={() => setBattery80(true)} onNo={() => setBattery80(false)} />
                      <Toggle label="Any repair / non-genuine part messages?" yes={repairMsg} onYes={() => setRepairMsg(true)} onNo={() => setRepairMsg(false)} />
                    </div>
                  </>
                )}

                {/* live value + quantity for the current device */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[#edf6f0] px-5 py-4">
                  <div>
                    <p className="text-[12.5px] font-medium text-[#0a7d61]">This {model.name} — {GRADE_TAG[grade]}</p>
                    <p className="text-[26px] font-bold leading-none tracking-[-.02em] text-[#0a7d61]">
                      {formatPrice(unit)}{qtyToAdd > 1 && <span className="text-[15px] font-semibold"> × {qtyToAdd}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="inline-flex items-center rounded-full border border-[#bfe0d3] bg-white">
                      <button onClick={() => setQtyToAdd((n) => Math.max(1, n - 1))} className="grid h-8 w-8 place-items-center text-[#0a7d61]" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="min-w-[22px] text-center text-[14px] font-semibold text-[#0a7d61]">{qtyToAdd}</span>
                      <button onClick={() => setQtyToAdd((n) => n + 1)} className="grid h-8 w-8 place-items-center text-[#0a7d61]" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={addToTrade} className="btn !bg-[#0a8f6e]">
                      {justAdded ? (<><Check className="h-[18px] w-[18px]" /> Added</>) : (<><Plus className="h-[18px] w-[18px]" /> Add</>)}
                    </button>
                  </div>
                </div>
                {(q?.deductions.length || q?.notes.length) ? (
                  <div className="mt-2.5 flex flex-col gap-1">
                    {q?.deductions.map((d) => (
                      <p key={d.label} className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]"><Minus className="h-3 w-3 text-[#b23b3b]" />{d.label}: −{formatPrice(d.amount)}</p>
                    ))}
                    {q?.notes.map((n) => (
                      <p key={n} className="flex items-start gap-1.5 text-[12px] leading-snug text-[#9a6a00]"><Info className="mt-[1px] h-3.5 w-3.5 flex-none" />{n}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* ================= CHECKOUT ================= */}
          {phase === "checkout" && (
            <motion.div key="checkout" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-[18px]">
              <div className="scard-bord">
                <h2 className="text-[20px] font-bold tracking-[-.01em]">How would you like to be paid?</h2>
                <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">We pay by PayPal or bank transfer — or take store credit for a 10% bonus. (We don&apos;t send cash.)</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {PAYOUTS.map((p) => (
                    <button key={p.id} onClick={() => setPayout(p.id)}
                      className={cn("rounded-[13px] border px-3 py-3 text-center transition-colors",
                        payout === p.id ? "border-[#0a8f6e] shadow-[0_0_0_1px_#0a8f6e]" : "border-[#d2d2d7] hover:border-[#bfbfc7]")}>
                      <span className="block text-[14px] font-semibold text-[#1d1d1f]">{p.label}</span>
                      <span className="mt-0.5 block text-[10.5px] leading-tight text-[#86868b]">{p.timing}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="flabel" htmlFor="ti-first">First name</label>
                    <input id="ti-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="inpt" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="flabel" htmlFor="ti-last">Last name</label>
                    <input id="ti-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className="inpt" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="flabel" htmlFor="ti-phone">Phone number</label>
                    <input id="ti-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="inpt" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="flabel" htmlFor="ti-email">Email</label>
                    <input id="ti-email" type="email" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} className="inpt" placeholder="you@email.com" />
                  </div>
                  {payout === "paypal" && (
                    <div className="sm:col-span-2">
                      <label className="flabel" htmlFor="ti-paypal">PayPal email</label>
                      <input id="ti-paypal" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} className="inpt" placeholder="paypal@email.com" />
                    </div>
                  )}
                  {payout === "bank" && (
                    <>
                      <div>
                        <label className="flabel" htmlFor="ti-routing">Routing number</label>
                        <input id="ti-routing" inputMode="numeric" value={routing} onChange={(e) => setRouting(e.target.value)} className="inpt" placeholder="9 digits" />
                      </div>
                      <div>
                        <label className="flabel" htmlFor="ti-account">Account number</label>
                        <input id="ti-account" inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value)} className="inpt" placeholder="Account number" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* shipping */}
              <div className="scard-bord">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-[#edf6f0] text-[#0a8f6e]"><MapPin className="h-[18px] w-[18px]" /></span>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Shipping &amp; where to send it</h3>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#6e6e73]">{SHIP_TO.name}<br />{SHIP_TO.lines.join(" · ")}</p>
                    <div className={cn("mt-3 rounded-[12px] px-3.5 py-3 text-[13px] leading-relaxed", freeShip ? "bg-[#edf6f0] text-[#0a7d61]" : "bg-[#fff7ec] text-[#8a5a00]")}>
                      {freeShip
                        ? <><b>Free prepaid shipping unlocked</b> — {count} devices. We email a label &amp; recycled box kit; drop it off, fully tracked &amp; insured.</>
                        : <><b>Add {FREE_SHIP_MIN - count} more device{FREE_SHIP_MIN - count === 1 ? "" : "s"}</b> to unlock free prepaid shipping ({FREE_SHIP_MIN}+). Under {FREE_SHIP_MIN}, you cover the label to send it in — inspection is still 100% free.</>}
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-[#86868b]">Inspection is always free. Changed your mind or don&apos;t accept the final offer? We ship it straight back — you just cover return postage.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setPhase("build")} className="link inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Add more devices</button>
              </div>
            </motion.div>
          )}

          {/* ================= DONE ================= */}
        </AnimatePresence>

        {/* trust row */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Price-lock for 7 days", body: "Your quote is held for a week — we honor it as long as the device matches." },
              { icon: Truck, title: "Free shipping at 5+", body: "Five or more devices ship free, fully tracked and insured. Inspection is always free." },
              { icon: Recycle, title: "PayPal, bank or credit", body: "PayPal in ~2 days, bank transfer up to 5, or take +10% as instant store credit." },
            ].map((t) => (
              <div key={t.title} className="flex flex-col gap-1.5">
                <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#edf6f0] text-[#0a8f6e]"><t.icon className="h-[18px] w-[18px]" /></div>
                <div className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{t.title}</div>
                <p className="text-[13px] leading-snug text-[#6e6e73]">{t.body}</p>
              </div>
            ))}
          </div>
      </div>

      {/* ── basket sidebar ── */}
      <aside>
          <div className="sticky top-[74px] overflow-hidden rounded-[20px] border border-[#d2d2d7]">
            <div className="px-6 pb-5 pt-5 text-white" style={{ background: "linear-gradient(165deg,#0f9d78,#0a7d61)" }}>
              <p className="text-[13px] font-medium opacity-90">Your trade-in {count > 0 ? `· ${count} device${count === 1 ? "" : "s"}` : ""}</p>
              <p className="mt-1.5 flex items-baseline gap-2 text-[40px] font-bold leading-[1.05] tracking-[-.03em]">
                {formatPrice(total)}<span className="text-[14px] font-medium opacity-80">USD</span>
              </p>
              <p className="mt-1.5 text-[12.5px] opacity-90">
                {count === 0 ? "Build your offer on the left." : isCredit ? `Includes a +10% store-credit bonus.` : payout === "bank" ? "Paid by bank transfer, up to 5 business days." : "Paid to PayPal within ~2 business days."}
              </p>
            </div>

            <div className="px-5 py-4">
              {/* live preview of the device being built — appears the moment one is picked */}
              {phase === "build" && (
                <div className="flex items-center gap-3.5 pb-4">
                  <PhImg slug={model.catalogSlug ?? model.key} src={colorImage} label={`${model.name} ${colorName}`} className="h-[92px] w-[62px] shrink-0 rounded-[12px]" style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#86868b]">Currently building</p>
                    <p className="text-[16px] font-bold leading-tight text-[#1d1d1f]">{model.name}</p>
                    <p className="mt-0.5 text-[12px] text-[#86868b]">{[storageLabel, colorName, carrierChoice ? carrierLabel : null, GRADE_TAG[grade]].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 text-[16px] font-bold text-[#0a8f6e]">{formatPrice(unit)}{qtyToAdd > 1 && <span className="text-[12px]"> × {qtyToAdd}</span>}</p>
                  </div>
                </div>
              )}

              {basket.length > 0 && (
                <div className={cn(phase === "build" && "border-t border-[#eee] pt-3")}>
                  {phase === "build" && <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">In your trade-in · {count} device{count === 1 ? "" : "s"}</p>}
                  <div className="flex flex-col divide-y divide-[#eee]">
                  {basket.map((l) => (
                    <div key={l.sig} className="flex items-start gap-3 py-3 first:pt-0">
                      <PhImg slug={l.catalogSlug ?? l.modelKey} src={l.image} label={l.name} className="h-14 w-10 shrink-0 rounded-[8px]" style={{ ["--ph-a" as string]: "#fcfdff", ["--ph-b" as string]: "#e7e9ee" }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-[#1d1d1f]">{l.name}</p>
                        <p className="truncate text-[11.5px] text-[#86868b]">{[l.storageLabel, l.color, l.carrierLabel, l.gradeTag.replace("Grade ", "").replace(" · ", " ")].filter(Boolean).join(" · ")}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="inline-flex items-center rounded-full border border-[#d2d2d7]">
                            <button onClick={() => setQty(l.sig, -1)} className="grid h-6 w-6 place-items-center text-[#6e6e73]" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                            <span className="min-w-[18px] text-center text-[12px] font-semibold">{l.qty}</span>
                            <button onClick={() => setQty(l.sig, 1)} className="grid h-6 w-6 place-items-center text-[#6e6e73]" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                          </div>
                          <button onClick={() => removeLine(l.sig)} className="text-[#b0b0b6] hover:text-[#b23b3b]" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <span className="text-[13.5px] font-semibold text-[#1d1d1f]">{formatPrice(l.unit * l.qty)}</span>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* shipping meter */}
              {count > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#eef0f2]">
                    <div className="h-full rounded-full bg-[#0a8f6e] transition-all" style={{ width: `${Math.min(100, (count / FREE_SHIP_MIN) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-[#86868b]">
                    {freeShip ? "✓ Free prepaid shipping unlocked" : `${FREE_SHIP_MIN - count} more to unlock free shipping (${FREE_SHIP_MIN}+)`}
                  </p>
                </div>
              )}

              {phase === "build" ? (
                <button onClick={() => count > 0 && setPhase("checkout")} disabled={count === 0} className={cn("btn mt-5 w-full", count === 0 && "opacity-50")}>
                  Continue <ArrowRight className="h-[18px] w-[18px]" />
                </button>
              ) : (
                <>
                  <button onClick={() => canLock && setPhase("done")} disabled={!canLock} className={cn("btn mt-5 w-full", !canLock && "opacity-50")}>
                    Lock this offer <ArrowRight className="h-[18px] w-[18px]" />
                  </button>
                  {!canLock && <p className="mt-2 text-center text-[12px] text-[#86868b]">Add your name, email and payout details to lock it.</p>}
                </>
              )}
              <p className="note2 mt-3 text-center">No obligation. Final value confirmed after our free inspection — if it&apos;s higher, you keep the difference.</p>
            </div>
          </div>
        </aside>
    </div>
  );
}

function OptCard({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button onClick={onClick}
      className={cn("rounded-[13px] border px-4 py-3 text-left transition-colors",
        active ? "border-[#0a8f6e] shadow-[0_0_0_1px_#0a8f6e]" : "border-[#d2d2d7] hover:border-[#bfbfc7]")}>
      <span className="block text-sm font-semibold text-[#1d1d1f]">{label}</span>
      <span className="block text-xs text-[#86868b]">{desc}</span>
    </button>
  );
}

function Toggle({ label, yes, onYes, onNo, invert }: { label: string; yes: boolean; onYes: () => void; onNo: () => void; invert?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[#1d1d1f]">{label}</span>
      <div className="flex gap-1.5">
        <button onClick={onYes}
          className={cn("rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors",
            yes ? (invert ? "border-[#0a8f6e] bg-[#edf6f0] text-[#0a7d61]" : "border-[#d99] bg-[#fbeaea] text-[#b23b3b]") : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#bfbfc7]")}>Yes</button>
        <button onClick={onNo}
          className={cn("rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors",
            !yes ? (invert ? "border-[#d99] bg-[#fbeaea] text-[#b23b3b]" : "border-[#0a8f6e] bg-[#edf6f0] text-[#0a7d61]") : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#bfbfc7]")}>No</button>
      </div>
    </div>
  );
}
