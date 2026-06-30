"use server";

import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import type { OrderSnapshot } from "./orders";

/**
 * Persist an order for the signed-in user. Guests (or an unconfigured demo)
 * are a no-op here — the client keeps a local copy for the receipt page.
 */
export async function placeOrderAction(input: {
  id: string;
  total: number;
  status: string;
  email?: string;
  data: OrderSnapshot;
}): Promise<{ ok: boolean }> {
  if (!isAuthConfigured()) return { ok: false };
  const session = await auth();
  // Persist for signed-in users AND guests. Guest orders (userId null) are
  // keyed by email so they can be claimed when that person signs in later.
  const db = getDb();
  await db.insert(orders).values({
    id: input.id,
    userId: session?.user?.id ?? null,
    email: input.email?.trim().toLowerCase(),
    total: input.total,
    status: input.status,
    data: input.data,
  });
  return { ok: true };
}
