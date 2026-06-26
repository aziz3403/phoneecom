import type { Metadata } from "next";
import { Search, Tag, Truck, Banknote } from "lucide-react";
import { SellEstimator } from "@/components/sell/SellEstimator";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Sell or trade in your phone",
  description:
    "Get an instant quote for your old iPhone, Galaxy or iPad. Free prepaid shipping, paid in 2 business days — or take 10% more in store credit.",
};

const STEPS = [
  { icon: Search, title: "Get your quote", body: "Pick your device and condition for an instant cash or credit offer." },
  { icon: Truck, title: "Ship it free", body: "We email a prepaid label. Box it up and drop it off — on us." },
  { icon: Tag, title: "We inspect it", body: "Our lab verifies the condition against your quote within a day." },
  { icon: Banknote, title: "Get paid fast", body: "Money hits your account in 2 business days, or credit instantly." },
];

export default function SellPage() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="bg-grid absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-mint-300">
              Trade-in
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Turn your old phone
              <br />
              <span className="text-gradient">into instant cash.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/60">
              Get a real quote in seconds, ship it free, and get paid in two days — or take 10% more
              as store credit toward your next upgrade.
            </p>
          </Reveal>

          <div className="mt-12">
            <SellEstimator />
          </div>
        </div>
      </section>

      <Section className="py-16">
        <SectionHeading eyebrow="How trade-in works" title="Four steps, zero hassle" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-white/10 bg-ink-850/50 p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-mint-500/20 to-glacier-400/10 ring-1 ring-white/10">
                  <s.icon className="h-6 w-6 text-mint-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  {i + 1}. {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}
