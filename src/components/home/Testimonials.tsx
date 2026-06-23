import { Star, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const REVIEWS = [
  {
    name: "Maya R.",
    role: "iPhone 14 Pro buyer",
    quote:
      "Graded ‘Good’ but honestly I can't find a single scratch. Battery at 91%. Felt brand new out of the box.",
    color: "from-brand-500 to-glacier-400",
  },
  {
    name: "TechCycle Repairs",
    role: "Wholesale · 180 units/mo",
    quote:
      "We switched our entire sourcing to reMint. Grading is consistent, the API feeds straight into our POS, and net-30 changed our cash flow.",
    color: "from-mint-500 to-glacier-400",
  },
  {
    name: "Daniel K.",
    role: "Pixel 8 Pro buyer",
    quote: "Half the price of new, arrived in two days, and the 12-month warranty sealed it. Already ordered one for my partner.",
    color: "from-glacier-500 to-brand-500",
  },
  {
    name: "Northwind MVNO",
    role: "Enterprise · 4,000 units",
    quote:
      "Locked quarterly pricing and blind drop-ship let us launch a refurb line without touching inventory. Reliability has been flawless.",
    color: "from-brand-600 to-mint-500",
  },
  {
    name: "Priya S.",
    role: "Galaxy S24 buyer",
    quote: "I was nervous about ‘used’ but the real photos and grade meant zero surprises. This is how it should be done.",
    color: "from-amber-400 to-brand-500",
  },
  {
    name: "CellHub Kiosks",
    role: "Reseller · 60 units/mo",
    quote: "Mixed lots at the Reseller tier keep our cases full of variety. Returns are basically nonexistent now.",
    color: "from-glacier-400 to-mint-500",
  },
];

export function Testimonials() {
  return (
    <Section id="reviews">
      <SectionHeading
        eyebrow="38,000+ reviews"
        title={<>Loved by shoppers <span className="text-gradient">and businesses</span></>}
        subtitle="From first-time buyers to enterprise fleets — the same certified standard, the same trust."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={(i % 3) * 0.08}>
            <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-ink-850/50 p-6 transition-colors hover:border-white/20">
              <Quote className="h-7 w-7 text-brand-400/50" />
              <blockquote className="mt-3 flex-1 text-white/75">{r.quote}</blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${r.color} font-display text-sm font-bold text-white`}
                >
                  {r.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <figcaption className="text-sm font-semibold text-white">{r.name}</figcaption>
                  <p className="text-xs text-white/45">{r.role}</p>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
