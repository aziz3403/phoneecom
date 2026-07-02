"use server";

import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import { priceOrder } from "./order-pricing";
import { sendEmail, orderConfirmationEmail, notifyOwner } from "./email";
import { formatPrice } from "./utils";
import { rateLimit, callerIp } from "./rate-limit";
import { emailError } from "./validate";
import type { OrderSnapshot } from "./orders";

/**
 * Persist an order placed through the demo (non-Stripe) checkout. Money fields
 * are re-derived server-side from the catalog — the client's numbers are never
 * stored. Guests (or an unconfigured demo) are a no-op here — the client keeps
 * a local copy for the receipt page.
 */
export async function placeOrderAction(input: {
  id: string;
  email?: string;
  data: OrderSnapshot;
}): Promise<{ ok: boolean }> {
  if (!isAuthConfigured()) return { ok: false };
  if (!/^RM-\d{6}$/.test(input.id)) return { ok: false };
  if (emailError(input.email ?? "") || (input.data.shipTo ?? "").trim().length < 12) return { ok: false };
  if (!rateLimit(`order:${await callerIp()}`, 10, 10 * 60 * 1000)) return { ok: false };

  const priced = priceOrder(input.data.lines ?? [], Boolean(input.data.express));
  if (!priced) return { ok: false };
  const total = priced.total;
  const snapshot: OrderSnapshot = {
    ...input.data,
    lines: priced.lines,
    subtotal: priced.subtotal,
    tax: priced.tax,
  };
  const email = input.email?.trim().toLowerCase();

  const session = await auth();
  // Persist for signed-in users AND guests. Guest orders (userId null) are
  // keyed by email so they can be claimed when that person signs in later.
  const db = getDb();
  await db.insert(orders).values({
    id: input.id,
    userId: session?.user?.id ?? null,
    email,
    total,
    status: "Confirmed",
    data: snapshot,
  });

  if (email) {
    const tpl = orderConfirmationEmail({
      id: input.id,
      lines: snapshot.lines ?? [],
      total,
      shipTo: snapshot.shipTo,
      deliveryEta: snapshot.deliveryEta,
    });
    await sendEmail({ to: email, ...tpl });
  }
  await notifyOwner(
    `New order ${input.id} — ${formatPrice(total)} (demo checkout)`,
    `<p>${(snapshot.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join("<br/>")}</p><p>Ship to:<br/>${(snapshot.shipTo ?? "").replace(/\n/g, "<br/>")}</p>`,
  );
  return { ok: true };
}
