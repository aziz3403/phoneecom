import type { Metadata } from "next";
import { RefreshCw, Boxes, ShieldCheck } from "lucide-react";
import { getInventory } from "@/lib/inventory";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

// Re-pull the live Google Sheet at most once a day (ISR).
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Live inventory",
  description:
    "Our live, daily-synced stock straight from the warehouse — every model we currently have, with available condition grades and quantities.",
};

export default async function InventoryPage() {
  const { items, live, units } = await getInventory();
  const synced = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-500/10 px-3 py-1.5 text-xs font-medium text-mint-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-400" />
              </span>
              {live ? "Live — synced from inventory sheet" : "Synced inventory"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
              <RefreshCw className="h-3.5 w-3.5" /> Updated {synced} · auto-syncs daily
            </span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.04] tracking-tight text-white">
            Live <span className="text-gradient">inventory</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/60">
            Straight from our warehouse and refreshed every day. Every device is fully unlocked,
            fully functional, and guaranteed 80%+ battery health.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {[
              { icon: Boxes, label: "Units in stock", value: units.toLocaleString() },
              { icon: RefreshCw, label: "Listings", value: items.length.toLocaleString() },
              { icon: ShieldCheck, label: "Battery", value: "80%+" },
            ].map((s) => (
              <div key={s.label} className="bg-ink-900/60 p-5 text-center">
                <s.icon className="mx-auto h-5 w-5 text-brand-300" />
                <p className="mt-2 font-display text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <InventoryClient items={items} />
      </div>
    </div>
  );
}
