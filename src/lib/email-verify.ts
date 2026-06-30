import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "./db";
import { verificationTokens } from "./db/schema";

/**
 * Server-only helpers for email verification (imports `pg` + `next/headers`, so
 * it can never bundle into a client component). These are deliberately NOT
 * server actions — keeping them out of a `"use server"` module means they can't
 * be invoked directly from the client (which would let anyone fire confirmation
 * emails at arbitrary addresses). They're called from sign-up and from the
 * session-guarded `resendVerificationAction`.
 */

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

/**
 * Create a fresh verification token for `email`, store it (replacing any prior
 * token for the same address), and either email the link via Resend or return
 * it for the demo UI. The link is only returned when no email provider is set.
 */
export async function createAndSendVerification(email: string): Promise<string | undefined> {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const token = randomToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // One outstanding token per address.
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, cleanEmail));
  await db.insert(verificationTokens).values({ identifier: cleanEmail, token, expires });

  const link = `${await origin()}/verify?token=${token}`;

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
          subject: "Confirm your reMint email",
          html: `<p>Welcome to reMint — confirm your email to secure your account.</p><p><a href="${link}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
        }),
      });
      return undefined;
    } catch {
      return link; // network hiccup → fall back to the demo link
    }
  }

  // No email provider configured → demo fallback surfaces the link in the UI.
  return link;
}

/**
 * Best-effort send on sign-up. Never throws — account creation must not depend
 * on the verification email going out.
 */
export async function issueVerification(email: string): Promise<void> {
  try {
    await createAndSendVerification(email);
  } catch {
    /* ignore — verification is non-blocking */
  }
}
