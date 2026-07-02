"use server";

import { and, desc, eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { wholesaleApplications } from "./db/schema";
import { notifyOwner } from "./email";
import { rateLimit, callerIp } from "./rate-limit";
import { emailError, nameError, requiredError } from "./validate";

export interface WholesaleApplyInput {
  company: string;
  name: string;
  email: string;
  volume?: string;
  businessType?: string;
  region?: string;
  message?: string;
}

/**
 * File a wholesale trade-account application for the signed-in user. Approval
 * is NOT self-serve — the application lands as Pending and the owner decides
 * in /admin (which flips users.wholesaleApproved and emails the applicant).
 */
export async function applyWholesaleAction(
  input: WholesaleApplyInput,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  if (!isAuthConfigured()) return { ok: false, error: "unconfigured" };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "signin" };

  const company = input.company?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const problem =
    requiredError(company, "Company") ?? nameError(name, "Your name") ?? emailError(email);
  if (problem) return { ok: false, error: problem };
  if (!rateLimit(`wholesale-apply:${await callerIp()}`, 3, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many applications — please wait a few minutes." };
  }

  const db = getDb();
  // One live application per account: re-use a pending one instead of stacking.
  const existing = await db
    .select()
    .from(wholesaleApplications)
    .where(and(eq(wholesaleApplications.userId, userId), eq(wholesaleApplications.status, "Pending")))
    .limit(1);
  if (existing[0]) return { ok: true, status: "Pending" };

  await db.insert(wholesaleApplications).values({
    userId,
    company,
    name,
    email,
    volume: input.volume?.trim() || null,
    businessType: input.businessType?.trim() || null,
    region: input.region?.trim() || null,
    message: input.message?.trim().slice(0, 2000) || null,
  });

  await notifyOwner(
    `New wholesale application — ${company}`,
    `<p>${name} · ${email}</p><p>Volume: ${input.volume ?? "—"} · Type: ${input.businessType ?? "—"} · Region: ${input.region ?? "—"}</p><p>${(input.message ?? "").replace(/\n/g, "<br/>")}</p><p>Review it in <b>/admin</b>.</p>`,
  );
  return { ok: true, status: "Pending" };
}

/** The signed-in user's latest application status (for the wholesale gate). */
export async function myWholesaleApplication(): Promise<{ status: string; company: string } | null> {
  if (!isAuthConfigured()) return null;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(wholesaleApplications)
    .where(eq(wholesaleApplications.userId, userId))
    .orderBy(desc(wholesaleApplications.createdAt))
    .limit(1);
  return rows[0] ? { status: rows[0].status, company: rows[0].company } : null;
}
