import "server-only";
import { headers } from "next/headers";

/**
 * Small fixed-window in-memory rate limiter for server actions (sign-in
 * attempts, quote/application submissions…). Per-instance only — on serverless
 * each warm instance keeps its own counters, which still blunts brute-force
 * and spam without any infrastructure. Swap for Upstash/Redis if the site
 * ever runs hot enough to need a shared store.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

/** True when the caller is within `limit` hits per `windowMs` for this key. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // opportunistic cleanup so the map can't grow unbounded
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

/** Best-effort caller IP for rate-limit keys (proxy-aware). */
export async function callerIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
