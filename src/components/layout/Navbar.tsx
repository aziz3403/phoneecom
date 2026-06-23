"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Menu, X, Sparkles } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/#how", label: "How it works" },
  { href: "/#certified", label: "Certified" },
];

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-glacier-400 shadow-[0_8px_24px_-8px_rgba(116,48,255,.9)]">
        <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-white">
        re<span className="text-gradient">Mint</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart((s) => cartCount(s.items));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 sm:px-8",
          scrolled && "mt-2",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass-strong shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)]" : "bg-transparent",
          )}
        >
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white",
                  pathname === l.href && "text-white",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/wholesale"
              className="hidden rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Trade portal
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-glacier-400 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-5 mt-2 overflow-hidden rounded-2xl glass-strong p-2 lg:hidden"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-4 py-3 text-base font-medium text-white/80 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
