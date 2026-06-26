"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "How fast is shipping?",
    a: "Every order ships free with carbon-neutral 2-day delivery in the contiguous US. You'll get a tracking number the moment it leaves our lab, usually within 24 hours of ordering.",
  },
  {
    q: "What does the 12-month warranty cover?",
    a: "Any hardware fault not caused by accidental damage — battery, board, cameras, speakers, buttons and more. If something fails, we repair or replace it free, and cover return shipping both ways.",
  },
  {
    q: "What's your return policy?",
    a: "We offer a 14-day RMA. If you're not satisfied, start a return within 14 days and send it back in its original condition for a full refund — no restocking fee. We email you a prepaid label.",
  },
  {
    q: "Are the phones unlocked?",
    a: "Yes. Unless a listing explicitly says otherwise, every device is carrier-unlocked and ready for any compatible network worldwide. Just pop in your SIM or activate your eSIM.",
  },
  {
    q: "What condition will my device be in?",
    a: "Exactly as graded. We use four honest cosmetic grades — Pristine, Excellent, Good and Fair — and every device passes the same 50-point functional inspection regardless of grade.",
  },
  {
    q: "How does battery health work?",
    a: "Every device is guaranteed at 80%+ battery health with a genuine cell. Most come in well above the minimum, and every phone is fully unlocked and fully functional.",
  },
  {
    q: "Can I pay over time?",
    a: "Yes — financing is available at checkout, splitting your order into monthly payments. The estimated monthly figure is shown on every product page.",
  },
  {
    q: "Do you sell to businesses?",
    a: "Absolutely. Our wholesale program offers tiered volume pricing, net terms and dedicated support for resellers, repair shops, carriers and enterprises. Visit the Wholesale page to get started.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-3xl border border-white/10 bg-ink-850/50">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-medium text-white">{f.q}</span>
              <Plus
                className={cn("h-5 w-5 shrink-0 text-brand-300 transition-transform duration-300", isOpen && "rotate-45")}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
