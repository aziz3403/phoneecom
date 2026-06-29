"use client";

import { useState } from "react";

export type FaqCategory = "orders" | "grading" | "returns" | "selling";

interface FaqItem {
  cat: FaqCategory;
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    cat: "orders",
    q: "How fast is shipping, and is it really free?",
    a: "Every order ships free with carbon-neutral 2-day delivery in the contiguous US. Next-day express is available at checkout for $15. You'll get a tracking link by email as soon as your device leaves our lab.",
  },
  {
    cat: "orders",
    q: "Can I change my shipping address after ordering?",
    a: "Yes — within 1 hour of placing your order you can edit or cancel it from your confirmation email. After that, reach out to support and we'll do our best before it ships.",
  },
  {
    cat: "grading",
    q: "What do the condition grades actually mean?",
    a: "Grades describe cosmetic condition only — function is guaranteed across all of them. Pristine is indistinguishable from new, Excellent looks new from arm's length, Good has light honest wear, and Fair is well-loved but fully working.",
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
    a: "If it's not right, return it within 14 days for a full refund — no questions asked. Start a return from your order page and we'll email a free prepaid label.",
  },
  {
    cat: "returns",
    q: "What does the warranty cover?",
    a: "Every device includes a 12-month warranty covering hardware faults and battery failure (below 80%). File a claim from the Help Center and we'll repair or replace it.",
  },
  {
    cat: "selling",
    q: "How does trade-in payment work?",
    a: "Get an instant quote, ship your device free with our prepaid label, and once we verify it you're paid within 48 hours by cash, PayPal, or store credit (credit pays 10% more).",
  },
  {
    cat: "selling",
    q: "What if my device is worth less than quoted?",
    a: "We re-grade every device on arrival. If it matches your answers, you get the locked quote. If it differs, we'll send a revised offer — and you can always decline and have it returned free.",
  },
];

const CATEGORIES: { v: "all" | FaqCategory; label: string }[] = [
  { v: "all", label: "All" },
  { v: "orders", label: "Orders" },
  { v: "grading", label: "Grading" },
  { v: "returns", label: "Returns & warranty" },
  { v: "selling", label: "Selling" },
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
