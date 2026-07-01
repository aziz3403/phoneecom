import type { Metadata } from "next";
import Link from "next/link";
import { Search, Tag, Truck, Banknote, ShieldCheck, BatteryWarning, ScanFace, Wrench, Camera, Lock, Trophy, Boxes, ArrowRight } from "lucide-react";
import { TradeInWizard } from "@/components/trade-in/TradeInWizard";
import { getTradeInModels } from "@/lib/trade-in-pricing";

export const metadata: Metadata = {
  title: "Trade in your phone for instant credit",
  description:
    "Trade in your old iPhone, Galaxy or iPad in three quick steps. Instant offer, free prepaid shipping, paid in 2 business days — or take 10% more in store credit.",
};

const STEPS = [
  { icon: Search, title: "Build your offer", body: "Add one device or a whole batch — answer a few questions each for an instant price." },
  { icon: Truck, title: "Ship it in", body: "5+ devices ship free on a prepaid label. Fewer? You cover the label — inspection is always free." },
  { icon: Tag, title: "We inspect it", body: "Our lab verifies the condition against your quote within a day, at no cost to you." },
  { icon: Banknote, title: "Get paid", body: "PayPal in ~2 business days or bank transfer in up to 5 — or take 10% more as instant store credit." },
];

// What our inspectors check — straight from our grading standard, so there are
// no surprises. Being upfront on these keeps your quote accurate.
const CHECKS = [
  { icon: BatteryWarning, title: "Battery health", body: "A “Service” message or health under 80% is a flat $15 deduction — nothing hidden." },
  { icon: ScanFace, title: "Face ID / Touch ID", body: "Must fully register and unlock — a faulty sensor is priced as parts." },
  { icon: ScanFace, title: "Screen & LCD", body: "We check for lines, spots, burn-in and aftermarket screens (no True Tone is a tell)." },
  { icon: Camera, title: "Camera & lens", body: "Cracked lens or camera spotting (common on 12/13) means an extra deduction." },
  { icon: Wrench, title: "Repair messages", body: "“Genuine/Used” or unknown part messages (display, battery, camera) are deducted." },
  { icon: Lock, title: "Locks & ESN", body: "Bad ESN is fine if not lost/stolen; carrier-locked, iCloud-locked or KG-locked is priced lower." },
];

const TERMS = [
  "We only buy devices you legally own — nothing reported lost or stolen. Every device is checked against CheckMEND (carrier, law-enforcement and insurance data) and data-wiped on arrival.",
  "Your quote is locked for 7 days and honored as long as the device matches what you told us. If we find it in better shape, you keep the difference. We pay by PayPal (about 2 business days) or bank transfer (up to 5) — or store credit for 10% more.",
  "Shipping is free on trade-ins of 5 or more devices; for smaller batches you cover the label to send it in. Inspection is always free — and if you change your mind or decline our final offer, we ship it straight back and you just cover return postage.",
  "Final grade, deductions and returns are confirmed after our free inspection. If a device relocks or shows a carrier/KG lock after sale, the seller remains responsible.",
];

export default async function TradeInPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string }>;
}) {
  const { device } = await searchParams;
  const { models } = await getTradeInModels();

  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Trade-in
        </p>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#edf6f0] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#0a7d61]">
          <Trophy className="h-3.5 w-3.5" /> Among the highest payouts in the US — we price-match &amp; beat
        </span>
        <h1 className="ptitle">Turn your old phone into cash. Get paid the most.</h1>
        <p className="psub">
          A few quick questions for an instant offer on your old phone or tablet — we buy the full
          range, at real market prices. Ship it free and get paid by PayPal or bank transfer, or take
          10% more as store credit toward your next one.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-[#6e6e73]">
          {["Instant offer", "Free prepaid shipping", "PayPal or bank transfer", "Price-lock 7 days"].map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#0a8f6e]" />
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="shell pt-10">
        <TradeInWizard initialSlug={device} models={models} />
      </div>

      {/* price list + bulk */}
      <div className="shell mt-14">
        <Link
          href="/trade-in/prices"
          className="group flex flex-col gap-4 rounded-[20px] border border-[#d2d2d7] bg-gradient-to-br from-[#f1f7f3] to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-[12px] bg-[#0a8f6e] text-white">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[17px] font-bold tracking-[-.01em] text-[#1d1d1f]">
                See the full price list &amp; sell in bulk
              </p>
              <p className="mt-1 max-w-[560px] text-[14px] leading-relaxed text-[#6e6e73]">
                Browse what we pay for {models.length}+ models by grade, or send a whole batch —
                resellers &amp; repair shops get bonus pricing, free labels at 5+, and one fast payment.
              </p>
            </div>
          </div>
          <span className="inline-flex flex-none items-center gap-1.5 self-start rounded-full bg-[#0a8f6e] px-4 py-2.5 text-[14px] font-semibold text-white transition-transform group-hover:translate-x-0.5 sm:self-auto">
            View price list <ArrowRight className="h-[18px] w-[18px]" />
          </span>
        </Link>
      </div>

      <section className="graysec mt-24">
        <div className="sechead ctr">
          <p className="eyebrow">How trade-in works</p>
          <h2 className="h2">Four steps, zero hassle.</h2>
        </div>
        <div className="shell grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="scard-bord h-full">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-[12px] bg-[#edf6f0] text-[#0a8f6e]">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-.01em] text-[#1d1d1f]">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* what we check */}
      <section className="shell mt-24">
        <div className="mb-9 max-w-[640px]">
          <p className="eyebrow">What we check</p>
          <h2 className="h2 mt-2">No surprises — here&apos;s exactly what affects your price.</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#6e6e73]">
            Tell us about these up front and your instant offer will match the final one. Every
            device is inspected against the same standard.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((c) => (
            <div key={c.title} className="scard-bord h-full">
              <div className="mb-3.5 grid h-10 w-10 place-items-center rounded-[11px] bg-[#edf6f0] text-[#0a8f6e]">
                <c.icon className="h-[19px] w-[19px]" />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-.01em] text-[#1d1d1f]">{c.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6e6e73]">{c.body}</p>
            </div>
          ))}
        </div>

        {/* terms */}
        <div className="mt-8 rounded-[18px] border border-[#e2e2e6] bg-[#fafafa] p-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#0a8f6e]" />
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">The fine print, in plain English</h3>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {TERMS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#6e6e73]">
                <span className="mt-[7px] inline-block h-[5px] w-[5px] flex-none rounded-full bg-[#0a8f6e]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
