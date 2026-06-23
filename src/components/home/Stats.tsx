import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  { to: 250, suffix: "k+", label: "Phones rehomed" },
  { to: 1200, suffix: "+", label: "Business partners" },
  { to: 4.9, decimals: 1, suffix: "/5", label: "Average rating" },
  { to: 99.3, decimals: 1, suffix: "%", label: "Arrive as graded" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-ink-900/60 p-7 text-center">
            <div className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
            </div>
            <p className="mt-2 text-sm text-white/50">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
