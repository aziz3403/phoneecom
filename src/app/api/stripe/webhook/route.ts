import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { isAuthConfigured } from "@/lib/auth";
import { markOrderConfirmed } from "@/lib/order-confirm";

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
        await markOrderConfirmed(orderId);
      } catch (err) {
        // Surface in logs but still 200 — the success page re-verifies, and a
        // 5xx would make Stripe retry against the same broken DB.
        console.error("[stripe-webhook] failed to confirm order", orderId, err);
      }
    }
  }

  return new Response("ok", { status: 200 });
}
