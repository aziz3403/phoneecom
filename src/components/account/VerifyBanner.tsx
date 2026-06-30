"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailWarning, CheckCircle2, Loader2 } from "lucide-react";
import { resendVerificationAction } from "@/lib/verify-actions";

/**
 * Soft, non-blocking nudge shown on the account page when a credentials user
 * hasn't confirmed their email yet. Resends the confirmation link (or surfaces
 * a demo link when no email provider is configured).
 */
export function VerifyBanner() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [devLink, setDevLink] = useState<string | undefined>();
  const [error, setError] = useState("");

  function resend() {
    if (pending) return;
    setError("");
    start(async () => {
      const res = await resendVerificationAction();
      if (!res.ok) {
        setError(res.error ?? "Couldn't send right now — please try again.");
        return;
      }
      if (res.alreadyVerified) {
        setVerified(true);
        return;
      }
      setSent(true);
      setDevLink(res.devLink);
    });
  }

  if (verified) {
    return (
      <div className="note2" style={{ borderColor: "rgba(10,143,110,.4)" }}>
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
        <span>
          <b>Your email is already verified.</b> You&apos;re all set.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "#fffaf0",
        border: "1px solid #f4dca5",
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <MailWarning className="h-5 w-5 shrink-0" style={{ color: "#b7791f", marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {sent ? (
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
            <b>Confirmation sent.</b> Check your inbox for a link to verify your email.
            {devLink && (
              <>
                {" "}
                Demo (no email provider configured) — use this link:{" "}
                <Link className="link" href={devLink} style={{ fontSize: 14 }}>
                  Verify my email
                </Link>
              </>
            )}
          </p>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Verify your email</p>
            <p style={{ fontSize: 13.5, color: "var(--text2)", marginTop: 2, lineHeight: 1.5 }}>
              Confirm your email address to secure your account and receive order updates.
            </p>
            {error && (
              <p role="alert" style={{ fontSize: 13, color: "#b42318", marginTop: 6 }}>
                {error}
              </p>
            )}
            <button
              onClick={resend}
              disabled={pending}
              className="chip"
              style={{ marginTop: 10, cursor: pending ? "wait" : "pointer" }}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Sending…" : "Resend verification email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
