import { desc, eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { orders } from "./db/schema";
import type { GradeId } from "./grades";

export interface OrderLine {
  name: string;
  qty: number;
  gb: number;
  colorName: string;
  mode: "retail" | "wholesale";
  unit: number;
  slug?: string;
  colorHex?: string;
  grade?: GradeId;
  original?: number;
}

export interface OrderSnapshot {
  lines: OrderLine[];
  dateLabel?: string;
  email?: string;
  shipTo?: string;
  deliveryLabel?: string;
  deliveryEta?: string;
  paymentLabel?: string;
  subtotal?: number;
  savings?: number;
  tax?: number;
  co2kg?: number;
}

export interface FullOrder extends OrderSnapshot {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

function toFull(o: typeof orders.$inferSelect): FullOrder {
  return {
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    ...(o.data as OrderSnapshot),
  };
}

/** Orders belonging to the signed-in user (DB-backed). */
export async function getMyOrders(): Promise<FullOrder[]> {
  if (!isAuthConfigured()) return [];
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return rows.map(toFull);
}

/** A single order by id (used by the receipt page). */
export async function getOrder(id: string): Promise<FullOrder | null> {
  if (!isAuthConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ? toFull(rows[0]) : null;
}
