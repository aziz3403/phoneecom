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
  "Track my order",
  "Trade-in value",
  "Returns & warranty",
  "Payments & financing",
  "Grades & battery",
  "Wholesale",
] as const;

export const GREETING: Omit<ChatMessage, "id"> = {
  role: "agent",
  text: "Hey! 👋 I'm Remi, reMint's assistant. I can track an order or trade-in, quote your old phone, and answer anything about shipping, returns, the 12-month warranty, grading or wholesale. What do you need?",
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
      text: "Of course. Send the team a message from the Help page with your reference number (RM-… or TI-…) and they'll reply by email within one business day — accessibility issues and payout problems go to the front of the queue.",
      actions: [{ label: "Contact support", href: "/help" }],
    };

  // topical — most specific intents first
  if (phrase("cancel my order", "cancel order", "wrong address", "change my address", "change the address", "edit my order"))
    return {
      text: "If it hasn't shipped yet we can usually catch it. Contact support right away with your order reference (RM-…) and what needs to change — cancellations and address fixes are handled before anything else each morning.",
      actions: [{ label: "Contact support", href: "/help" }, { label: "Check order status", href: "/track" }],
    };

  if (word("track", "tracking") || phrase("order status", "where is my", "where's my", "my order"))
    return {
      text: "Happy to help you track it! Use the Track page with your reference (RM-… for orders, TI-… for trade-ins) and the email you used — no account needed. Signed-in customers also see everything in their dashboard.",
      actions: [{ label: "Track order or trade-in", href: "/track" }, { label: "Your account", href: "/account" }],
    };

  if (phrase("no email", "didn't get an email", "didnt get an email", "no confirmation", "lost my reference", "lost the reference"))
    return {
      text: "First check spam/promotions for a message from reMint. Your reference starts with RM- (orders) or TI- (trade-ins). Still nothing? Contact support with the email you used at checkout and we'll resend everything.",
      actions: [{ label: "Track with your email", href: "/track" }, { label: "Contact support", href: "/help" }],
    };

  if (word("ship", "shipping", "shipped", "delivery", "deliver", "arrive", "arrives", "postage") || phrase("how long", "when will"))
    return {
      text: "Orders ship free across the US — tracked standard delivery arrives in 5–7 business days, and most orders leave the warehouse within a business day. Need it sooner? Add 2-day express ($20) at checkout. Your tracking number is emailed the moment it ships.",
      actions: [{ label: "Track an order", href: "/track" }],
    };

  if (word("return", "returns", "refund", "refunds") || phrase("send back", "money back", "change my mind"))
    return {
      text: "Changed your mind? You have 30 days to return any device for a refund — no restocking fees. Just send it back in the condition it was sold in; a deduction may apply if it comes back damaged or missing parts or the charger. Start it from your account — you cover return postage unless the device arrived not as described (then the label's on us).",
      actions: [{ label: "Start a return", href: "/account" }, { label: "Returns policy", href: "/returns" }],
    };

  if (phrase("stopped working", "won't turn on", "wont turn on", "screen died", "make a claim", "warranty claim", "file a claim"))
    return {
      text: "Sorry about that — let's get it fixed. If it's within 30 days of delivery you can simply return it. After that, your 12-month warranty covers functional hardware failures: contact support with your order reference and a photo/video of the issue, we'll confirm it's covered and send shipping instructions, and approved claims are repaired, replaced or refunded with return shipping on us.",
      actions: [{ label: "Start a claim", href: "/help" }, { label: "What's covered", href: "/warranty" }],
    };

  if (word("warranty", "guarantee", "defect", "defective", "repair", "faulty", "fault", "broken"))
    return {
      text: "Every reMint device carries a 12-month limited warranty on functional defects — if the hardware stops working under normal use we repair, replace or refund it. Accidental damage, liquid damage, cosmetic wear and normal battery ageing aren't covered. You've also got 30-day returns if something isn't right on arrival.",
      actions: [{ label: "Warranty terms", href: "/warranty" }],
    };

  if (word("imei", "blacklist", "blacklisted", "stolen", "esn") || phrase("lost or stolen", "clean imei"))
    return {
      text: "Every device we sell is checked against the GSMA lost/stolen registry (via the CTIA Stolen Phone Checker) before listing AND before dispatch — verified clean or it doesn't ship. Buying elsewhere? Use our free IMEI checker first.",
      actions: [{ label: "Free IMEI check", href: "/imei-check" }],
    };

  if (word("grade", "grades", "grading", "condition", "scratch", "scratches", "scuff", "scuffs", "battery", "health", "cosmetic") || phrase("what does new mean"))
    return {
      text: "Every phone is graded New, Excellent, Good or Fair. All of them are fully tested, work like new and ship with 80%+ battery health — the grade just reflects cosmetic wear. Want the full breakdown with photos?",
      actions: [{ label: "See grades", href: "/grades" }],
    };

  if (phrase("how much for my", "how much is my", "what's my phone worth", "whats my phone worth", "price list", "buyback") || (word("worth", "quote") && word("phone", "iphone", "ipad", "galaxy", "device", "my")))
    return {
      text: "Let's find out — we publish exactly what we pay for 110+ models, by grade, synced live with our price book. Get an instant quote in under a minute; it's locked for 7 days.",
      actions: [{ label: "See the price list", href: "/trade-in/prices" }, { label: "Instant quote", href: "/trade-in" }],
    };

  if (phrase("where do i ship", "where do i send", "shipping address", "send my trade"))
    return {
      text: "Trade-ins go to: reMint Trade-ins, 513 88th St, Brooklyn, NY 11209 — it's also in your offer confirmation email with your reference. 5+ devices get a free prepaid label; smaller batches ship at your cost with any tracked service. Inspection is always free.",
      actions: [{ label: "Track a trade-in", href: "/track" }],
    };

  if (word("trade", "tradein", "sell", "selling", "exchange") || phrase("trade in", "trade-in", "sell my"))
    return {
      text: "Trade in your old device for real money: instant quote locked for 7 days, paid by PayPal or bank transfer after inspection — or take 10% extra as store credit. Ship free at 5+ devices (under 5 you cover postage; inspection is always free).",
      actions: [{ label: "Start a trade-in", href: "/trade-in" }, { label: "See what we pay", href: "/trade-in/prices" }],
    };

  if (word("wholesale", "bulk", "business", "reseller", "resellers", "b2b", "volume") || phrase("buy in bulk", "trade account"))
    return {
      text: "For business buyers: volume pricing up to 24% off, net terms as you scale, CTIA-mapped grading, per-unit IMEI manifests and a 30-day functional RMA. Apply for a trade account — applications are reviewed within one business day.",
      actions: [{ label: "Wholesale & apply", href: "/wholesale" }, { label: "Live inventory", href: "/inventory" }],
    };

  if (word("restock", "restocking", "restocked") || phrase("out of stock", "back in stock", "when will you have"))
    return {
      text: "We only list what's physically in our warehouse, so if a model isn't showing we're genuinely out. Stock syncs daily — check back soon, or grab a similar grade of the same model line.",
      actions: [{ label: "Browse in-stock devices", href: "/shop" }],
    };

  if (word("pay", "payment", "payments", "finance", "financing", "installment", "installments", "klarna", "affirm", "afterpay", "card", "cards") || phrase("apple pay", "google pay", "monthly payments"))
    return {
      text: "We take all major cards, Apple Pay and Google Pay, plus monthly payments with Klarna or Affirm — all through Stripe's secure checkout, so your card details never touch our servers.",
      actions: [{ label: "Shop devices", href: "/shop" }],
    };

  if (word("privacy", "terms", "policy", "policies", "legal", "accessibility"))
    return {
      text: "All our policies are published in plain language: warranty, returns, privacy, terms and our accessibility statement.",
      actions: [
        { label: "Warranty", href: "/warranty" },
        { label: "Returns", href: "/returns" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
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
    text: "I want to get this right for you. I can help with tracking, shipping, returns, the 12-month warranty, grading & battery, trade-in values, payments or wholesale — tap one below, or type “human” and the team will follow up by email within a business day.",
    actions: [
      { label: "Track", href: "/track" },
      { label: "Help center", href: "/help" },
      { label: "Trade-in value", href: "/trade-in/prices" },
    ],
  };
}
