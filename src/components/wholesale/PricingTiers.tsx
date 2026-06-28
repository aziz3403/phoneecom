import { Check } from "lucide-react";
import { WHOLESALE_TIERS, MOQ } from "@/lib/wholesale";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function PricingTiers() {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {WHOLESALE_TIERS.map((t, i) => {
          const featured = t.id === "business";
          return (
            <Reveal key={t.id} delay={i * 0.06}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-[22px] p-6 transition-transform duration-300 hover:-translate-y-1.5",
                  featured
                    ? "bg-[#1d1d1f] text-[#f5f5f7]"
                    : "border border-[#d2d2d7] bg-white",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0a8f6e] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{t.label}</h3>
                <p className={cn("mt-1 text-xs", featured ? "text-[#a1a1a6]" : "text-[#86868b]")}>
                  {t.min}
                  {t.max ? `–${t.max}` : "+"} units
                </p>
                <div className="mt-4 flex items-baseline">
                  <span
                    className="text-4xl font-bold tracking-tight"
                    style={{ color: featured ? "#41d6a0" : "#0a8f6e" }}
                  >
                    {t.discount === 0 ? "Base" : `${Math.round(t.discount * 100)}%`}
                  </span>
                  {t.discount > 0 && (
                    <span className={cn("ml-1 text-sm", featured ? "text-[#a1a1a6]" : "text-[#6e6e73]")}>
                      off
                    </span>
                  )}
                </div>
                <p className={cn("mt-3 text-sm", featured ? "text-[#a1a1a6]" : "text-[#6e6e73]")}>{t.blurb}</p>
                <ul className="mt-5 space-y-2.5">
                  {t.perks.map((p) => (
                    <li
                      key={p}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        featured ? "text-[#d8d8da]" : "text-[#1d1d1f]",
                      )}
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: featured ? "#41d6a0" : "#0a8f6e" }}
                      />{" "}
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-[#6e6e73]">
        Minimum order quantity: <span className="font-semibold text-[#1d1d1f]">{MOQ} units</span> per model. Mix and
        match any models across your order.
      </p>
    </div>
  );
}
