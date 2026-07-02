"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BadgeCheck, BarChart3, Boxes, Clock, Layers, Lock, LogIn } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useWholesaleAccount } from "@/lib/wholesale-account-store";
import { applyWholesaleAction, myWholesaleApplication } from "@/lib/wholesale-actions";
import { ApplyForm, type ApplyFormData } from "./ApplyForm";

const SHELL = "mx-auto w-full max-w-[1280px] px-[22px]";

const LOCKED_TOOLS = [
  { icon: Layers, title: "Volume pricing tiers", body: "Per-model discounts up to 24%, unlocked automatically by quantity." },
  { icon: BarChart3, title: "Instant savings quote", body: "Price any model at any quantity and see your tier and total savings." },
  { icon: Boxes, title: "Bulk order builder", body: "Stack mixed models into one sheet and push it straight to your cart." },
];

/**
 * Gates the live wholesale tools behind an approved trade account. When auth is
 * configured, approval is tied to the signed-in user (persisted on their
 * account); otherwise it falls back to a local demo flow so the site still works
 * before the backend is set up.
 */
export function WholesaleGate({
  children,
  authConfigured,
}: {
  children: React.ReactNode;
  authConfigured: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session, update } = useSession();
  const signedIn = Boolean(session?.user);
  const sessionApproved = Boolean(session?.user?.wholesaleApproved);

  // demo fallback (used only when auth isn't configured)
  const storeStatus = useWholesaleAccount((s) => s.status);
  const storeCompany = useWholesaleAccount((s) => s.company);
  const storeApprove = useWholesaleAccount((s) => s.approve);
  const storeReset = useWholesaleAccount((s) => s.reset);

  const approved = mounted && (authConfigured ? sessionApproved : storeStatus === "approved");

  // Real mode: surface an already-filed application (so a refresh doesn't
  // show the form again while the owner is still reviewing).
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!authConfigured || !signedIn || sessionApproved) return;
    let cancelled = false;
    myWholesaleApplication()
      .then((app) => {
        if (!cancelled && app?.status === "Pending") setPending(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authConfigured, signedIn, sessionApproved]);

  async function handleSubmit(form: ApplyFormData): Promise<{ ok: boolean; error?: string }> {
    if (authConfigured && signedIn) {
      const res = await applyWholesaleAction({
        company: form.company,
        name: form.name,
        email: form.email,
        volume: form.volume,
        businessType: form.type,
        region: form.region,
        message: form.message,
      });
      if (res.ok) setPending(true);
      return { ok: res.ok, error: res.error };
    }
    // Demo fallback (no backend): a short review beat, then instant unlock.
    await new Promise((r) => setTimeout(r, 1200));
    storeApprove(form.company);
    return { ok: true };
  }

  const [checking, setChecking] = useState(false);
  async function checkApproval() {
    setChecking(true);
    try {
      // Re-reads wholesaleApproved from the DB into the session token; if the
      // owner has approved, the gate unlocks on the spot.
      await update();
    } finally {
      setChecking(false);
    }
  }

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
                    Trade account active{!authConfigured && storeCompany ? ` · ${storeCompany}` : ""}
                  </div>
                  <p className="text-[13.5px] text-[#6e6e73]">
                    Live pricing, the savings quote and bulk ordering are unlocked below.
                  </p>
                </div>
              </div>
              {authConfigured ? (
                <Link href="/account" className="link shrink-0 text-[14px]">
                  Manage account
                </Link>
              ) : (
                <button onClick={storeReset} className="link shrink-0 text-[14px]">
                  Sign out of portal
                </button>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  const needsSignIn = authConfigured && mounted && !signedIn;

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
          subtitle="Volume pricing, the instant savings quote and the bulk order builder are reserved for approved trade accounts. Apply below — applications are reviewed by our team, usually within one business day."
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
          {authConfigured && pending ? (
            <div className="mx-auto max-w-[520px] rounded-[22px] border border-[#d2d2d7] bg-white p-8 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f1f7f3] text-[#0a8f6e]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Application under review</h3>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">
                Our team is reviewing your trade-account application — you&apos;ll get an email with the
                decision, usually within one business day. The portal unlocks automatically on approval.
              </p>
              <button onClick={checkApproval} disabled={checking} className="btn btn-lt mt-5">
                {checking ? "Checking…" : "Check status"}
              </button>
            </div>
          ) : needsSignIn ? (
            <div className="mx-auto max-w-[480px] rounded-[22px] border border-[#d2d2d7] bg-white p-8 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f1f7f3] text-[#0a8f6e]">
                <LogIn className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Sign in to apply</h3>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">
                Trade accounts are tied to your reMint account. Sign in or create one, then apply —
                applications are typically reviewed within one business day.
              </p>
              <Link
                href="/login?callbackUrl=/wholesale"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-[#0a8f6e] px-5 text-[15px] font-semibold text-white transition hover:bg-[#0a7d61]"
              >
                Sign in to continue
              </Link>
            </div>
          ) : (
            <ApplyForm onSubmit={handleSubmit} pendingReview={authConfigured && signedIn} />
          )}
        </div>
      </Section>
    </div>
  );
}
