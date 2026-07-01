"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import { users, orders, tradeIns, bulkQuotes, wholesaleApplications } from "./db/schema";
import { isAdminUser } from "./admin";
import {
  sendEmail, orderShippedEmail, tradeInStatusEmail, wholesaleDecisionEmail,
} from "./email";
import type { OrderSnapshot } from "./orders";

/**
 * Back-office actions. Every one re-checks admin access server-side — the UI
 * gate on /admin is convenience, not security.
 */

type Result = { ok: boolean; error?: string };

const deny: Result = { ok: false, error: "Not authorized." };

/** Mark an order shipped with the real carrier + tracking number and email the buyer. */
export async function shipOrderAction(input: {
  orderId: string;
  carrier: string;
  trackingNumber: string;
}): Promise<Result> {
  if (!(await isAdminUser())) return deny;
  const carrier = input.carrier?.trim();
  const trackingNumber = input.trackingNumber?.trim();
  if (!carrier || !trackingNumber) return { ok: false, error: "Carrier and tracking number are required." };

  const db = getDb();
  const rows = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, error: "Order not found." };

  const snap = { ...(order.data as OrderSnapshot), carrier, trackingNumber };
  await db.update(orders).set({ status: "Shipped", data: snap }).where(eq(orders.id, order.id));

  if (order.email) {
    const tpl = orderShippedEmail({
      id: order.id,
      carrier,
      trackingNumber,
      deliveryEta: snap.deliveryEta,
    });
    await sendEmail({ to: order.email, ...tpl });
  }
  revalidatePath("/admin");
  return { ok: true };
}

const TRADE_IN_STATUSES = ["Submitted", "Received", "Inspected", "Requoted", "Paid", "Returned", "Cancelled"] as const;
export type TradeInStatus = (typeof TRADE_IN_STATUSES)[number];

/** Advance a trade-in through its lifecycle and email the seller the update. */
export async function updateTradeInStatusAction(input: {
  id: string;
  status: TradeInStatus;
  note?: string;
}): Promise<Result> {
  if (!(await isAdminUser())) return deny;
  if (!TRADE_IN_STATUSES.includes(input.status)) return { ok: false, error: "Unknown status." };

  const db = getDb();
  const rows = await db.select().from(tradeIns).where(eq(tradeIns.id, input.id)).limit(1);
  const t = rows[0];
  if (!t) return { ok: false, error: "Trade-in not found." };

  await db.update(tradeIns).set({ status: input.status }).where(eq(tradeIns.id, t.id));

  const tpl = tradeInStatusEmail({
    id: t.id,
    firstName: t.firstName,
    status: input.status,
    total: t.total,
    note: input.note?.trim() || undefined,
  });
  await sendEmail({ to: t.email, ...tpl });
  revalidatePath("/admin");
  return { ok: true };
}

/** Approve / reject a wholesale application; approval unlocks the portal. */
export async function decideWholesaleAction(input: {
  applicationId: string;
  approve: boolean;
}): Promise<Result> {
  if (!(await isAdminUser())) return deny;

  const db = getDb();
  const rows = await db
    .select()
    .from(wholesaleApplications)
    .where(eq(wholesaleApplications.id, input.applicationId))
    .limit(1);
  const app = rows[0];
  if (!app) return { ok: false, error: "Application not found." };

  await db
    .update(wholesaleApplications)
    .set({ status: input.approve ? "Approved" : "Rejected", decidedAt: new Date() })
    .where(eq(wholesaleApplications.id, app.id));

  if (input.approve) {
    await db
      .update(users)
      .set({ wholesaleApproved: true, wholesaleCompany: app.company })
      .where(eq(users.id, app.userId));
  }

  const tpl = wholesaleDecisionEmail({ name: app.name, company: app.company, approved: input.approve });
  await sendEmail({ to: app.email, ...tpl });
  revalidatePath("/admin");
  return { ok: true };
}

/** Mark a bulk quote request handled. */
export async function closeBulkQuoteAction(input: { id: string; status: "Quoted" | "Closed" }): Promise<Result> {
  if (!(await isAdminUser())) return deny;
  const db = getDb();
  await db.update(bulkQuotes).set({ status: input.status }).where(eq(bulkQuotes.id, input.id));
  revalidatePath("/admin");
  return { ok: true };
}
