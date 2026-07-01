"use client";

import { useState } from "react";
import { Check, Boxes, Truck, Zap, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const PERKS = [
  { icon: BadgeDollarSign, title: "Bulk bonus pricing", body: "The more you send, the more per unit — above our list price. Just ask." },
  { icon: Truck, title: "Free FedEx labels at 5+", body: "Prepaid, tracked & insured labels for the whole batch. We cover it." },
  { icon: Zap, title: "Fast settlement", body: "One invoice for the lot — paid by bank transfer or PayPal once inspected." },
];

const SIZES = ["5–20", "20–50", "50–200", "200+"] as const;

export function BulkQuote() {
  const [size, setSize] = useState<(typeof SIZES)[number]>("20–50");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = firstName.trim() && lastName.trim() && /.+@.+\..+/.test(email) && phone.trim();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6f0] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#0a7d61]">
          <Boxes className="h-3.5 w-3.5" /> For resellers, repair shops &amp; recyclers
        </span>
        <h2 className="mt-3 text-[clamp(24px,3vw,32px)] font-bold tracking-[-.02em] text-[#1d1d1f]">
          Selling a whole batch? Let&apos;s talk numbers.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-[#6e6e73]">
          Got 5, 50 or 500 devices? We buy lots of every condition — working, cracked, faulty, mixed —
          at some of the highest payouts in the US, with bonus pricing on volume. Send us the mix and
          we&apos;ll come back with a firm quote fast.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-[11px] bg-[#edf6f0] text-[#0a8f6e]"><p.icon className="h-[19px] w-[19px]" /></span>
              <div>
                <p className="text-[15px] font-semibold text-[#1d1d1f]">{p.title}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#6e6e73]">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="scard-bord">
        {sent ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#edf6f0]"><Check className="h-9 w-9 text-[#0a8f6e]" /></div>
            <h3 className="mt-5 text-[22px] font-bold tracking-[-.02em] text-[#1d1d1f]">Request received</h3>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-[#6e6e73]">
              Thanks{firstName ? `, ${firstName}` : ""} — our buyback team will email {email || "you"} a firm bulk quote,
              usually within a business day. (Demo — nothing was sent.)
            </p>
            <button onClick={() => setSent(false)} className="link mt-5">Send another</button>
          </div>
        ) : (
          <>
            <h3 className="text-[18px] font-bold tracking-[-.01em] text-[#1d1d1f]">Request a bulk quote</h3>
            <p className="mb-4 mt-1 text-[13.5px] text-[#86868b]">A few details and we&apos;ll price your batch.</p>

            <span className="flabel">Roughly how many devices?</span>
            <div className="mb-4 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={cn("chip", size === s && "on accent")}>{s}</button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="flabel" htmlFor="bq-first">First name</label>
                <input id="bq-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="inpt" placeholder="Jane" />
              </div>
              <div>
                <label className="flabel" htmlFor="bq-last">Last name</label>
                <input id="bq-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className="inpt" placeholder="Doe" />
              </div>
              <div>
                <label className="flabel" htmlFor="bq-email">Email</label>
                <input id="bq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="inpt" placeholder="you@company.com" />
              </div>
              <div>
                <label className="flabel" htmlFor="bq-phone">Phone</label>
                <input id="bq-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="inpt" placeholder="(555) 123-4567" />
              </div>
              <div className="sm:col-span-2">
                <label className="flabel" htmlFor="bq-company">Company (optional)</label>
                <input id="bq-company" value={company} onChange={(e) => setCompany(e.target.value)} className="inpt" placeholder="Your business" />
              </div>
              <div className="sm:col-span-2">
                <label className="flabel" htmlFor="bq-notes">What are you selling?</label>
                <textarea id="bq-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="area" placeholder="e.g. ~40 mixed iPhones 11–14, some cracked; 10 Galaxy S21/S22; a few iPads." />
              </div>
            </div>

            <button onClick={() => canSend && setSent(true)} disabled={!canSend} className={cn("btn mt-5 w-full", !canSend && "opacity-50")}>
              Get my bulk quote
            </button>
            <p className="mt-2 text-center text-[12px] text-[#86868b]">No obligation. We reply with a firm price, usually within a business day.</p>
          </>
        )}
      </div>
    </div>
  );
}
