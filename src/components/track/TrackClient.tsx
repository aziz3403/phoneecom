"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, Recycle, Truck } from "lucide-react";
import { trackLookupAction, type TrackResult } from "@/lib/track-actions";
import { emailError, allValid } from "@/lib/validate";
import { formatPrice, cn } from "@/lib/utils";

const STATUS_HELP: Record<string, string> = {
  // orders
  Pending: "Payment is being confirmed — this usually takes under a minute after checkout.",
  Confirmed: "Paid and queued for final inspection & packing. You'll get a shipping email with tracking next.",
  Shipped: "On its way — use the carrier tracking number below for live location.",
  // trade-ins
  Submitted: "Offer locked. Ship your device(s) to the address in your confirmation email within 7 days to hold the price.",
  Received: "Your devices arrived and are queued for inspection — usually done within 2 business days.",
  Inspected: "Inspection complete at the quoted value — payout is on its way to you.",
  Requoted: "We found a different condition than described and emailed you a revised offer with photos. You have 7 days to decide.",
  Paid: "Payout sent. Thanks for trading with reMint!",
  Returned: "The device is on its way back to you.",
  Cancelled: "This trade-in was cancelled.",
};

export function TrackClient() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const refClean = reference.trim().toUpperCase();
  const errs = {
    reference: !refClean
      ? "Reference is required."
      : /^(RM|TI)-\d{6}$/.test(refClean)
        ? undefined
        : "References look like RM-123456 or TI-123456.",
    email: emailError(email),
  };
  const valid = allValid(errs);
  const showErr = (k: "reference" | "email") => (touched[k] || touched.__all) && errs[k];

  async function lookup() {
    if (busy) return;
    if (!valid) {
      setTouched((t) => ({ ...t, __all: true }));
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await trackLookupAction({ reference: refClean, email });
      if (res.result) setResult(res.result);
      else setError(res.error ?? "Something went wrong — please try again.");
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="scard-bord">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_auto]">
        <div>
          <label className="flabel" htmlFor="trk-ref">Reference</label>
          <input
            id="trk-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, reference: true }))}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            aria-invalid={!!showErr("reference")}
            className={cn("inpt font-mono uppercase", showErr("reference") && "!border-[#d99]")}
            placeholder="RM-123456"
          />
          {showErr("reference") && <p role="alert" className="mt-1 text-[11.5px] text-[#b23b3b]">{errs.reference}</p>}
        </div>
        <div>
          <label className="flabel" htmlFor="trk-email">Email used</label>
          <input
            id="trk-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            aria-invalid={!!showErr("email")}
            className={cn("inpt", showErr("email") && "!border-[#d99]")}
            placeholder="you@email.com"
          />
          {showErr("email") && <p role="alert" className="mt-1 text-[11.5px] text-[#b23b3b]">{errs.email}</p>}
        </div>
        <div className="flex items-end">
          <button onClick={lookup} disabled={busy} className={cn("btn w-full sm:w-auto", busy && "opacity-60")}>
            <Search className="h-4 w-4" /> {busy ? "Looking…" : "Track"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-[12px] bg-[#fbeaea] px-4 py-3 text-[13.5px] leading-relaxed text-[#b23b3b]">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-[14px] border border-[#e2e2e6] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#edf6f0] text-[#0a8f6e]">
              {result.kind === "order" ? <Package className="h-5 w-5" /> : <Recycle className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[14px] font-semibold text-[#1d1d1f]">{result.id}</p>
              <p className="truncate text-[12.5px] text-[#86868b]">{result.summary}</p>
            </div>
            <span className="rounded-full bg-[#edf6f0] px-3 py-1 text-[12.5px] font-semibold text-[#0a7d61]">
              {result.status}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-[#494950]">
            {STATUS_HELP[result.status] ?? `Current status: ${result.status}.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[#6e6e73]">
            <span>{result.kind === "order" ? "Order total" : "Your payout"}: <b className="text-[#1d1d1f]">{formatPrice(result.total)}</b></span>
            <span>{result.kind === "order" ? "Placed" : "Submitted"}: {new Date(result.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            {result.deliveryEta && <span>Estimated delivery: <b className="text-[#1d1d1f]">{result.deliveryEta}</b></span>}
          </div>
          {result.trackingNumber && (
            <p className="mt-3 flex items-center gap-2 rounded-[11px] bg-[#f5f5f7] px-3.5 py-2.5 text-[13px] text-[#494950]">
              <Truck className="h-4 w-4 flex-none text-[#0a8f6e]" />
              {result.carrier} · <b className="font-mono">{result.trackingNumber}</b>
            </p>
          )}
          {result.kind === "tradeIn" && result.status === "Requoted" && (
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#86868b]">
              Revised offers come with photos of what we found. Reply to the email to accept or
              decline — declined devices ship back to you (return postage at your cost).
            </p>
          )}
          <p className="mt-4 text-[12.5px] text-[#86868b]">
            Questions about this {result.kind === "order" ? "order" : "trade-in"}?{" "}
            <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">Contact support</Link> and
            quote <b className="font-mono">{result.id}</b>.
          </p>
        </div>
      )}
    </div>
  );
}
