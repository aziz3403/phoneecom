"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";

const VOLUMES = ["5–25 / month", "25–100 / month", "100–250 / month", "250–500 / month", "500+ / month"];
const TYPES = ["Repair shop", "Reseller / retailer", "Carrier / MVNO", "Enterprise / IT", "Refurbisher", "Other"];

export function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    volume: VOLUMES[1],
    type: TYPES[0],
    message: "",
  });

  const valid = form.company.trim() && form.name.trim() && /\S+@\S+\.\S+/.test(form.email);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitted(true);
  }

  const field =
    "w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Open a trade account
        </h2>
        <p className="mt-3 max-w-md text-white/55">
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
            <li key={b} className="flex items-start gap-2 text-white/70">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-400" /> {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center py-10 text-center"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-mint-500/20">
                <CheckCircle2 className="h-9 w-9 text-mint-400" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-white">Application received</h3>
              <p className="mt-2 max-w-sm text-white/55">
                Thanks, {form.name.split(" ")[0] || "there"}! We&apos;ll email{" "}
                <span className="text-white">{form.email}</span> within one business day. (This is a
                demo — no data was sent.)
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-brand-300 hover:text-brand-200"
              >
                Submit another
              </button>
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
                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Company *</label>
                  <input
                    className={field}
                    placeholder="Acme Mobile"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Your name *</label>
                  <input
                    className={field}
                    placeholder="Jordan Lee"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/60">Work email *</label>
                <input
                  type="email"
                  className={field}
                  placeholder="jordan@acme.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Monthly volume</label>
                  <select className={field} value={form.volume} onChange={(e) => set("volume", e.target.value)}>
                    {VOLUMES.map((v) => (
                      <option key={v} className="bg-ink-900">
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Business type</label>
                  <select className={field} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t} className="bg-ink-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/60">Anything else?</label>
                <textarea
                  rows={3}
                  className={field}
                  placeholder="Models you're after, target volumes, timelines…"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!valid}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-glacier-400 font-medium text-white shadow-[0_14px_50px_-12px_rgba(116,48,255,.9)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
              >
                <Send className="h-4.5 w-4.5" /> Request pricing
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
