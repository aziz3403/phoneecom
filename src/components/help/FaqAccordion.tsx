"use client";

import { useState } from "react";

export type FaqCategory = "orders" | "grading" | "returns" | "selling" | "payments";

interface FaqItem {
  cat: FaqCategory;
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    cat: "orders",
    q: "How fast is shipping, and is it really free?",
    a: "Every order ships free with carbon-neutral delivery in the contiguous US, arriving in 5–7 business days. Need it faster? 2-day express is available at checkout for $20. You'll get a tracking link by email as soon as your device leaves our lab.",
  },
  {
    cat: "orders",
    q: "Can I change my shipping address after ordering?",
    a: "Yes — within 1 hour of placing your order you can edit or cancel it from your confirmation email. After that, reach out to support and we'll do our best before it ships.",
  },
  {
    cat: "grading",
    q: "What do the condition grades actually mean?",
    a: "Grades describe cosmetic condition only — function is guaranteed across all of them. New is sealed and brand-new, Excellent shows no damage from 12 inches away, Good has light barely-visible wear, and Fair has honest wear visible up close — all fully working with a battery above 80%.",
  },
  {
    cat: "grading",
    q: "Is the battery health guaranteed?",
    a: "Yes. Every device ships with verified battery health of 80%+ (85%+ on many newer models), and the exact figure is listed before you buy.",
  },
  {
    cat: "grading",
    q: "Are the phones unlocked?",
    a: "Every phone we sell is fully carrier-unlocked and network-ready worldwide, with a clean IMEI checked against global blacklists.",
  },
  {
    cat: "returns",
    q: "What is your return policy?",
    a: "If it's not right, return it within 30 days for a refund — any reason. Send it back in the condition it was sold in; you cover return postage unless the device arrived not as described (then the label's on us). A deduction may apply if it comes back damaged or missing parts or the charger.",
  },
  {
    cat: "returns",
    q: "What's in the box — do you offer a warranty?",
    a: "Every device ships with a free charging cable & adapter and is covered by a 12-month limited warranty on functional defects — if the hardware stops working under normal use, we repair, replace or refund it. Accidental damage, liquid damage, cosmetic wear and normal battery ageing aren't covered (full terms on the Warranty page). You're also covered by 30-day returns if anything isn't right when it arrives.",
  },
  {
    cat: "selling",
    q: "How does trade-in payment work?",
    a: "Get an instant quote — the price is locked for 7 days. Ship it to us (5+ devices get a free prepaid label; under 5 you cover the postage), and once it's verified you're paid by PayPal or bank transfer — or store credit, which pays 10% more.",
  },
  {
    cat: "selling",
    q: "What if my device is worth less than quoted?",
    a: "We re-grade every device on arrival. If it matches your answers, you get the locked quote. If we find something different, we email a revised offer with photos of what we found and you get a full 7 days to decide — no auto-accept. Decline and we ship it straight back (you cover return postage).",
  },
  {
    cat: "orders",
    q: "How do I track an order or trade-in without an account?",
    a: "Use the Track page with your reference — RM-123456 for orders, TI-123456 for trade-ins — plus the email you used. It shows live status, carrier tracking and payout progress. Create an account with the same email later and everything appears in your dashboard automatically.",
  },
  {
    cat: "orders",
    q: "How do I make a warranty claim?",
    a: "Within 30 days of delivery, just start a return. After that, your 12-month functional warranty applies: contact support with your order reference and a photo or short video of the issue. We confirm it looks covered, you ship it in (tracked, activation locks removed), and approved claims are repaired, replaced or refunded — with the return shipping on us.",
  },
  {
    cat: "payments",
    q: "Can I pay monthly?",
    a: "Yes — checkout runs through Stripe and offers Klarna and Affirm monthly payments alongside cards, Apple Pay and Google Pay. Financing is a separate agreement with the provider; approval and rates are shown before you commit, and your card details never touch our servers.",
  },
  {
    cat: "orders",
    q: "Are your devices' IMEIs clean?",
    a: "Yes — every device is checked against the GSMA lost/stolen registry (via the CTIA's Stolen Phone Checker) before it's listed and again before it ships. Buying secondhand anywhere else? Our free IMEI checker validates any number and points you to the same official registry.",
  },
];

const CATEGORIES: { v: "all" | FaqCategory; label: string }[] = [
  { v: "all", label: "All" },
  { v: "orders", label: "Orders" },
  { v: "grading", label: "Grading" },
  { v: "returns", label: "Returns & refunds" },
  { v: "selling", label: "Selling" },
  { v: "payments", label: "Payments" },
];

export function FaqAccordion() {
  const [cat, setCat] = useState<"all" | FaqCategory>("all");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQ.map((f, i) => ({ ...f, idx: i })).filter(
    (f) => cat === "all" || f.cat === cat,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 9,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.v}
            type="button"
            className={cat === c.v ? "chip on accent" : "chip"}
            onClick={() => {
              setCat(c.v);
              setOpen(null);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="scard-bord" style={{ padding: "8px 22px" }}>
        {filtered.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text3)",
              padding: 30,
              fontSize: 14,
            }}
          >
            No questions in this category yet.
          </p>
        ) : (
          filtered.map((f) => {
            const isOpen = open === f.idx;
            return (
              <div className="acc" key={f.q}>
                <button className="accq" onClick={() => setOpen(isOpen ? null : f.idx)}>
                  <span>{f.q}</span>
                  <span className="accic">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="acca">{f.a}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
