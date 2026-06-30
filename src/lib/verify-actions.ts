"use server";

import { and, eq } from "drizzle-orm";
import { auth, isAuthConfigured } from "./auth";
import { getDb } from "./db";
import { users, verificationTokens } from "./db/schema";
import { createAndSendVerification } from "./email-verify";

export interface VerifyResult {
  ok: boolean;
  error?: string;
  /** demo-only: surfaced verification link when no email provider is configured */
  devLink?: string;
  /** the email was already confirmed — nothing to do */
  alreadyVerified?: boolean;
}

/** Resend from the account banner (uses the signed-in user's email). */
export async function resendVerificationAction(): Promise<VerifyResult> {
  if (!isAuthConfigured()) return { ok: false, error: "Accounts aren't configured." };
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, error: "Please sign in first." };
  try {
    const db = getDb();
    const rows = await db
      .select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    if (rows[0]?.emailVerified) return { ok: true, alreadyVerified: true };
    const devLink = await createAndSendVerification(email);
    return { ok: true, devLink };
  } catch {
    return { ok: false, error: "Couldn't send the email just now — please try again." };
  }
}

/**
 * Whether the signed-in user's email is confirmed. OAuth-only accounts (no
 * password hash) are treated as verified — their provider vouched for the
 * address. Fails safe to `true` so a query hiccup never nags a real user.
 */
export async function isEmailVerified(): Promise<boolean> {
  if (!isAuthConfigured()) return true;
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return true;
    const db = getDb();
    const rows = await db
      .select({ emailVerified: users.emailVerified, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    const u = rows[0];
    if (!u) return true;
    if (u.emailVerified) return true;
    if (!u.passwordHash) return true; // OAuth-only account — provider verified it
    return false;
  } catch {
    return true;
  }
}

/** Consume a token from `/verify?token=` and mark the matching email verified. */
export async function verifyEmailAction(token: string): Promise<VerifyResult> {
  if (!isAuthConfigured()) return { ok: false, error: "Accounts aren't configured." };
  if (!token) return { ok: false, error: "Missing verification token." };
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);
    const row = rows[0];
    if (!row || row.expires < new Date()) {
      return { ok: false, error: "This verification link is invalid or has expired." };
    }
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, row.identifier));
    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, row.identifier), eq(verificationTokens.token, token)));
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong verifying your email." };
  }
}
