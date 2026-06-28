import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Boxes, ShieldCheck } from "lucide-react";
import { getInventory } from "@/lib/inventory";
import { InventoryClient } from "@/components/inventory/InventoryClient";

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
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Live inventory
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="tag accent">
            <span className="livedot" />
            {live ? "Live — synced from inventory sheet" : "Synced inventory"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#86868b]">
            <RefreshCw className="h-3.5 w-3.5" /> Updated {synced} · auto-syncs daily
          </span>
        </div>

        <h1 className="ptitle mt-3">Live inventory</h1>
        <p className="psub">
          Straight from our warehouse and refreshed every day. Every device is fully unlocked, fully
          functional, and guaranteed 80%+ battery health.
        </p>

        <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[22px] border border-[#d2d2d7] bg-[#d2d2d7] gap-px">
          {[
            { icon: Boxes, label: "Units in stock", value: units.toLocaleString() },
            { icon: RefreshCw, label: "Listings", value: items.length.toLocaleString() },
            { icon: ShieldCheck, label: "Battery", value: "80%+" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-5 text-center">
              <s.icon className="mx-auto h-5 w-5 text-[#0a8f6e]" />
              <p className="mt-2 text-2xl font-bold tracking-[-.02em] text-[#1d1d1f]">{s.value}</p>
              <p className="text-xs text-[#6e6e73]">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="shell pb-24 pt-10">
        <InventoryClient items={items} />
      </div>
    </div>
  );
}
