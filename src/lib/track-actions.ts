"use server";

import { and, eq } from "drizzle-orm";
import { isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders, tradeIns } from "./db/schema";
import { emailError } from "./validate";
import { rateLimit, callerIp } from "./rate-limit";
import type { OrderSnapshot } from "./orders";

/**
 * Guest lookup: find an order (RM-XXXXXX) or trade-in (TI-XXXXXX) by
 * reference + the email it was placed with. Returns only what the customer
 * needs to see — no payout details, no full address — and requires BOTH
 * values to match, so a reference alone leaks nothing.
 */

export interface TrackResult {
  kind: "order" | "tradeIn";
  id: string;
  status: string;
  createdAt: string;
  total: number;
  summary: string;
  carrier?: string;
  trackingNumber?: string;
  deliveryEta?: string;
}

export async function trackLookupAction(input: {
  reference: string;
  email: string;
}): Promise<{ result?: TrackResult; error?: string; demo?: boolean }> {
  const ref = input.reference?.trim().toUpperCase() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const emailProblem = emailError(email);
  if (emailProblem) return { error: emailProblem };
  if (!/^(RM|TI)-\d{6}$/.test(ref)) {
    return { error: "References look like RM-123456 (orders) or TI-123456 (trade-ins) — check your confirmation email." };
  }
  if (!rateLimit(`track:${await callerIp()}`, 10, 10 * 60 * 1000)) {
    return { error: "Too many lookups — please wait a few minutes." };
  }
  if (!isAuthConfigured()) return { demo: true, error: "Tracking lookups need the store backend, which isn't configured in this demo." };

  const db = getDb();
  if (ref.startsWith("RM-")) {
    const rows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, ref), eq(orders.email, email)))
      .limit(1);
    const o = rows[0];
    if (!o) return { error: "No match — check the reference and use the same email you ordered with." };
    const snap = o.data as OrderSnapshot;
    return {
      result: {
        kind: "order",
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        total: o.total,
        summary: (snap.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join(" · "),
        carrier: snap.carrier,
        trackingNumber: snap.trackingNumber,
        deliveryEta: snap.deliveryEta,
      },
    };
  }

  const rows = await db
    .select()
    .from(tradeIns)
    .where(and(eq(tradeIns.id, ref), eq(tradeIns.email, email)))
    .limit(1);
  const t = rows[0];
  if (!t) return { error: "No match — check the reference and use the same email you submitted with." };
  const data = t.data as { lines?: Array<{ qty: number; name: string }> };
  return {
    result: {
      kind: "tradeIn",
      id: t.id,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      total: t.total,
      summary: (data.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join(" · "),
    },
  };
}
