"use client";

import { useEffect, useState } from "react";
import { Package, MapPin, CreditCard, LogOut, User, CheckCircle2 } from "lucide-react";
import { useAccount } from "@/lib/account-store";
import { formatPrice, cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export function AccountClient() {
  const user = useAccount((s) => s.user);
  const orders = useAccount((s) => s.orders);
  const signIn = useAccount((s) => s.signIn);
  const signOut = useAccount((s) => s.signOut);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="mx-auto h-72 max-w-md animate-pulse rounded-3xl border border-white/10 bg-white/5" />;
  }

  if (!user) {
    const valid = name.trim() && /\S+@\S+\.\S+/.test(email);
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-ink-850/50 p-8">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-glacier-400">
          <User className="h-6 w-6 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Sign in to reMint</h2>
        <p className="mt-1 text-sm text-white/55">Track orders, save addresses and check out faster.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) signIn(name, email);
          }}
          className="mt-6 space-y-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!valid}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-glacier-400 font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-40"
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-white/35">Demo only — any name and email works, nothing is sent.</p>
      </div>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* profile */}
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-ink-850/50 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-glacier-400 font-display text-lg font-bold text-white">
            {initials || <User className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">{user.name}</p>
            <p className="text-sm text-white/45">{user.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {/* orders */}
      <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-300" />
          <h3 className="font-display text-lg font-bold text-white">Order history</h3>
          <span className="text-sm text-white/40">({orders.length})</span>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center">
            <p className="text-white/55">No orders yet.</p>
            <div className="mt-4 flex justify-center">
              <ButtonLink href="/shop" size="md">
                Start shopping
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{o.id}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-500/15 px-2.5 py-0.5 text-xs font-medium text-mint-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {o.status}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">{o.dateLabel}</span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-white/65">
                  {o.lines.map((l, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {l.qty}× {l.name} · {l.gb >= 1024 ? "1TB" : `${l.gb}GB`} · {l.colorName}
                        {l.mode === "wholesale" && <span className="ml-1 text-brand-300">(wholesale)</span>}
                      </span>
                      <span>{formatPrice(l.unit * l.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
                  <span className="text-white/50">Total</span>
                  <span className="font-display text-lg font-bold text-white">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* addresses + payment (demo) */}
      <div className="grid gap-6 md:grid-cols-2">
        <DemoCard
          icon={MapPin}
          title="Saved address"
          lines={[user.name, "123 Market Street", "San Francisco, CA 94103"]}
        />
        <DemoCard icon={CreditCard} title="Payment method" lines={["Visa •••• 4242", "Expires 09/29"]} />
      </div>
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
    <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-300" />
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-0.5 text-sm text-white/60">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <button className={cn("mt-4 text-sm text-brand-300 hover:text-brand-200")}>Edit</button>
    </div>
  );
}
