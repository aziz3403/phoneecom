import "server-only";
import { and, eq } from "drizzle-orm";
import { isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import { sendEmail, orderConfirmationEmail, notifyOwner } from "./email";
import { formatPrice } from "./utils";
import type { OrderSnapshot } from "./orders";

/**
 * Flip an order Pending → Confirmed and send the confirmation email exactly
 * once. The guarded update (status must still be Pending) means the Stripe
 * webhook and the success-page re-verify can race safely without double
 * emails. Deliberately NOT a server action — only trusted server code
 * (webhook, verified-checkout path) may confirm an order.
 */
export async function markOrderConfirmed(orderId: string): Promise<void> {
  if (!isAuthConfigured()) return;
  const db = getDb();
  const updated = await db
    .update(orders)
    .set({ status: "Confirmed" })
    .where(and(eq(orders.id, orderId), eq(orders.status, "Pending")))
    .returning();
  const order = updated[0];
  if (!order) return; // already confirmed (or unknown) — email already handled
  const snap = order.data as OrderSnapshot;
  if (order.email) {
    const tpl = orderConfirmationEmail({
      id: order.id,
      lines: snap.lines ?? [],
      total: order.total,
      shipTo: snap.shipTo,
      deliveryEta: snap.deliveryEta,
    });
    await sendEmail({ to: order.email, ...tpl });
  }
  await notifyOwner(
    `New paid order ${order.id} — ${formatPrice(order.total)}`,
    `<p>${(snap.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join("<br/>")}</p><p>Ship to:<br/>${(snap.shipTo ?? "").replace(/\n/g, "<br/>")}</p>`,
  );
}
