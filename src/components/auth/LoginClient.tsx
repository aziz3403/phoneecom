"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { User, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, signUpAction, googleSignInAction } from "@/lib/auth-actions";

export function LoginClient({
  googleEnabled,
  callbackUrl,
  initialError = "",
}: {
  googleEnabled: boolean;
  callbackUrl: string;
  initialError?: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(initialError);
  const [pending, start] = useTransition();

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const valid =
    mode === "login"
      ? emailOk && password.length > 0
      : name.trim().length > 0 && emailOk && password.length >= 6;

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    setError("");
    start(async () => {
      const res =
        mode === "login"
          ? await loginAction(email, password, callbackUrl)
          : await signUpAction(name, email, password, callbackUrl);
      // On success the action redirects; only failures return here.
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
    });
  }

  function google() {
    if (pending) return;
    start(async () => {
      await googleSignInAction(callbackUrl);
    });
  }

  const seg: React.CSSProperties = {
    flex: 1,
    padding: "9px 0",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    background: "none",
    cursor: "pointer",
    borderRadius: 9,
    color: "var(--text2)",
  };
  const segOn: React.CSSProperties = {
    background: "#fff",
    color: "var(--text)",
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
  };

  return (
    <div className="scard-bord" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "var(--accent)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          marginBottom: 20,
        }}
      >
        <User className="h-6 w-6" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>
        {mode === "login" ? "Sign in to reMint" : "Create your account"}
      </h2>
      <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
        {mode === "login"
          ? "Welcome back — track orders, save addresses and check out faster."
          : "Join reMint to track orders, save addresses and check out faster."}
      </p>

      <div
        role="tablist"
        style={{ display: "flex", gap: 4, background: "var(--gray)", borderRadius: 11, padding: 4, margin: "20px 0 18px" }}
      >
        <button role="tab" aria-selected={mode === "login"} style={{ ...seg, ...(mode === "login" ? segOn : null) }} onClick={() => switchMode("login")}>
          Sign in
        </button>
        <button role="tab" aria-selected={mode === "signup"} style={{ ...seg, ...(mode === "signup" ? segOn : null) }} onClick={() => switchMode("signup")}>
          Create account
        </button>
      </div>

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={google}
            disabled={pending}
            className="btn btn-lt"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <GoogleGlyph /> Continue with Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12, color: "var(--text3)" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>
        </>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && (
          <div className="field">
            <input className="inpt" aria-label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
          </div>
        )}
        <div className="field">
          <input className="inpt" type="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" />
        </div>
        <div className="field" style={{ position: "relative" }}>
          <input
            className="inpt"
            type={show ? "text" : "password"}
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Create a password (6+ characters)" : "Password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "grid", placeItems: "center", padding: 6 }}
          >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: -4 }}>
            <Link className="link" href="/reset" style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 13, color: "#b42318", background: "#fef3f2", border: "1px solid #fecdc9", borderRadius: 10, padding: "9px 12px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!valid || pending}
          className="btn"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: valid && !pending ? 1 : 0.5, cursor: valid && !pending ? "pointer" : "not-allowed" }}
        >
          {pending && <Loader2 className="h-[18px] w-[18px] animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "var(--text2)" }}>
        {mode === "login" ? "New to reMint? " : "Already have an account? "}
        <button type="button" className="link" style={{ fontSize: 14 }} onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
