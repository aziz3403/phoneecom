import Link from "next/link";
import { KeyRound } from "lucide-react";

/** Shown on auth pages when the backend env vars aren't set yet. */
export function AuthNotConfigured() {
  return (
    <div className="scard-bord" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "#f1f7f3",
          color: "var(--accent)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 18px",
        }}
      >
        <KeyRound className="h-6 w-6" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Accounts aren&apos;t set up yet</h2>
      <p style={{ fontSize: 14.5, color: "var(--text2)", marginTop: 8, lineHeight: 1.55 }}>
        Sign-in needs a database and a session secret. Set <code>AUTH_SECRET</code> and{" "}
        <code>DATABASE_URL</code> (plus Google OAuth keys, optionally) in your environment, then run
        the database migration. See <code>SETUP.md</code> in the repo for the exact steps.
      </p>
      <div style={{ marginTop: 20 }}>
        <Link className="btn" href="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
