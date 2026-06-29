"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useWholesaleAccount } from "@/lib/wholesale-account-store";

interface Row {
  k: string;
  v: string;
  accent: boolean;
}

/**
 * Hero "sample lot · live pricing" card. Live numbers are only revealed to
 * approved trade accounts — everyone else sees a blurred, locked preview.
 */
export function WholesaleHeroCard({ rows }: { rows: Row[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const approved = useWholesaleAccount((s) => s.status === "approved");
  // Guard first render to match SSR (persisted store rehydrates synchronously).
  const unlocked = mounted && approved;

  return (
    <div className="relative rounded-[22px] border border-white/10 bg-white/[0.05] p-6">
      <div className="flex items-center justify-between">
        <p
          className="text-[13px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "#a1a1a6" }}
        >
          Sample lot · live pricing
        </p>
        {unlocked ? (
          <span className="rounded-full bg-[#41d6a0]/15 px-2.5 py-1 text-[11px] font-semibold text-[#41d6a0]">
            Live
          </span>
        ) : (
          <Lock className="h-4 w-4 text-[#a1a1a6]" />
        )}
      </div>

      <div className={`mt-3 transition ${unlocked ? "" : "select-none blur-[6px]"}`} aria-hidden={!unlocked}>
        {rows.map((row) => (
          <div
            key={row.k}
            className="flex items-center justify-between border-b border-white/10 py-3 text-sm last:border-b-0"
          >
            <span style={{ color: "#a1a1a6" }}>{row.k}</span>
            <span className="font-semibold" style={{ color: row.accent ? "#41d6a0" : "#f5f5f7" }}>
              {row.v}
            </span>
          </div>
        ))}
      </div>

      {!unlocked && (
        <div className="absolute inset-0 grid place-items-center rounded-[22px] bg-black/30 p-6 text-center backdrop-blur-[2px]">
          <div>
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Lock className="h-[18px] w-[18px] text-white" />
            </div>
            <p className="mt-3 text-[15px] font-semibold" style={{ color: "#f5f5f7" }}>
              Live wholesale pricing
            </p>
            <p className="mx-auto mt-1 max-w-[220px] text-[13px]" style={{ color: "#a1a1a6" }}>
              Visible to approved trade accounts. Apply below — it takes a minute.
            </p>
            <a
              href="#apply"
              className="mt-4 inline-flex h-9 items-center rounded-full bg-[#41d6a0] px-4 text-[13px] font-semibold text-[#04140f] transition hover:bg-[#5ee0b3]"
            >
              Apply for access
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
