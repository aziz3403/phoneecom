"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { saveProfileAction, type Profile } from "@/lib/profile-actions";

const EMPTY: Profile = { fullName: "", phone: "", line1: "", city: "", state: "", zip: "", country: "United States" };

export function ProfileEditor({ initial }: { initial: Profile | null }) {
  const [form, setForm] = useState<Profile>(initial ?? EMPTY);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function set<K extends keyof Profile>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError("");
    start(async () => {
      const res = await saveProfileAction(form);
      if (res.ok) setSaved(true);
      else setError(res.error ?? "Couldn't save.");
    });
  }

  return (
    <div className="scard-bord">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "var(--accent)" }}>
        <MapPin className="h-5 w-5" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Saved shipping details</h3>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text2)", marginBottom: 16 }}>
        We&apos;ll prefill checkout with this — change it anytime.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="co-frow3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Full name">
            <input className="inpt" aria-label="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Alex Rivera" autoComplete="name" />
          </Field>
          <Field label="Phone">
            <input className="inpt" aria-label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 012-3456" autoComplete="tel" />
          </Field>
        </div>
        <Field label="Street address">
          <input className="inpt" aria-label="Street address" value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="1 Market Street" autoComplete="address-line1" />
        </Field>
        <div className="co-frow3">
          <Field label="City">
            <input className="inpt" aria-label="City" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="San Francisco" autoComplete="address-level2" />
          </Field>
          <Field label="State">
            <input className="inpt" aria-label="State" value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))} placeholder="CA" autoComplete="address-level1" />
          </Field>
          <Field label="ZIP">
            <input className="inpt" aria-label="ZIP" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="94105" autoComplete="postal-code" />
          </Field>
        </div>

        {error && (
          <div role="alert" style={{ fontSize: 13, color: "#b42318", background: "#fef3f2", border: "1px solid #fecdc9", borderRadius: 10, padding: "9px 12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="submit" disabled={pending} className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: pending ? 0.6 : 1 }}>
            {pending && <Loader2 className="h-[18px] w-[18px] animate-spin" />} Save details
          </button>
          {saved && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--accent)", fontWeight: 600 }}>
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="flabel" style={{ fontWeight: 500, color: "var(--text2)", fontSize: 12.5 }}>{label}</label>
      {children}
    </div>
  );
}
