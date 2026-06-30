"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import { isStripeConfigured, getStripe } from "./stripe";
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
  amountCents: number;
  itemCount: number;
  snapshot: OrderSnapshot;
}

/**
 * Persist the order as "Pending" and open a Stripe Checkout session. Returns the
 * hosted-checkout URL for the client to redirect to. Apple Pay / Google Pay are
 * offered automatically by Stripe Checkout. Payment is confirmed afterwards by
 * the webhook (and re-verified on the success page).
 */
export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<{ url?: string; error?: string }> {
  if (!isStripeConfigured()) return { error: "Card payments aren't set up yet." };
  if (input.amountCents < 50) return { error: "Order total is too low for card payment." };

  // Best-effort persist (Pending) so the webhook / success page can confirm it.
  if (isAuthConfigured()) {
    try {
      const session = await auth();
      const db = getDb();
      await db.insert(orders).values({
        id: input.id,
        userId: session?.user?.id ?? null,
        email: input.email?.trim().toLowerCase(),
        total: Math.round(input.amountCents / 100),
        status: "Pending",
        data: input.snapshot,
      });
    } catch {
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
            unit_amount: input.amountCents,
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
    return { url: checkout.url ?? undefined };
  } catch {
    return { error: "Couldn't start secure checkout. Please try again." };
  }
}

/**
 * Re-verify a returned Checkout session was actually paid and mark the order
 * Confirmed. Safe to call from the success page (defence in depth alongside the
 * webhook). Returns true when the session is paid and matches the order.
 */
export async function confirmCheckout(orderId: string, sessionId: string): Promise<boolean> {
  if (!isStripeConfigured() || !sessionId) return false;
  try {
    const stripe = getStripe();
    const sess = await stripe.checkout.sessions.retrieve(sessionId);
    if (sess.payment_status !== "paid" || sess.metadata?.orderId !== orderId) return false;
    if (isAuthConfigured()) {
      const db = getDb();
      await db.update(orders).set({ status: "Confirmed" }).where(eq(orders.id, orderId));
    }
    return true;
  } catch {
    return false;
  }
}
