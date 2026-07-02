import "server-only";
import { desc, eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import {
  users, orders, tradeIns, bulkQuotes, wholesaleApplications,
  type DbTradeIn, type DbBulkQuote, type DbWholesaleApplication,
} from "./db/schema";
import type { FullOrder, OrderSnapshot } from "./orders";

/**
 * Owner/back-office access. A user is an admin when their row has isAdmin, or
 * their email is listed in ADMIN_EMAILS (comma-separated) — the env var lets
 * the owner bootstrap the first admin without touching SQL.
 */
export async function isAdminUser(): Promise<boolean> {
  if (!isAuthConfigured()) return false;
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const id = session?.user?.id;
  if (!email || !id) return false;

  const envList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envList.includes(email)) return true;

  try {
    const db = getDb();
    const rows = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, id)).limit(1);
    return Boolean(rows[0]?.isAdmin);
  } catch {
    return false;
  }
}

/* ------------------------------ admin listings ------------------------------ */

export async function adminOrders(limit = 100): Promise<FullOrder[]> {
  const db = getDb();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  return rows.map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    email: o.email ?? undefined,
    ...(o.data as OrderSnapshot),
  }));
}

export interface AdminTradeIn extends Omit<DbTradeIn, "createdAt" | "data"> {
  createdAt: string;
  lines: Array<{ name: string; gb: number; color: string; grade: string; qty: number; unit: number }>;
  freeShip: boolean;
}

export async function adminTradeIns(limit = 100): Promise<AdminTradeIn[]> {
  const db = getDb();
  const rows = await db.select().from(tradeIns).orderBy(desc(tradeIns.createdAt)).limit(limit);
  return rows.map((t) => {
    const data = t.data as { lines?: AdminTradeIn["lines"]; freeShip?: boolean };
    return {
      ...t,
      createdAt: t.createdAt.toISOString(),
      lines: data.lines ?? [],
      freeShip: Boolean(data.freeShip),
    };
  });
}

export interface AdminBulkQuote extends Omit<DbBulkQuote, "createdAt"> {
  createdAt: string;
}

export async function adminBulkQuotes(limit = 100): Promise<AdminBulkQuote[]> {
  const db = getDb();
  const rows = await db.select().from(bulkQuotes).orderBy(desc(bulkQuotes.createdAt)).limit(limit);
  return rows.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() }));
}

export interface AdminApplication extends Omit<DbWholesaleApplication, "createdAt" | "decidedAt"> {
  createdAt: string;
  decidedAt: string | null;
}

export async function adminApplications(limit = 100): Promise<AdminApplication[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(wholesaleApplications)
    .orderBy(desc(wholesaleApplications.createdAt))
    .limit(limit);
  return rows.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    decidedAt: a.decidedAt?.toISOString() ?? null,
  }));
}
