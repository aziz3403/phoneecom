import { Check } from "lucide-react";
import { WHOLESALE_TIERS, MOQ } from "@/lib/wholesale";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function PricingTiers() {
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
        {WHOLESALE_TIERS.map((t, i) => {
          const featured = t.id === "business";
          return (
            <Reveal key={t.id} delay={i * 0.06}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1.5",
                  featured
                    ? "border-brand-400/50 bg-gradient-to-b from-brand-500/15 to-ink-850/60 shadow-[0_30px_70px_-30px_rgba(116,48,255,.6)]"
                    : "border-white/10 bg-ink-850/50 hover:border-white/20",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-glacier-400 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-white">{t.label}</h3>
                <p className="mt-1 text-xs text-white/45">
                  {t.min}
                  {t.max ? `–${t.max}` : "+"} units
                </p>
                <div className="mt-4">
                  <span className="font-display text-4xl font-extrabold text-mint-300">
                    {t.discount === 0 ? "Base" : `${Math.round(t.discount * 100)}%`}
                  </span>
                  {t.discount > 0 && <span className="ml-1 text-sm text-white/50">off</span>}
                </div>
                <p className="mt-3 text-sm text-white/55">{t.blurb}</p>
                <ul className="mt-5 space-y-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-white/65">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-white/45">
        Minimum order quantity: <span className="font-semibold text-white">{MOQ} units</span> per model. Mix and match
        any models across your order.
      </p>
    </div>
  );
}
