import type { Metadata } from "next";
import { Boxes, Banknote, Headset, Plug, Truck, BadgeCheck, ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
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

export default function WholesalePage() {
  return (
    <div className="pt-24">
      {/* hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="bg-grid absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-200">
              <Boxes className="h-3.5 w-3.5" /> reMint Trade
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold leading-[1] tracking-tight text-white">
              Wholesale phones,
              <br />
              <span className="text-gradient">graded to resell.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/60">
              Supply your storefront, repair shop, fleet or carrier program with certified pre-owned
              devices — at prices that protect your margin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#apply" size="lg">
                Open a trade account <ArrowRight className="h-4.5 w-4.5" />
              </ButtonLink>
              <ButtonLink href="#builder" variant="secondary" size="lg">
                Build a sample order
              </ButtonLink>
            </div>
          </Reveal>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {[
              { to: 24, suffix: "%", label: "Max volume discount" },
              { to: 5, suffix: "", label: "Minimum order qty" },
              { to: 48, suffix: "h", label: "Avg. dispatch time" },
            ].map((s) => (
              <div key={s.label} className="bg-ink-900/60 p-6 text-center">
                <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* benefits */}
      <Section className="py-16">
        <SectionHeading
          align="left"
          eyebrow="Why partner with reMint"
          title="Built for businesses that move volume"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-3xl border border-white/10 bg-ink-850/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/40">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-glacier-400/10 ring-1 ring-white/10">
                  <b.icon className="h-6 w-6 text-brand-200" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* pricing tiers */}
      <Section id="pricing" className="py-16">
        <SectionHeading
          eyebrow="Volume pricing"
          title={<>The more you order, <span className="text-gradient">the more you save</span></>}
          subtitle="Discounts apply per model and unlock automatically at checkout. No negotiation required."
        />
        <div className="mt-14">
          <PricingTiers />
        </div>
      </Section>

      {/* calculator */}
      <Section className="py-16">
        <SectionHeading
          align="left"
          eyebrow="Savings calculator"
          title="See your price instantly"
          subtitle="Pick a model and a quantity to preview your per-unit price, tier and total savings."
        />
        <div className="mt-12">
          <SavingsCalculator />
        </div>
      </Section>

      {/* bulk builder */}
      <Section id="builder" className="py-16">
        <SectionHeading
          align="left"
          eyebrow="Bulk order builder"
          title="Build a mixed-model order"
          subtitle="Stack as many models as you like, tune quantities, then send the whole order straight to your cart."
        />
        <div className="mt-12">
          <BulkOrderBuilder />
        </div>
      </Section>

      {/* apply */}
      <Section id="apply" className="py-16">
        <ApplyForm />
      </Section>
    </div>
  );
}
