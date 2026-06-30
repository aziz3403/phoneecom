"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { verifyEmailAction } from "@/lib/verify-actions";

type Status = "verifying" | "ok" | "error";

export function VerifyClient({ token }: { token?: string }) {
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    // Guard against React 18/19 double-invoke in dev — the token is one-shot.
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      setError("This verification link is missing its token.");
      return;
    }
    (async () => {
      const res = await verifyEmailAction(token);
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("error");
        setError(res.error ?? "We couldn't verify your email.");
      }
    })();
  }, [token]);

  return (
    <div className="scard-bord" style={{ maxWidth: 430, margin: "0 auto" }}>
      {status === "verifying" && (
        <>
          <div style={iconWrap("var(--accent)")}>
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h2 style={titleStyle}>Verifying your email…</h2>
          <p style={subStyle}>Hang tight, this only takes a second.</p>
        </>
      )}

      {status === "ok" && (
        <>
          <div style={iconWrap("var(--accent)")}>
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 style={titleStyle}>Email confirmed</h2>
          <p style={subStyle}>
            Thanks — your email address is verified and your account is fully secured.
          </p>
          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn" href="/account">
              Go to your account
            </Link>
            <Link className="btn btn-lt" href="/shop">
              Continue shopping
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div style={iconWrap("#b42318")}>
            <MailWarning className="h-6 w-6" />
          </div>
          <h2 style={titleStyle}>Couldn&apos;t verify that link</h2>
          <p style={subStyle}>{error}</p>
          <p style={{ ...subStyle, marginTop: 12 }}>
            Verification links expire after 24 hours. You can send a fresh one from your account.
          </p>
          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn" href="/account">
              Go to your account
            </Link>
            <Link className="btn btn-lt" href="/login">
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const titleStyle: React.CSSProperties = { fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", textAlign: "center" };
const subStyle: React.CSSProperties = { fontSize: 14.5, color: "var(--text2)", marginTop: 8, lineHeight: 1.55, textAlign: "center" };
function iconWrap(bg: string): React.CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: bg,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 20px",
  };
}
