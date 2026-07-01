"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { findRow, type TradeInModel, type Grade } from "@/lib/trade-in-pricing";
import { formatPrice, cn } from "@/lib/utils";

const TYPES = ["All", "iPhone", "Galaxy", "iPad"] as const;
type TypeF = (typeof TYPES)[number];
const STORAGES = [64, 128, 256, 512, 1024];
const storageLabel = (g: number) => (g >= 1024 ? `${g / 1024}TB` : `${g}GB`);

// Columns shown — the grades a seller cares about, top-storage unlocked.
const COLS: { key: Grade; label: string; hint: string }[] = [
  { key: "a", label: "Flawless", hint: "Like new, no marks" },
  { key: "b", label: "Good", hint: "Light wear, works 100%" },
  { key: "c", label: "Cracked", hint: "Cracked glass, screen ok" },
  { key: "d", label: "Faulty", hint: "Bad screen, still functional" },
];

export function PriceList({ models }: { models: TradeInModel[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeF>("All");
  const [gb, setGb] = useState(128);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return models.filter(
      (m) => (type === "All" || m.group === type) && (!needle || m.name.toLowerCase().includes(needle)),
    );
  }, [models, type, q]);

  return (
    <div>
      {/* controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 110+ models…"
            className="inpt !pl-10"
            aria-label="Search models"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("chip", type === t && "on accent")}>{t}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-[#6e6e73]">Capacity</span>
        {STORAGES.map((s) => (
          <button key={s} onClick={() => setGb(s)} className={cn("chip !py-1.5 !text-[12.5px]", gb === s && "on accent")}>{storageLabel(s)}</button>
        ))}
      </div>

      {/* table */}
      <div className="mt-5 overflow-x-auto rounded-[18px] border border-[#e2e2e6]">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e2e2e6] bg-[#fafafa]">
              <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#86868b]">Model</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-3 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#86868b]">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const r = findRow(m, gb, "unlocked");
              const cap = m.storages.length ? storageLabel(m.storages.reduce((a, b) => (Math.abs(b - gb) < Math.abs(a - gb) ? b : a))) : "—";
              return (
                <tr key={m.key} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafcfb]">
                  <td className="px-4 py-3">
                    <div className="text-[13.5px] font-semibold text-[#1d1d1f]">{m.name}</div>
                    <div className="text-[11.5px] text-[#86868b]">{cap} · unlocked</div>
                  </td>
                  {COLS.map((c) => {
                    const v = r?.[c.key];
                    return (
                      <td key={c.key} className="px-3 py-3 text-right text-[13.5px] font-semibold text-[#1d1d1f]">
                        {v != null ? formatPrice(v) : <span className="text-[#c0c0c6]">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={m.catalogSlug ? `/trade-in?device=${m.catalogSlug}` : "/trade-in"}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-[#0a8f6e] hover:underline"
                    >
                      Sell <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={COLS.length + 2} className="px-4 py-10 text-center text-[14px] text-[#86868b]">No models match “{q}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-[#86868b]">
        Showing {rows.length} model{rows.length === 1 ? "" : "s"} · prices are what we pay for an <b>unlocked</b> device at the
        nearest capacity to {storageLabel(gb)}. Carrier-locked, other capacities and battery/repair
        deductions are figured in the <Link href="/trade-in" className="link !text-[12.5px]">instant estimator</Link>. We
        price-match &amp; beat competitors — just ask.
      </p>
    </div>
  );
}
