"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { signIn, signOut } from "./auth";
import { getDb } from "./db";
import { users, passwordResetTokens } from "./db/schema";

/**
 * On success, Auth.js `signIn` throws a Next.js redirect (digest "NEXT_REDIRECT")
 * which must propagate. Any other throw (e.g. CredentialsSignin) is a real
 * failure — `instanceof AuthError` is unreliable across the bundled runtime, so
 * we detect the redirect by its digest instead.
 */
function isRedirect(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest?: unknown }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** demo-only: surfaced reset link when no email provider is configured */
  devLink?: string;
}

const EMAIL_RE = /\S+@\S+\.\S+/;

async function origin(): Promise<string> {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function randomToken(): string {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
}

/** Create an account, then sign the new user in. */
export async function signUpAction(
  name: string,
  email: string,
  password: string,
  callbackUrl?: string,
): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const db = getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, cleanEmail)).limit(1);
  if (existing.length) {
    return { ok: false, error: "An account with this email already exists — try signing in." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name: name.trim(), email: cleanEmail, passwordHash });

  try {
    await signIn("credentials", { email: cleanEmail, password, redirectTo: callbackUrl || "/account" });
  } catch (e) {
    if (isRedirect(e)) throw e; // success
    return { ok: false, error: "Account created — please sign in." };
  }
  return { ok: true };
}

/** Sign in with email + password. */
export async function loginAction(
  email: string,
  password: string,
  callbackUrl?: string,
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: callbackUrl || "/account",
    });
  } catch (e) {
    if (isRedirect(e)) throw e; // success
    return { ok: false, error: "Incorrect email or password." };
  }
  return { ok: true };
}

/** Start the Google OAuth flow. */
export async function googleSignInAction(callbackUrl?: string): Promise<void> {
  await signIn("google", { redirectTo: callbackUrl || "/account" });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/** Issue a password-reset token; email it if a provider is set, else return the link (demo). */
export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: "Enter a valid email address." };

  const db = getDb();
  const rows = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);
  const user = rows[0];

  // Only credentials accounts have a password to reset. Always return ok so we
  // don't reveal whether an email is registered.
  if (!user?.passwordHash) return { ok: true };

  const token = randomToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db.insert(passwordResetTokens).values({ userId: user.id, token, expires });

  const link = `${await origin()}/reset?token=${token}`;

  if (process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.AUTH_EMAIL_FROM,
          to: cleanEmail,
          subject: "Reset your reMint password",
          html: `<p>Tap the link below to choose a new password. It expires in 1 hour.</p><p><a href="${link}">Reset my password</a></p>`,
        }),
      });
    } catch {
      // fall through — surface the link as a demo fallback
      return { ok: true, devLink: link };
    }
    return { ok: true };
  }

  // No email provider configured → demo fallback shows the link in the UI.
  return { ok: true, devLink: link };
}

/** Consume a reset token and set a new password. */
export async function resetPasswordAction(token: string, password: string): Promise<ActionResult> {
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  const db = getDb();
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);
  const row = rows[0];
  if (!row || row.expires < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, row.id));
  return { ok: true };
}
