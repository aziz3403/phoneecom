import Link from "next/link";
import { Sparkles, ShieldCheck, Truck, RefreshCw, Mail } from "lucide-react";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "All devices", href: "/shop" },
      { label: "Phones", href: "/shop?type=phone" },
      { label: "iPads", href: "/shop?type=tablet" },
      { label: "Apple", href: "/shop?brand=Apple" },
      { label: "Samsung", href: "/shop?brand=Samsung" },
      { label: "Under $300", href: "/shop?max=300" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Wholesale portal", href: "/wholesale" },
      { label: "Volume pricing", href: "/wholesale#pricing" },
      { label: "Bulk order builder", href: "/wholesale#builder" },
      { label: "Become a partner", href: "/wholesale#apply" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "How grading works", href: "/grades" },
      { label: "Shipping & returns", href: "/help" },
      { label: "Warranty", href: "/help" },
      { label: "Compare devices", href: "/compare" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-ink-900/60">
      {/* trust strip */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 border-b border-white/10 px-5 py-10 sm:px-8 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Certified pre-owned", sub: "50-point inspection on every device" },
          { icon: RefreshCw, title: "30-day returns", sub: "Changed your mind? Send it back free" },
          { icon: Truck, title: "Free 2-day shipping", sub: "Carbon-neutral on every order" },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-white/45">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-glacier-400">
              <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
            </span>
            <span className="font-display text-xl font-bold text-white">
              re<span className="text-gradient">Mint</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
            Certified pre-owned smartphones for everyone — and serious volume pricing for resellers,
            repair shops and enterprises. Mint-condition guaranteed.
          </p>
          <form className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-4">
            <Mail className="h-4 w-4 shrink-0 text-white/40" />
            <input
              type="email"
              placeholder="Get drop alerts & deals"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <button
              type="button"
              className="shrink-0 rounded-full bg-gradient-to-r from-brand-500 to-glacier-400 px-4 py-2 text-sm font-medium text-white"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/50 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-6 text-xs text-white/40 sm:flex-row sm:px-8">
        <p>© {2026} reMint Commerce. Demo storefront — not a real store.</p>
        <div className="flex items-center gap-4">
          <Link href="/#" className="hover:text-white">Privacy</Link>
          <Link href="/#" className="hover:text-white">Terms</Link>
          <Link href="/#" className="hover:text-white">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
