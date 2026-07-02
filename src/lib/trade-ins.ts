import "server-only";
import { desc, eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { tradeIns } from "./db/schema";

export interface MyTradeIn {
  id: string;
  status: string;
  createdAt: string;
  total: number;
  deviceCount: number;
  payoutMethod: string;
  summary: string;
}

/** Trade-ins belonging to the signed-in user (guest ones are claimed onto the
 * account at sign-in by the auth event, keyed by email). */
export async function getMyTradeIns(): Promise<MyTradeIn[]> {
  if (!isAuthConfigured()) return [];
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(tradeIns)
    .where(eq(tradeIns.userId, userId))
    .orderBy(desc(tradeIns.createdAt));
  return rows.map((t) => {
    const data = t.data as { lines?: Array<{ qty: number; name: string }> };
    return {
      id: t.id,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      total: t.total,
      deviceCount: t.deviceCount,
      payoutMethod: t.payoutMethod,
      summary: (data.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join(" · "),
    };
  });
}
