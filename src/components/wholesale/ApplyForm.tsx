"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, Loader2, Clock } from "lucide-react";

const VOLUMES = ["5–25 / month", "25–100 / month", "100–250 / month", "250–500 / month", "500+ / month"];
const TYPES = ["Repair shop", "Reseller / retailer", "Carrier / MVNO", "Enterprise / IT", "Refurbisher", "Other"];
const REGIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "European Union",
  "Latin America",
  "Asia-Pacific",
  "Middle East & Africa",
  "Other",
];

export interface ApplyFormData {
  company: string;
  name: string;
  email: string;
  volume: string;
  type: string;
  region: string;
  message: string;
}

/**
 * Wholesale trade-account application. `onSubmit` does the real work (files
 * the application, or instantly unlocks the demo portal); while it runs the
 * form shows a review beat. When `pendingReview` is true the success state
 * says "under review" — real applications are decided by the owner, not
 * self-approved.
 */
export function ApplyForm({
  onSubmit,
  pendingReview = false,
}: {
  onSubmit?: (form: ApplyFormData) => Promise<{ ok: boolean; error?: string }>;
  pendingReview?: boolean;
}) {
  const [phase, setPhase] = useState<"form" | "review" | "done">("form");
  const [error, setError] = useState("");
  const [form, setForm] = useState<ApplyFormData>({
    company: "",
    name: "",
    email: "",
    volume: VOLUMES[1],
    type: TYPES[0],
    region: REGIONS[0],
    message: "",
  });

  const valid = form.company.trim() && form.name.trim() && /\S+@\S+\.\S+/.test(form.email);

  function set<K extends keyof ApplyFormData>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || phase === "review") return;
    setError("");
    if (!onSubmit) {
      setPhase("done");
      return;
    }
    setPhase("review");
    try {
      const res = await onSubmit(form);
      if (res.ok) setPhase("done");
      else {
        setPhase("form");
        setError(res.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setPhase("form");
      setError("Something went wrong — please try again.");
    }
  }

  const submitted = phase === "done";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="eyebrow">Get started</p>
        <h2 className="h2 mt-3">Open a trade account.</h2>
        <p className="mt-4 max-w-md text-[17px] text-[#6e6e73]">
          Tell us a little about your business and a dedicated account manager will reach out within
          one business day with pricing tailored to your volume.
        </p>
        <ul className="mt-7 space-y-3">
          {[
            "No setup fees, no monthly minimums",
            "Net terms up to 30 days on approval",
            "Consistent grading you can resell with confidence",
            "Optional API & EDI inventory feeds",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[#1d1d1f]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0a8f6e]" /> {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="scard-bord">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center py-10 text-center"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f1f7f3]">
                {pendingReview ? (
                  <Clock className="h-9 w-9 text-[#0a8f6e]" />
                ) : (
                  <CheckCircle2 className="h-9 w-9 text-[#0a8f6e]" />
                )}
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#1d1d1f]">
                {pendingReview ? "Application under review" : "Application received"}
              </h3>
              <p className="mt-2 max-w-sm text-[#6e6e73]">
                Thanks, {form.name.split(" ")[0] || "there"}!{" "}
                {pendingReview ? (
                  <>Our team is reviewing <span className="text-[#1d1d1f]">{form.company}</span> — we&apos;ll
                  email <span className="text-[#1d1d1f]">{form.email}</span> the decision, usually within one
                  business day. The portal unlocks automatically on approval.</>
                ) : (
                  <>We&apos;ll email <span className="text-[#1d1d1f]">{form.email}</span> within one business day.</>
                )}
              </p>
            </motion.div>
          ) : phase === "review" ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center py-10 text-center"
            >
              <Loader2 className="h-9 w-9 animate-spin text-[#0a8f6e]" />
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#1d1d1f]">Submitting your application…</h3>
              <p className="mt-2 max-w-sm text-[#6e6e73]">
                Checking your details against our partner criteria. This only takes a moment.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="flabel">Company *</label>
                  <input
                    className="inpt"
                    aria-label="Company"
                    placeholder="Acme Mobile"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="flabel">Your name *</label>
                  <input
                    className="inpt"
                    aria-label="Your name"
                    placeholder="Jordan Lee"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="flabel">Work email *</label>
                <input
                  type="email"
                  className="inpt"
                  aria-label="Work email"
                  placeholder="jordan@acme.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="flabel">Monthly volume</label>
                  <select aria-label="Monthly volume" className="sel" value={form.volume} onChange={(e) => set("volume", e.target.value)}>
                    {VOLUMES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="flabel">Business type</label>
                  <select aria-label="Business type" className="sel" value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="flabel">Country / region</label>
                <select aria-label="Country / region" className="sel" value={form.region} onChange={(e) => set("region", e.target.value)}>
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="flabel">Anything else?</label>
                <textarea
                  rows={3}
                  aria-label="Anything else"
                  className="area"
                  placeholder="Models you're after, target volumes, timelines…"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!valid}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0a8f6e] text-[17px] text-white transition-all duration-200 hover:bg-[#0a7d61] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-[18px] w-[18px]" /> Submit application
              </button>
              {error && (
                <p role="alert" className="text-center text-[13px] text-[#b23b3b]">{error}</p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
