import type { Metadata } from "next";
import { Truck, RefreshCw, ShieldCheck, CreditCard, Mail, MessageCircle } from "lucide-react";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Help & support",
  description: "Shipping, returns, warranty and payment info, plus answers to common questions about buying certified pre-owned from reMint.",
};

const POLICIES = [
  { icon: Truck, title: "Free 2-day shipping", body: "Carbon-neutral delivery on every order in the contiguous US, with tracking." },
  { icon: RefreshCw, title: "14-day RMA", body: "Not satisfied? Return within 14 days for a full refund — prepaid label included." },
  { icon: ShieldCheck, title: "12-month warranty", body: "Every device is covered against hardware faults for a full year." },
  { icon: CreditCard, title: "Flexible payment", body: "Pay in full or split into monthly installments at checkout." },
];

export default function HelpPage() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <Reveal className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-200">
              Help center
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              How can we <span className="text-gradient">help?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
              Everything you need to know about shipping, returns, warranty and buying certified
              pre-owned.
            </p>
          </Reveal>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) * 0.06}>
              <div className="h-full rounded-3xl border border-white/10 bg-ink-850/50 p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-glacier-400/10 ring-1 ring-white/10">
                  <p.icon className="h-6 w-6 text-brand-200" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
      </Section>

      <Section className="py-12">
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-600/25 via-ink-850 to-glacier-500/15 px-6 py-14 text-center">
            <div className="flex gap-2 text-brand-200">
              <Mail className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white">Still need a hand?</h2>
            <p className="max-w-md text-white/60">
              Our support team replies within a few hours, 7 days a week.
            </p>
            <a
              href="mailto:support@remint.example"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-glacier-400 px-7 font-medium text-white transition hover:-translate-y-0.5"
            >
              <Mail className="h-4.5 w-4.5" /> Email support
            </a>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
