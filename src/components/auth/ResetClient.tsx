"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import { requestPasswordResetAction, resetPasswordAction } from "@/lib/auth-actions";

export function ResetClient({ token }: { token?: string }) {
  return (
    <div className="scard-bord" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", marginBottom: 20 }}>
        <KeyRound className="h-6 w-6" />
      </div>
      {token ? <SetNewPassword token={token} /> : <RequestReset />}
    </div>
  );
}

function RequestReset() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | undefined>();
  const [pending, start] = useTransition();
  const valid = /\S+@\S+\.\S+/.test(email);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    setError("");
    start(async () => {
      const res = await requestPasswordResetAction(email);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else {
        setSent(true);
        setDevLink(res.devLink);
      }
    });
  }

  if (sent) {
    return (
      <>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Check your inbox</h2>
        <p style={{ fontSize: 14.5, color: "var(--text2)", marginTop: 8, lineHeight: 1.55 }}>
          If an account exists for <b>{email}</b>, we&apos;ve sent a link to reset your password. It
          expires in one hour.
        </p>
        {devLink && (
          <div className="note2" style={{ marginTop: 16, fontSize: 13 }}>
            <span>
              Demo (no email provider configured) — use this link:{" "}
              <Link className="link" href={devLink} style={{ fontSize: 13 }}>
                Reset password
              </Link>
            </span>
          </div>
        )}
        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link className="link" href="/login" style={{ fontSize: 14 }}>← Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Forgot your password?</h2>
      <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
        Enter your email and we&apos;ll send a link to reset it.
      </p>
      <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="field">
          <input className="inpt" type="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" />
        </div>
        {error && (
          <div role="alert" style={{ fontSize: 13, color: "#b42318", background: "#fef3f2", border: "1px solid #fecdc9", borderRadius: 10, padding: "9px 12px" }}>{error}</div>
        )}
        <button type="submit" disabled={!valid || pending} className="btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: valid && !pending ? 1 : 0.5, cursor: valid && !pending ? "pointer" : "not-allowed" }}>
          {pending && <Loader2 className="h-[18px] w-[18px] animate-spin" />} Send reset link
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        <Link className="link" href="/login" style={{ fontSize: 14 }}>← Back to sign in</Link>
      </p>
    </>
  );
}

function SetNewPassword({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const valid = password.length >= 6 && password === confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setError("");
    start(async () => {
      const res = await resetPasswordAction(token, password);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else setDone(true);
    });
  }

  if (done) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Password updated</h2>
        </div>
        <p style={{ fontSize: 14.5, color: "var(--text2)", marginTop: 8 }}>
          Your password has been changed. You can now sign in with your new password.
        </p>
        <div style={{ marginTop: 18 }}>
          <Link className="btn" href="/login">Sign in</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Choose a new password</h2>
      <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>Pick something at least 6 characters long.</p>
      <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="field">
          <input className="inpt" type="password" aria-label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
        </div>
        <div className="field">
          <input className="inpt" type="password" aria-label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password" />
        </div>
        {error && (
          <div role="alert" style={{ fontSize: 13, color: "#b42318", background: "#fef3f2", border: "1px solid #fecdc9", borderRadius: 10, padding: "9px 12px" }}>{error}</div>
        )}
        <button type="submit" disabled={!valid || pending} className="btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: valid && !pending ? 1 : 0.5, cursor: valid && !pending ? "pointer" : "not-allowed" }}>
          {pending && <Loader2 className="h-[18px] w-[18px] animate-spin" />} Update password
        </button>
      </form>
    </>
  );
}
