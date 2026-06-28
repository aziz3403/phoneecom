import type { Metadata } from "next";
import { Boxes, Banknote, Headset, Plug, Truck, BadgeCheck, ArrowRight, Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { PricingTiers } from "@/components/wholesale/PricingTiers";
import { SavingsCalculator } from "@/components/wholesale/SavingsCalculator";
import { BulkOrderBuilder } from "@/components/wholesale/BulkOrderBuilder";
import { ApplyForm } from "@/components/wholesale/ApplyForm";

export const metadata: Metadata = {
  title: "Wholesale & trade pricing",
  description:
    "Volume pricing on certified pre-owned phones for resellers, repair shops, carriers and enterprises. Tiered discounts up to 24%, net terms, dedicated support and API feeds.",
};

const BENEFITS = [
  { icon: Boxes, title: "Tiered volume pricing", body: "Discounts deepen automatically as your quantities grow — up to 24% off." },
  { icon: Banknote, title: "Flexible net terms", body: "Net-7 to net-30 on approval so your cash flow keeps moving." },
  { icon: Headset, title: "Dedicated account rep", body: "A real human who knows your business and sources what you need." },
  { icon: BadgeCheck, title: "Consistent grading", body: "The same 50-point standard every time — resell with total confidence." },
  { icon: Truck, title: "Blind drop-ship", body: "Ship directly to your customers under your own brand. We stay invisible." },
  { icon: Plug, title: "API & EDI feeds", body: "Pipe live inventory and pricing straight into your POS or storefront." },
];

const SAMPLE_LOT = [
  { k: "100 × mixed iPhone, Grade B", v: "$31,900", accent: false },
  { k: "Volume tier (100–249)", v: "−12%", accent: true },
  { k: "Per-unit average", v: "$281", accent: false },
  { k: "Payment terms", v: "Net-30", accent: false },
  { k: "You save vs. retail", v: "$18,400", accent: true },
];

const LOGOS = ["TechCycle", "FoneHub", "ReNew Mobile", "CellWorks", "Verda Telecom"];

const FLOW = [
  { n: "01", t: "Apply", d: "Tell us about your business. Most accounts are approved within one business day." },
  { n: "02", t: "Get your pricing", d: "Your rep sets up tiered pricing, payment terms and any custom grading specs." },
  { n: "03", t: "Order your way", d: "Browse live stock, send a bulk sheet, or pull inventory through the API." },
  { n: "04", t: "Ship & scale", d: "Graded units ship fast, fully insured. Reorder anytime as you grow." },
];

const COMPARE: { feature: string; retail: string; wholesale: string }[] = [
  { feature: "Volume discounts", retail: "—", wholesale: "Up to 24%" },
  { feature: "Payment terms", retail: "Pay now", wholesale: "Net-7 to 30" },
  { feature: "Dedicated account rep", retail: "—", wholesale: "Included" },
  { feature: "Bulk & API ordering", retail: "—", wholesale: "Included" },
  { feature: "Custom grading specs", retail: "—", wholesale: "Included" },
  { feature: "12-month warranty", retail: "✓", wholesale: "✓" },
];

const FAQ = [
  {
    q: "What's the minimum order?",
    a: "Wholesale pricing starts at just 5 units, and you can mix any models or brands toward your volume tier — no single-model minimums.",
  },
  {
    q: "How do payment terms work?",
    a: "Approved accounts qualify for net-7 to net-30 terms based on order history and volume. New accounts can start on prepay and graduate quickly.",
  },
  {
    q: "Can I set a grading standard?",
    a: "Yes. Set a standing spec — grade floor, colors, capacities, carrier-unlocked — and every shipment is matched to it. Anything outside spec is free to return.",
  },
  {
    q: "Do you ship internationally?",
    a: "We ship across North America and to select international partners. Your account rep will confirm options and lead times for your region.",
  },
];

export default function WholesalePage() {
  return (
    <div>
      {/* ───────── hero (dark, on-brand) ───────── */}
      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="shell">
          <div className="wbox">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="eyebrow" style={{ color: "#41d6a0" }}>
                  reMint for Business
                </p>
                <h1
                  className="mt-3 text-[clamp(40px,6vw,64px)] font-bold leading-[1.04] tracking-[-.03em]"
                  style={{ color: "#f5f5f7" }}
                >
                  Buy by the box.
                  <br />
                  Save up to 24%.
                </h1>
                <p className="mt-5 max-w-xl text-[18px] leading-relaxed" style={{ color: "#a1a1a6" }}>
                  Wholesale certified pre-owned phones for resellers, repair shops, refurbishers and
                  enterprise fleets — with volume pricing, net terms and consistent grading you can
                  build a business on.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="#apply" size="lg">
                    Apply for an account <ArrowRight className="h-[18px] w-[18px]" />
                  </ButtonLink>
                  <ButtonLink
                    href="#builder"
                    size="lg"
                    className="border border-white/30 bg-transparent text-[#f5f5f7] hover:border-white/60 hover:bg-white/10"
                  >
                    Build a sample order
                  </ButtonLink>
                </div>
                <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
                  {[
                    { to: 1200, suffix: "+", label: "business partners" },
                    { to: 8500, suffix: "+", label: "units in live stock" },
                    { to: 99.6, suffix: "%", decimals: 1, label: "arrive as graded" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col gap-1">
                      <span className="text-[22px] font-bold tracking-tight" style={{ color: "#f5f5f7" }}>
                        <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
                      </span>
                      <span className="text-[13px]" style={{ color: "#a1a1a6" }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* sample-lot card */}
              <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-6">
                <p
                  className="text-[13px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: "#a1a1a6" }}
                >
                  Sample lot · live pricing
                </p>
                <div className="mt-3">
                  {SAMPLE_LOT.map((row) => (
                    <div
                      key={row.k}
                      className="flex items-center justify-between border-b border-white/10 py-3 text-sm last:border-b-0"
                    >
                      <span style={{ color: "#a1a1a6" }}>{row.k}</span>
                      <span
                        className="font-semibold"
                        style={{ color: row.accent ? "#41d6a0" : "#f5f5f7" }}
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── logo strip ───────── */}
      <div className="shell mt-12">
        <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4 rounded-[22px] bg-[#f5f5f7] px-6 py-7">
          <span className="text-[13px] font-medium text-[#86868b]">Trusted by 1,200+ businesses</span>
          {LOGOS.map((l) => (
            <span key={l} className="text-[18px] font-bold tracking-tight text-[#86868b] opacity-70">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ───────── benefits ───────── */}
      <Section className="py-20 sm:py-24">
        <SectionHeading
          eyebrow="Why buy wholesale with reMint"
          title="Built for businesses that move volume."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="h-full rounded-[22px] border border-[#d2d2d7] bg-white p-6 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#f1f7f3] text-[#0a8f6e]">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ───────── pricing tiers ───────── */}
      <div className="bg-[#f5f5f7]">
        <Section id="pricing" className="py-20 sm:py-24">
          <SectionHeading
            eyebrow="Volume pricing"
            title="The more you order, the more you save."
            subtitle="Discounts apply per model and unlock automatically at checkout. No negotiation required."
          />
          <div className="mt-14">
            <PricingTiers />
          </div>
        </Section>
      </div>

      {/* ───────── savings calculator ───────── */}
      <Section className="py-20 sm:py-24">
        <SectionHeading
          eyebrow="Instant volume quote"
          title="See your wholesale price."
          subtitle="Pick a model and a quantity to preview your per-unit price, tier and total savings."
        />
        <div className="mt-12">
          <SavingsCalculator />
        </div>
      </Section>

      {/* ───────── bulk order builder ───────── */}
      <div className="bg-[#f5f5f7]">
        <Section id="builder" className="py-20 sm:py-24">
          <SectionHeading
            align="left"
            eyebrow="Bulk order builder"
            title="Build a mixed-model order."
            subtitle="Stack as many models as you like, tune quantities, then send the whole order straight to your cart."
          />
          <div className="mt-12">
            <BulkOrderBuilder />
          </div>
        </Section>
      </div>

      {/* ───────── flow ───────── */}
      <Section className="py-20 sm:py-24">
        <SectionHeading align="left" title="From application to inventory in days." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s) => (
            <div key={s.n} className="border-t-2 border-[#0a8f6e] pt-4">
              <div className="text-[13px] font-bold text-[#0a8f6e]">{s.n}</div>
              <div className="mt-2.5 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">{s.t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6e6e73]">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ───────── wholesale vs retail ───────── */}
      <div className="bg-[#f5f5f7]">
        <Section className="py-20 sm:py-24">
          <SectionHeading
            title="Wholesale vs. retail."
            subtitle="Everything in our retail store, plus the tools and terms a business needs."
          />
          <div className="mt-10 overflow-hidden rounded-[18px] border border-[#d2d2d7] bg-white">
            <div className="grid grid-cols-[2fr_1fr_1fr] border-b border-[#d2d2d7] bg-[#f5f5f7] text-[13px] font-semibold text-[#6e6e73]">
              <div className="px-5 py-4">Feature</div>
              <div className="px-5 py-4">Retail</div>
              <div className="px-5 py-4">Wholesale</div>
            </div>
            {COMPARE.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[2fr_1fr_1fr] text-[14.5px] ${
                  i < COMPARE.length - 1 ? "border-b border-[#d2d2d7]" : ""
                }`}
              >
                <div className="px-5 py-4 text-[#1d1d1f]">{row.feature}</div>
                <div
                  className={`px-5 py-4 ${row.retail === "—" ? "text-[#86868b]" : "font-semibold text-[#0a8f6e]"}`}
                >
                  {row.retail}
                </div>
                <div className="px-5 py-4 font-semibold text-[#0a8f6e]">{row.wholesale}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ───────── faq ───────── */}
      <Section className="py-20 sm:py-24">
        <SectionHeading title="Wholesale questions, answered." />
        <div className="mx-auto mt-10 max-w-[780px]">
          {FAQ.map((f) => (
            <div key={f.q} className="border-b border-[#d2d2d7] py-5">
              <div className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0a8f6e]" />
                <div>
                  <div className="text-[16px] font-semibold text-[#1d1d1f]">{f.q}</div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#6e6e73]">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ───────── apply ───────── */}
      <div className="bg-[#f5f5f7]">
        <Section id="apply" className="py-20 sm:py-24">
          <ApplyForm />
        </Section>
      </div>
    </div>
  );
}
