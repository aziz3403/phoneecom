"use server";

import { headers } from "next/headers";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import { isStripeConfigured, getStripe } from "./stripe";
import { priceOrder, stockShortfalls } from "./order-pricing";
import { markOrderConfirmed } from "./order-confirm";
import { rateLimit, callerIp } from "./rate-limit";
import type { OrderSnapshot } from "./orders";

async function origin(): Promise<string> {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export interface CheckoutInput {
  id: string;
  email?: string;
  itemCount: number;
  snapshot: OrderSnapshot;
}

/**
 * Persist the order as "Pending" and open a Stripe Checkout session. The
 * amount charged is re-priced server-side from the catalog (never taken from
 * the client) and quantities are checked against live warehouse stock first.
 * Payment is confirmed afterwards by the webhook (and re-verified on the
 * success page). Apple Pay / Google Pay are offered automatically by Stripe.
 */
export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<{ url?: string; error?: string; total?: number }> {
  if (!isStripeConfigured()) return { error: "Card payments aren't set up yet." };
  if (!rateLimit(`checkout:${await callerIp()}`, 10, 10 * 60 * 1000)) {
    return { error: "Too many checkout attempts — please wait a few minutes." };
  }
  if (!/^RM-\d{6}$/.test(input.id)) return { error: "Invalid order reference." };

  const priced = priceOrder(input.snapshot.lines ?? [], Boolean(input.snapshot.express));
  if (!priced) return { error: "Your bag contains an item we no longer sell — please refresh it." };
  if (priced.total < 1) return { error: "Order total is too low for card payment." };

  const short = await stockShortfalls(priced.lines);
  if (short.length > 0) {
    return { error: `Not enough stock for: ${short.join(", ")}. Please adjust quantities.` };
  }

  // The snapshot keeps the client's labels but all money fields are replaced
  // with the server-derived numbers.
  const snapshot: OrderSnapshot = {
    ...input.snapshot,
    lines: priced.lines,
    subtotal: priced.subtotal,
    tax: priced.tax,
  };

  // Best-effort persist (Pending) so the webhook / success page can confirm it.
  if (isAuthConfigured()) {
    try {
      const session = await auth();
      const db = getDb();
      await db.insert(orders).values({
        id: input.id,
        userId: session?.user?.id ?? null,
        email: input.email?.trim().toLowerCase(),
        total: priced.total,
        status: "Pending",
        data: snapshot,
      });
    } catch (err) {
      console.error("[checkout] failed to persist pending order", input.id, err);
      /* receipt still renders from the client copy */
    }
  }

  try {
    const stripe = getStripe();
    const base = await origin();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priced.total * 100,
            product_data: {
              name: `reMint order ${input.id}`,
              description: `${input.itemCount} item${input.itemCount === 1 ? "" : "s"} · certified pre-owned`,
            },
          },
        },
      ],
      customer_email: input.email || undefined,
      metadata: { orderId: input.id },
      payment_intent_data: { metadata: { orderId: input.id } },
      success_url: `${base}/order-confirmed/${input.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/cart`,
    });
    return { url: checkout.url ?? undefined, total: priced.total };
  } catch (err) {
    console.error("[checkout] failed to create Stripe session", input.id, err);
    return { error: "Couldn't start secure checkout. Please try again." };
  }
}

/**
 * Re-verify a returned Checkout session was actually paid and mark the order
 * Confirmed. Safe to call from the success page (defence in depth alongside
 * the webhook). Returns true when the session is paid and matches the order.
 */
export async function confirmCheckout(orderId: string, sessionId: string): Promise<boolean> {
  if (!isStripeConfigured() || !sessionId) return false;
  try {
    const stripe = getStripe();
    const sess = await stripe.checkout.sessions.retrieve(sessionId);
    if (sess.payment_status !== "paid" || sess.metadata?.orderId !== orderId) return false;
    if (isAuthConfigured()) {
      try {
        await markOrderConfirmed(orderId);
      } catch (err) {
        console.error("[checkout] confirm failed", orderId, err);
      }
    }
    return true;
  } catch (err) {
    console.error("[checkout] session verify failed", orderId, err);
    return false;
  }
}
