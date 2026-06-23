"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { GRADES, GRADE_ORDER, type GradeId } from "@/lib/grades";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PhoneMock } from "@/components/ui/PhoneMock";

const GUARANTEES = [
  "100% functional — every button, sensor & radio",
  "Genuine battery at 80%+ health (most far higher)",
  "Data wiped & sanitized to factory standard",
  "12-month warranty regardless of cosmetic grade",
];

export function Grading() {
  const [active, setActive] = useState<GradeId>("excellent");
  const g = GRADES[active];

  return (
    <Section id="certified">
      <SectionHeading
        eyebrow="Transparent grading"
        title={<>Know exactly what <span className="text-gradient">you&apos;re getting</span></>}
        subtitle="No vague A/B/C codes. Four honest grades describe cosmetic condition only — function is guaranteed across the board."
      />

      <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* selector + detail */}
        <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {GRADE_ORDER.map((id) => {
              const gr = GRADES[id];
              const isActive = id === active;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className="rounded-full border px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    color: isActive ? "#04040a" : gr.hexSoft,
                    background: isActive ? gr.hex : `${gr.hex}1a`,
                    borderColor: `${gr.hex}55`,
                  }}
                >
                  {gr.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-7"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-display text-3xl font-bold" style={{ color: g.hexSoft }}>
                  {g.label}
                </h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: `${g.hex}26`, color: g.hexSoft }}
                >
                  {g.savings}
                </span>
              </div>
              <p className="mt-1 text-white/50">{g.tagline}</p>
              <p className="mt-4 text-white/70">{g.cosmetic}</p>

              {/* wear meter */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-white/40">
                  <span>More character</span>
                  <span>Flawless</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${g.hexSoft}, ${g.hex})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.score / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4.5 w-4.5 text-mint-400" />
              Guaranteed on every grade
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {GUARANTEES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* visual */}
        <div className="relative grid place-items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/60 to-ink-900/60 p-8">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full"
          >
            <div
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[80px]"
              style={{ background: g.hex }}
            />
            <PhoneMock colorHex={g.hex} accentHex={g.hexSoft} brand="Apple" tilt={false} className="h-80" />
          </motion.div>
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ background: `${g.hex}26`, color: g.hexSoft }}
          >
            Grade: {g.label}
          </div>
        </div>
      </div>
    </Section>
  );
}
