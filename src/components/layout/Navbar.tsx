"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Menu, X, Sparkles, Heart, ChevronDown, Smartphone, Tablet, User } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";
import { SearchCommand } from "./SearchCommand";

const MEGA = [
  {
    title: "By type",
    links: [
      { label: "All phones", href: "/shop?type=phone" },
      { label: "iPads & tablets", href: "/shop?type=tablet" },
      { label: "Live inventory", href: "/inventory" },
      { label: "Everything", href: "/shop" },
    ],
  },
  {
    title: "By brand",
    links: [
      { label: "Apple", href: "/shop?brand=Apple" },
      { label: "Samsung", href: "/shop?brand=Samsung" },
    ],
  },
  {
    title: "By budget",
    links: [
      { label: "Under $300", href: "/shop?max=300" },
      { label: "Under $600", href: "/shop?max=600" },
      { label: "All deals", href: "/shop" },
    ],
  },
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
  const [megaOpen, setMegaOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [mounted, setMounted] = useState(false);
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart((s) => cartCount(s.items));
  const wishCount = useWishlist((s) => s.slugs.length);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* announcement bar */}
      <AnimatePresence>
        {showBar && !scrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-glacier-500 text-white"
          >
            <div className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-2 px-5 text-center text-xs font-medium sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Every device fully unlocked · 80%+ battery · 12-month warranty · free 2-day shipping
              <button
                onClick={() => setShowBar(false)}
                aria-label="Dismiss"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 sm:px-8", scrolled && "mt-2")}>
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass-strong shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)]" : "bg-transparent",
          )}
        >
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {/* Shop mega menu */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link
                href="/shop"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white"
              >
                Shop <ChevronDown className="h-3.5 w-3.5" />
              </Link>
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3"
                  >
                    <div className="grid grid-cols-3 gap-6 rounded-2xl glass-strong p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
                      {MEGA.map((col) => (
                        <div key={col.title}>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-200">{col.title}</p>
                          <ul className="space-y-2">
                            {col.links.map((l) => (
                              <li key={l.label}>
                                <Link href={l.href} className="text-sm text-white/65 transition hover:text-white">
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="col-span-3 mt-1 flex gap-3 border-t border-white/10 pt-4">
                        <Link href="/shop?type=phone" className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                          <Smartphone className="h-4 w-4 text-brand-300" /> Phones
                        </Link>
                        <Link href="/shop?type=tablet" className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                          <Tablet className="h-4 w-4 text-glacier-300" /> iPads
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { href: "/inventory", label: "Inventory" },
              { href: "/sell", label: "Sell" },
              { href: "/wholesale", label: "Wholesale" },
              { href: "/grades", label: "Grades" },
            ].map((l) => (
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
            <SearchCommand />
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-10 w-10 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/10 sm:grid"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/10 sm:grid"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                  {wishCount}
                </span>
              )}
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
            {[
              { href: "/shop?type=phone", label: "Phones" },
              { href: "/shop?type=tablet", label: "iPads" },
              { href: "/shop", label: "All devices" },
              { href: "/inventory", label: "Live inventory" },
              { href: "/sell", label: "Sell your phone" },
              { href: "/wholesale", label: "Wholesale" },
              { href: "/wishlist", label: "Wishlist" },
              { href: "/account", label: "Account" },
              { href: "/grades", label: "Grades" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 text-base font-medium text-white/80 hover:bg-white/5">
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
