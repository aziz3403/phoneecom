"use server";

import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { tradeIns, bulkQuotes } from "./db/schema";
import {
  getTradeInModels, findRow, quote, FREE_SHIP_MIN,
  type Grade, type Lock,
} from "./trade-in-pricing";
import { sendEmail, notifyOwner, tradeInReceivedEmail } from "./email";
import { formatPrice } from "./utils";
import { rateLimit, callerIp } from "./rate-limit";
import { TRADE_IN_SHIP_TO } from "./trade-in-shipping";

const EMAIL_RE = /.+@.+\..+/;

/** Grades a seller can self-report. "swap"/"new" are wholesale-book tiers and
 * can't be claimed from the wizard — rejecting them here blocks quote inflation. */
const CLAIMABLE_GRADES: ReadonlySet<Grade> = new Set(["a", "b", "c", "d", "doa"]);

export interface TradeInLineInput {
  modelKey: string;
  gb: number;
  color: string;
  lock: Lock;
  carrierLabel: string;
  grade: Grade;
  crackedBack: boolean;
  crackedLens: boolean;
  badFaceId: boolean;
  batteryLow: boolean;
  repairMessage: boolean;
  qty: number;
}

export interface TradeInSubmitInput {
  lines: TradeInLineInput[];
  payout: "paypal" | "bank" | "credit";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  paypalEmail?: string;
  routing?: string;
  account?: string;
}

export interface TradeInSubmitResult {
  ok: boolean;
  id?: string;
  total?: number;
  /** true when no DB is configured — the client shows the demo notice */
  demo?: boolean;
  error?: string;
}

const PAYOUT_LABEL: Record<TradeInSubmitInput["payout"], string> = {
  paypal: "to PayPal (~2 business days)",
  bank: "by bank transfer (up to 5 business days)",
  credit: "as store credit with your +10% bonus (instant)",
};

/**
 * Persist a trade-in submission. Every line is re-quoted server-side from the
 * live price book — the client's numbers are display-only — then the seller
 * gets a confirmation email and the owner an alert.
 */
export async function submitTradeInAction(input: TradeInSubmitInput): Promise<TradeInSubmitResult> {
  // -------- validate contact + payout --------
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const phone = input.phone?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!firstName || !lastName || !phone || !email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please fill in your name, phone and a valid email." };
  }
  if (input.payout === "paypal" && !EMAIL_RE.test(input.paypalEmail ?? "")) {
    return { ok: false, error: "Please add a valid PayPal email." };
  }
  if (input.payout === "bank" && !(input.routing?.trim() && input.account?.trim())) {
    return { ok: false, error: "Please add your bank routing and account number." };
  }
  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 100) {
    return { ok: false, error: "Your trade-in basket is empty." };
  }
  if (!rateLimit(`tradein:${await callerIp()}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many submissions — please wait a few minutes and try again." };
  }

  // -------- re-quote every line from the price book --------
  const { models } = await getTradeInModels();
  const byKey = new Map(models.map((m) => [m.key, m]));
  const lines: Array<TradeInLineInput & { name: string; unit: number }> = [];
  for (const l of input.lines) {
    const model = byKey.get(l.modelKey);
    const qty = Math.floor(l.qty);
    if (!model || !Number.isFinite(qty) || qty < 1 || qty > 500 || !CLAIMABLE_GRADES.has(l.grade)) {
      return { ok: false, error: "One of your devices is no longer in our price book — please rebuild the quote." };
    }
    const row = findRow(model, l.gb, l.lock);
    if (!row) return { ok: false, error: `We can't price the ${model.name} in that configuration right now.` };
    const q = quote(row, {
      grade: l.grade,
      crackedBack: l.crackedBack,
      crackedLens: l.crackedLens,
      badFaceId: l.badFaceId,
      batteryLow: l.batteryLow,
      repairMessage: l.repairMessage,
    });
    if (!q.hasPrice) return { ok: false, error: `We can't price the ${model.name} in that condition right now.` };
    // $5 floor only for devices with positive value — negative book prices
    // (recycling-cost models) quote to $0, matching the wizard.
    lines.push({ ...l, qty, name: model.name, unit: q.total > 0 ? Math.max(5, q.total) : 0 });
  }

  const deviceCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.unit * l.qty, 0);
  const total = input.payout === "credit" ? Math.round(subtotal * 1.1) : subtotal;
  const freeShip = deviceCount >= FREE_SHIP_MIN;
  const id = "TI-" + String(Math.floor(100000 + Math.random() * 899999));

  // -------- persist (skipped gracefully when the DB isn't configured) --------
  if (!isAuthConfigured()) return { ok: true, id, total, demo: true };
  try {
    const session = await auth();
    const db = getDb();
    await db.insert(tradeIns).values({
      id,
      userId: session?.user?.id ?? null,
      email,
      firstName,
      lastName,
      phone,
      payoutMethod: input.payout,
      total,
      deviceCount,
      status: "Submitted",
      data: {
        lines,
        subtotal,
        freeShip,
        payout: {
          method: input.payout,
          paypalEmail: input.payout === "paypal" ? input.paypalEmail : undefined,
          routing: input.payout === "bank" ? input.routing : undefined,
          account: input.payout === "bank" ? input.account : undefined,
        },
      },
    });
  } catch (err) {
    console.error("[trade-in] failed to persist submission", err);
    return { ok: false, error: "Something went wrong saving your trade-in — please try again." };
  }

  // -------- emails (best-effort) --------
  const tpl = tradeInReceivedEmail({
    id,
    firstName,
    total,
    deviceCount,
    payoutLabel: PAYOUT_LABEL[input.payout],
    freeShip,
    shipToName: TRADE_IN_SHIP_TO.name,
    shipToLines: TRADE_IN_SHIP_TO.lines,
  });
  await sendEmail({ to: email, ...tpl });
  await notifyOwner(
    `New trade-in ${id} — ${formatPrice(total)} (${deviceCount} device${deviceCount === 1 ? "" : "s"})`,
    `<p>${firstName} ${lastName} · ${email} · ${phone}</p>
     <p>${lines.map((l) => `${l.qty}× ${l.name} ${l.gb}GB ${l.color} (${l.grade.toUpperCase()}) — ${formatPrice(l.unit)}/unit`).join("<br/>")}</p>
     <p>Payout: ${PAYOUT_LABEL[input.payout]} · ${freeShip ? "free label owed" : "seller ships at own cost"}</p>`,
  );

  return { ok: true, id, total };
}

export interface BulkQuoteInput {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  batchSize: string;
  notes?: string;
}

/** Persist a bulk buyback quote request and alert the owner. */
export async function submitBulkQuoteAction(
  input: BulkQuoteInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  if (!firstName || !lastName || !phone || !email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please fill in your name, phone and a valid email." };
  }
  if (!rateLimit(`bulkquote:${await callerIp()}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many requests — please wait a few minutes and try again." };
  }

  if (!isAuthConfigured()) return { ok: true, demo: true };
  try {
    const db = getDb();
    await db.insert(bulkQuotes).values({
      firstName,
      lastName,
      company: input.company?.trim() || null,
      email,
      phone,
      batchSize: String(input.batchSize).slice(0, 40),
      notes: input.notes?.trim().slice(0, 2000) || null,
    });
  } catch (err) {
    console.error("[bulk-quote] failed to persist request", err);
    return { ok: false, error: "Something went wrong — please try again." };
  }

  await sendEmail({
    to: email,
    subject: "We got your bulk quote request",
    html: `<p>Thanks ${firstName} — our buyback team is pricing your batch (${input.batchSize} devices) and will reply within one business day with a firm quote.</p>`,
  });
  await notifyOwner(
    `New bulk quote request — ${input.batchSize} devices`,
    `<p>${firstName} ${lastName}${input.company ? ` · ${input.company}` : ""}<br/>${email} · ${phone}</p><p>${(input.notes ?? "").replace(/\n/g, "<br/>")}</p>`,
  );
  return { ok: true };
}
