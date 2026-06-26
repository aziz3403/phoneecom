import { RefreshCw, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { snapshotItems } from "@/lib/inventory";

export function InventoryBanner() {
  const items = snapshotItems();
  const units = items.reduce((n, i) => n + i.stock, 0);
  return (
    <Section className="py-10">
      <Reveal>
        <div className="grad-border relative overflow-hidden rounded-[2rem] bg-ink-850/70 p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mint-500/20 blur-[90px]" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-500/10 px-3 py-1 text-xs font-semibold text-mint-300">
                <RefreshCw className="h-3.5 w-3.5" /> Synced daily
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                {units.toLocaleString()}+ devices in live stock
              </h2>
              <p className="mt-2 max-w-lg text-white/55">
                Browse our real warehouse inventory — {items.length}+ listings across {" "}
                Samsung, Apple and more, refreshed every day. Fully unlocked, 80%+ battery, fully
                functional.
              </p>
            </div>
            <ButtonLink href="/inventory" size="lg" className="shrink-0">
              View live inventory <ArrowRight className="h-4.5 w-4.5" />
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
