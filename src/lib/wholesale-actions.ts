"use server";

import { eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { users } from "./db/schema";

/** Approve the signed-in user's wholesale trade account (demo: instant). */
export async function approveWholesaleAction(
  company: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isAuthConfigured()) return { ok: false, error: "unconfigured" };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "signin" };

  const db = getDb();
  await db
    .update(users)
    .set({ wholesaleApproved: true, wholesaleCompany: company.trim() || null })
    .where(eq(users.id, userId));
  return { ok: true };
}
