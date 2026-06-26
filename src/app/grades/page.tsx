import type { Metadata } from "next";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { GRADES, GRADE_ORDER } from "@/lib/grades";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Condition grades, defined",
  description:
    "How reMint grades certified pre-owned devices: Pristine, Excellent, Good and Fair. Cosmetic condition only — function is guaranteed on every grade.",
};

const GUARANTEES = [
  "100% functional — every button, sensor & radio tested",
  "Genuine battery at 80%+ health (most far higher)",
  "Data wiped & sanitized to factory standard",
  "12-month warranty regardless of cosmetic grade",
  "Unlocked to all carriers unless noted",
  "30-day no-questions returns",
];

const FAQ = [
  {
    q: "Does the grade affect how the phone works?",
    a: "No. Grades describe cosmetic appearance only. Every device — Pristine to Fair — passes the same 50-point functional inspection and ships with a 12-month warranty.",
  },
  {
    q: "Will I get the exact unit in the photos?",
    a: "Photos are representative of the grade. Your device will match the cosmetic standard described for its grade, or better.",
  },
  {
    q: "What battery health can I expect?",
    a: "Every battery is verified at 80%+ health. The exact figure is listed on each product page, and most devices come in well above the minimum.",
  },
];

export default function GradesPage() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-200">
              Transparent grading
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Every grade,
              <br />
              <span className="text-gradient">clearly defined.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/60">
              No vague A/B/C codes. Four honest grades describe a device&apos;s cosmetic condition —
              and nothing else. Function is guaranteed across the board.
            </p>
          </Reveal>

          {/* condition scale */}
          <Reveal delay={0.1} className="mt-12">
            <div className="flex items-center gap-2">
              {GRADE_ORDER.slice().reverse().map((id) => {
                const g = GRADES[id];
                return (
                  <div key={id} className="flex-1">
                    <div className="h-2 rounded-full" style={{ background: g.hex }} />
                    <p className="mt-2 text-center text-xs font-medium" style={{ color: g.hexSoft }}>
                      {g.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-xs text-white/40">
              <span>More character · biggest savings</span>
              <span>Flawless</span>
            </div>
          </Reveal>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-5 md:grid-cols-2">
          {GRADE_ORDER.map((id, i) => {
            const g = GRADES[id];
            return (
              <Reveal key={id} delay={(i % 2) * 0.08}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-25 blur-3xl"
                    style={{ background: g.hex }}
                  />
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold" style={{ color: g.hexSoft }}>
                      {g.label}
                    </h2>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: `${g.hex}26`, color: g.hexSoft }}
                    >
                      {g.savings}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/50">{g.tagline}</p>
                  <p className="mt-4 text-white/75">{g.cosmetic}</p>
                  <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(g.score / 4) * 100}%`, background: `linear-gradient(90deg, ${g.hexSoft}, ${g.hex})` }}
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section className="py-8">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-10">
            <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
              <ShieldCheck className="h-5 w-5 text-mint-400" />
              Guaranteed on every grade
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GUARANTEES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section className="py-8">
        <SectionHeading align="left" eyebrow="Good to know" title="Grading FAQ" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-white/10 bg-ink-850/50 p-6">
                <h3 className="font-display text-base font-semibold text-white">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-600/25 via-ink-850 to-glacier-500/15 px-6 py-14 text-center">
            <Sparkles className="h-7 w-7 text-brand-200" />
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Shop with total confidence
            </h2>
            <p className="max-w-md text-white/60">
              Every device is certified, graded honestly, and backed by a 12-month warranty.
            </p>
            <ButtonLink href="/shop" size="lg">
              Browse the collection
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
