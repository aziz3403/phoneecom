import { ArrowRight, Boxes, Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { WHOLESALE_TIERS } from "@/lib/wholesale";

export function WholesaleCTA() {
  return (
    <Section>
      <Reveal>
        <div className="grad-border relative overflow-hidden rounded-[2rem] bg-ink-850/70 p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-glacier-500/20 blur-[100px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-200">
                <Boxes className="h-3.5 w-3.5" /> For resellers & businesses
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Buy by the box.
                <br />
                <span className="text-gradient">Save up to 24%.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/60">
                Stock your storefront, outfit a team, or supply your region. Mix any models, unlock
                volume pricing from just 5 units, and pay on net terms.
              </p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {["Tiered volume pricing", "Net-7 to net-30 terms", "Dedicated account rep", "Custom grading specs"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/65">
                      <Check className="h-4 w-4 text-mint-400" /> {f}
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/wholesale" size="lg">
                  Explore wholesale <ArrowRight className="h-4.5 w-4.5" />
                </ButtonLink>
                <ButtonLink href="/wholesale#apply" variant="outline" size="lg">
                  Apply for an account
                </ButtonLink>
              </div>
            </div>

            {/* tier ladder */}
            <div className="space-y-2.5">
              {WHOLESALE_TIERS.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                  style={{ marginLeft: `${i * 6}%` }}
                >
                  <div>
                    <p className="font-semibold text-white">{t.label}</p>
                    <p className="text-xs text-white/45">
                      {t.min}
                      {t.max ? `–${t.max}` : "+"} units
                    </p>
                  </div>
                  <span className="font-display text-xl font-bold text-mint-300">
                    {t.discount === 0 ? "Base" : `-${Math.round(t.discount * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
