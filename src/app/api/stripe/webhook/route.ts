import { eq } from "drizzle-orm";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { isAuthConfigured } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";

// Stripe needs the raw request body for signature verification, so this must
// run on the Node runtime (the default for route handlers).
export const runtime = "nodejs";

/**
 * Stripe webhook — the source of truth for fulfilment. On a paid
 * `checkout.session.completed` we flip the matching order from Pending to
 * Confirmed. Requires STRIPE_WEBHOOK_SECRET (set it from the Stripe dashboard
 * after adding this endpoint).
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return new Response("Stripe webhook not configured", { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; payment_status?: string };
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid" && isAuthConfigured()) {
      try {
        const db = getDb();
        await db.update(orders).set({ status: "Confirmed" }).where(eq(orders.id, orderId));
      } catch {
        /* ignore — success page also re-verifies */
      }
    }
  }

  return new Response("ok", { status: 200 });
}
