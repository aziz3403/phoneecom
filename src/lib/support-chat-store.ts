"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatAction {
  label: string;
  href: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  actions?: ChatAction[];
}

interface SupportChatState {
  open: boolean;
  messages: ChatMessage[];
  hydrated: boolean;
  setOpen: (open: boolean) => void;
  push: (msg: ChatMessage) => void;
  reset: () => void;
}

export const useSupportChat = create<SupportChatState>()(
  persist(
    (set) => ({
      open: false,
      messages: [],
      hydrated: false,
      setOpen: (open) => set({ open }),
      push: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      reset: () => set({ messages: [] }),
    }),
    {
      name: "remint-support",
      // Persist the transcript, but always reopen closed so the panel doesn't
      // pop up on every navigation.
      partialize: (s) => ({ messages: s.messages }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

let seq = 0;
export function newId(): string {
  seq += 1;
  return `${Date.now().toString(36)}-${seq}`;
}

export const QUICK_REPLIES = [
  "Shipping",
  "Returns",
  "What's in the box",
  "Grades & battery",
  "Trade-in",
  "Wholesale",
] as const;

export const GREETING: Omit<ChatMessage, "id"> = {
  role: "agent",
  text: "Hey! 👋 I'm Remi, reMint's support assistant. Ask me about orders, shipping, returns, what's in the box, grading, trade-ins or wholesale — what can I help with?",
};

interface Reply {
  text: string;
  actions?: ChatAction[];
}

/** Lightweight intent matcher → canned support answer. */
export function botReply(input: string): Reply {
  const raw = input.toLowerCase();
  const words = new Set(raw.split(/[^a-z0-9]+/).filter(Boolean));
  const word = (...ws: string[]) => ws.some((w) => words.has(w));
  const phrase = (...ps: string[]) => ps.some((p) => raw.includes(p));

  // conversational
  if (word("hi", "hello", "hey", "yo", "hiya", "howdy") || phrase("good morning", "good afternoon"))
    return { text: "Hey there! 😊 What can I help you with today — an order, a device, a trade-in, or something else?" };

  if (word("thanks", "thank", "thx", "cheers", "ty") || phrase("thank you"))
    return { text: "Anytime! 💚 Is there anything else I can help you with?" };

  if (word("bye", "goodbye") || phrase("that's all", "thats all", "nothing else", "no thanks"))
    return { text: "Take care! We're here 7 days a week if you need anything. 👋" };

  if (word("human", "agent", "person", "representative", "rep", "someone") || phrase("real person", "talk to", "speak to"))
    return {
      text: "Of course — I'm flagging a human specialist for you now. In a live store they'd jump in here within ~3 minutes. You can also email help@remint.com or call 1-800-REMINT (8am–8pm ET).",
    };

  // topical
  if (word("track", "tracking") || phrase("order status", "where is my", "where's my", "my order"))
    return {
      text: "Happy to help you track an order! Live status and tracking links live in your account. Pop in your order number there and you'll see exactly where it is.",
      actions: [{ label: "View my orders", href: "/account" }],
    };

  if (word("ship", "shipping", "shipped", "delivery", "deliver", "arrive", "arrives", "postage") || phrase("how long", "when will"))
    return {
      text: "We ship free across the US — standard delivery is tracked and arrives in 5–7 business days, and most orders leave the warehouse the same or next business day. Need it sooner? Add 2-day express at checkout. You'll get a tracking link by email the moment it ships.",
      actions: [{ label: "Track an order", href: "/account" }],
    };

  if (word("return", "returns", "refund", "refunds") || phrase("send back", "money back", "change my mind"))
    return {
      text: "Changed your mind? You have 30 days to return any device for a refund — no restocking fees. Just send it back in the condition it was sold in; a deduction may apply if it comes back damaged or missing parts or the charger. Start it from your account — you cover return postage unless the device arrived not as described (then the label's on us).",
      actions: [{ label: "Start a return", href: "/account" }, { label: "Returns policy", href: "/returns" }],
    };

  if (word("warranty", "guarantee", "defect", "defective", "repair", "faulty", "fault", "broken"))
    return {
      text: "Every reMint device carries a 12-month limited warranty on functional defects — if the hardware stops working under normal use we repair, replace or refund it. Accidental damage, liquid damage, cosmetic wear and normal battery ageing aren't covered. You've also got 30-day returns if something isn't right on arrival.",
      actions: [{ label: "Warranty terms", href: "/warranty" }],
    };

  if (word("grade", "grades", "grading", "condition", "scratch", "scratches", "scuff", "scuffs", "battery", "health", "cosmetic") || phrase("what does new mean"))
    return {
      text: "Every phone is graded New, Excellent, Good or Fair. All of them are fully tested, work like new and ship with 80%+ battery health — the grade just reflects cosmetic wear. Want the full breakdown with photos?",
      actions: [{ label: "See grades", href: "/grades" }],
    };

  if (word("trade", "tradein", "sell", "selling", "exchange") || phrase("trade in", "trade-in", "sell my"))
    return {
      text: "You can trade in your old phone for instant credit or cash. Get a quote in under a minute, ship it free, and get paid within 2 business days of inspection.",
      actions: [{ label: "Start a trade-in", href: "/trade-in" }],
    };

  if (word("wholesale", "bulk", "business", "reseller", "resellers", "b2b", "volume") || phrase("buy in bulk", "trade account"))
    return {
      text: "For business buyers we offer volume pricing up to 24% off, net terms and a dedicated rep. Apply for a trade account to unlock live pricing and bulk ordering.",
      actions: [{ label: "Wholesale & apply", href: "/wholesale" }],
    };

  if (word("pay", "payment", "payments", "finance", "financing", "installment", "installments", "klarna", "afterpay", "card", "cards"))
    return {
      text: "We accept all major cards, Apple Pay, Google Pay and monthly financing at checkout. Everything is processed securely — we never store your card details.",
    };

  if (word("unlock", "unlocked", "carrier", "sim", "esim", "network", "locked"))
    return {
      text: "Every phone we sell is fully unlocked and works with any carrier worldwide — just add your SIM or eSIM and you're good to go.",
    };

  if (word("price", "prices", "cheap", "discount", "discounts", "coupon", "coupons", "deal", "deals", "promo", "cost", "expensive"))
    return {
      text: "Our prices already beat new by up to 50%. Trading in your old device knocks even more off, and wholesale buyers get volume discounts on top.",
      actions: [{ label: "Shop devices", href: "/shop" }],
    };

  // fallback
  return {
    text: "Great question — let me point you the right way. I can help with shipping, returns, what's in the box, grading & battery, trade-ins, payments or wholesale. Which is closest? (Or type “human” to reach a specialist.)",
  };
}
