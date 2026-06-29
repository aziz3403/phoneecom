"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, BarChart3, Boxes, Layers, Lock } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useWholesaleAccount } from "@/lib/wholesale-account-store";
import { ApplyForm } from "./ApplyForm";

const SHELL = "mx-auto w-full max-w-[1280px] px-[22px]";

const LOCKED_TOOLS = [
  { icon: Layers, title: "Volume pricing tiers", body: "Per-model discounts up to 24%, unlocked automatically by quantity." },
  { icon: BarChart3, title: "Instant savings quote", body: "Price any model at any quantity and see your tier and total savings." },
  { icon: Boxes, title: "Bulk order builder", body: "Stack mixed models into one sheet and push it straight to your cart." },
];

/**
 * Gates the live wholesale pricing & ordering tools behind trade-account
 * approval. Marketing sections stay public; everything passed as children is
 * revealed only once the visitor has an approved account.
 */
export function WholesaleGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const status = useWholesaleAccount((s) => s.status);
  const company = useWholesaleAccount((s) => s.company);
  const approve = useWholesaleAccount((s) => s.approve);
  const reset = useWholesaleAccount((s) => s.reset);

  // First client render must match SSR (persisted store rehydrates sync).
  const approved = mounted && status === "approved";

  if (approved) {
    return (
      <div id="apply" className="scroll-mt-24">
        <div className="bg-[#f5f5f7] pt-14">
          <div className={SHELL}>
            <div className="flex flex-col items-start justify-between gap-4 rounded-[22px] border border-[#0a8f6e]/25 bg-white p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f7f3] text-[#0a8f6e]">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">
                    Trade account active{company ? ` · ${company}` : ""}
                  </div>
                  <p className="text-[13.5px] text-[#6e6e73]">
                    Live pricing, the savings quote and bulk ordering are unlocked below.
                  </p>
                </div>
              </div>
              <button onClick={reset} className="link shrink-0 text-[14px]">
                Sign out of portal
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div id="apply" className="scroll-mt-24 bg-[#f5f5f7]">
      <Section className="py-20 sm:py-24">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d2d2d7] bg-white px-3 py-1 text-[12.5px] font-semibold text-[#6e6e73]">
            <Lock className="h-3.5 w-3.5" /> Approved partners only
          </span>
        </div>
        <SectionHeading
          title="Live pricing & ordering tools"
          subtitle="Volume pricing, the instant savings quote and the bulk order builder are reserved for approved trade accounts. Apply below — most applications are approved in under a minute."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LOCKED_TOOLS.map((t) => (
            <div key={t.title} className="relative overflow-hidden rounded-[22px] border border-[#d2d2d7] bg-white p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#f1f7f3] text-[#0a8f6e]">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">{t.title}</h3>
                <Lock className="h-3.5 w-3.5 text-[#86868b]" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{t.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <ApplyForm onApprove={approve} />
        </div>
      </Section>
    </div>
  );
}
