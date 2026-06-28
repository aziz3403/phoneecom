"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, MapPin, CreditCard, LogOut, User, CheckCircle2 } from "lucide-react";
import { useAccount } from "@/lib/account-store";
import { formatPrice, cn } from "@/lib/utils";

export function AccountClient() {
  const user = useAccount((s) => s.user);
  const orders = useAccount((s) => s.orders);
  const signIn = useAccount((s) => s.signIn);
  const signOut = useAccount((s) => s.signOut);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"orders" | "details">("orders");
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="scard" style={{ height: 288, animation: "pulse 1.6s ease-in-out infinite" }} />
    );
  }

  if (!user) {
    const valid = name.trim() && /\S+@\S+\.\S+/.test(email);
    return (
      <div className="scard-bord" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "var(--accent)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            marginBottom: 22,
          }}
        >
          <User className="h-6 w-6" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>Sign in to reMint</h2>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
          Track orders, save addresses and check out faster.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) signIn(name, email);
          }}
          style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div className="field">
            <input
              className="inpt"
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="field">
            <input
              className="inpt"
              type="email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>
          <button
            type="submit"
            disabled={!valid}
            className="btn"
            style={{ width: "100%", opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}
          >
            Continue
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--text3)" }}>
          Demo only — any name and email works, nothing is sent.
        </p>
      </div>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* profile */}
      <div
        className="scard-bord"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {initials || <User className="h-6 w-6" />}
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{user.name}</p>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>{user.email}</p>
          </div>
        </div>
        <button className="chip" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 9 }}>
        <button
          className={cn("chip", tab === "orders" && "on accent")}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
        <button
          className={cn("chip", tab === "details" && "on accent")}
          onClick={() => setTab("details")}
        >
          Details
        </button>
      </div>

      {tab === "orders" ? (
        <div className="scard-bord">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Package className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Order history</h3>
            <span style={{ fontSize: 14, color: "var(--text3)" }}>({orders.length})</span>
          </div>
          {orders.length === 0 ? (
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 16,
                padding: "48px 0",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text2)" }}>No orders yet.</p>
              <div style={{ marginTop: 16 }}>
                <Link className="btn" href="/shop">
                  Start shopping
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((o) => (
                <div className="scard" key={o.id}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: 600 }}>{o.id}</span>
                      <span className="tag accent">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {o.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>{o.dateLabel}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {o.lines.map((l, i) => (
                      <div className="specrow" key={i} style={{ fontSize: 14 }}>
                        <span className="speck">
                          {l.qty}× {l.name} · {l.gb >= 1024 ? "1TB" : `${l.gb}GB`} · {l.colorName}
                          {l.mode === "wholesale" && (
                            <span style={{ marginLeft: 4, color: "var(--accent)" }}>(wholesale)</span>
                          )}
                        </span>
                        <span className="specv">{formatPrice(l.unit * l.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "var(--text2)", fontSize: 14 }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{formatPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <DemoCard
            icon={MapPin}
            title="Saved address"
            lines={[user.name, "123 Market Street", "San Francisco, CA 94103"]}
          />
          <DemoCard icon={CreditCard} title="Payment method" lines={["Visa •••• 4242", "Expires 09/29"]} />
        </div>
      )}
    </div>
  );
}

function DemoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
}) {
  return (
    <div className="scard-bord">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--accent)" }}>
        <Icon className="h-5 w-5" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 14, color: "var(--text2)" }}>
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <button className="link" style={{ marginTop: 16, fontSize: 14 }}>
        Edit
      </button>
    </div>
  );
}
