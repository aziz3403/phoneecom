import type { Metadata } from "next";
import Link from "next/link";
import { Truck, RefreshCw, ShieldCheck, CreditCard, CircleDashed, ArrowLeftRight, MessageCircle, Mail, Search, PackageSearch } from "lucide-react";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { ChatLauncherButton } from "@/components/support/ChatLauncherButton";

export const metadata: Metadata = {
  title: "Help & support",
  description:
    "Shipping, returns and payment info, plus answers to common questions about buying certified pre-owned from reMint.",
};

const TOPICS = [
  {
    icon: Truck,
    title: "Orders & shipping",
    body: "Track a delivery with just your reference + email, shipping times, and order changes.",
    href: "/track",
  },
  {
    icon: RefreshCw,
    title: "Returns & refunds",
    body: "The 30-day window, how to start a return, deductions, and when refunds land.",
    href: "/returns",
  },
  {
    icon: ShieldCheck,
    title: "12-month warranty",
    body: "What the functional warranty covers, what it doesn't, and how to make a claim.",
    href: "/warranty",
  },
  {
    icon: CircleDashed,
    title: "Grading & condition",
    body: "What New, Excellent, Good and Fair mean, and our 80%+ battery promise.",
    href: "/grades",
  },
  {
    icon: CreditCard,
    title: "Payments & financing",
    body: "Cards, Apple Pay, Google Pay, and Klarna / Affirm monthly payments — all via Stripe.",
    href: "/help#faq",
  },
  {
    icon: ArrowLeftRight,
    title: "Selling & trade-in",
    body: "How quotes work, the 7-day price lock, shipping your device, and getting paid.",
    href: "/trade-in",
  },
];

const POLICIES = [
  { label: "12-month warranty", href: "/warranty" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Free IMEI check", href: "/imei-check" },
];

const QUICKLINKS = [
  { label: "Track an order or trade-in", href: "/track" },
  { label: "Start a return", href: "/returns" },
  { label: "Make a warranty claim", href: "/warranty" },
  { label: "What the grades mean", href: "/grades" },
  { label: "Trade-in price list", href: "/trade-in/prices" },
];

const CONTACT = [
  {
    icon: MessageCircle,
    title: "Live chat",
    body: "Remi answers instantly, 24/7 — tracking, returns, warranty, quotes and more.",
    action: "Start a chat",
    href: "#",
    meta: "Instant answers · 24/7",
    primary: true,
  },
  {
    icon: Mail,
    title: "Email us",
    body: "Send details and screenshots — best for order-specific questions and claims.",
    action: "support@remint.example",
    href: "mailto:support@remint.example",
    meta: "Replies within 1 business day",
    primary: false,
  },
  {
    icon: PackageSearch,
    title: "Track it yourself",
    body: "Any order or trade-in, no account needed — just your reference and email.",
    action: "Open tracking",
    href: "/track",
    meta: "RM-… orders · TI-… trade-ins",
    primary: false,
  },
];

export default function HelpPage() {
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Support
        </p>
        <h1 className="ptitle">How can we help?</h1>
        <p className="psub">
          Answers on orders, grading, returns, warranty and trade-ins — instant in chat,
          or by email within a business day.
        </p>

        {/* hero search bar — demo, visual anchor */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "13px 18px",
            marginTop: 26,
            maxWidth: 560,
            boxShadow: "0 8px 24px rgba(20,60,45,.07)",
          }}
        >
          <Search className="h-5 w-5" style={{ color: "var(--text3)", flex: "none" }} />
          <input
            aria-label="Search help articles"
            placeholder={'Search help articles — e.g. "track my order"'}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              font: "inherit",
              fontSize: 16,
              color: "var(--text)",
              background: "none",
            }}
          />
        </div>

        {/* quick-link pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          {QUICKLINKS.map((q) => (
            <Link key={q.label} className="chip" href={q.href}>
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {/* browse by topic */}
      <section className="sec" style={{ paddingTop: 64 }}>
        <div className="shell">
          <h2 className="sechead h2" style={{ marginBottom: 32 }}>
            Browse by topic
          </h2>
          <div className="grid-cards">
            {TOPICS.map((t) => (
              <Link className="scard-bord" key={t.title} href={t.href} style={{ display: "block" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#edf6f0",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.01em" }}>{t.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 7, lineHeight: 1.5 }}>
                  {t.body}
                </p>
                <span
                  className="link"
                  style={{ fontSize: 13.5, fontWeight: 600, marginTop: 14, display: "inline-flex" }}
                >
                  View articles <span className="chev">&rsaquo;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      
          {/* policies — the fine print, one tap away */}
          <div
            style={{
              marginTop: 26,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              borderTop: "1px solid var(--line)",
              paddingTop: 22,
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text2)", marginRight: 4 }}>
              Policies &amp; guarantees:
            </span>
            {POLICIES.map((p) => (
              <Link key={p.href} className="chip" href={p.href}>
                {p.label}
              </Link>
            ))}
          </div>
        </section>

      {/* faq */}
      <section className="graysec">
        <div className="shell-narrow">
          <div className="sechead ctr" style={{ marginBottom: 30, padding: 0 }}>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">Frequently asked questions</h2>
            <p className="hsub">The quick answers most people are looking for.</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* contact */}
      <section className="sec">
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 32, padding: 0 }}>
            <h2 className="h2">Still need a hand?</h2>
            <p className="hsub">
              Our team is here 7 days a week. Most chats are answered in under 3 minutes.
            </p>
          </div>
          <div className="grid-cards">
            {CONTACT.map((c) => (
              <div className="scard-bord" key={c.title} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: "#edf6f0",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text2)",
                    margin: "7px 0 16px",
                    lineHeight: 1.5,
                  }}
                >
                  {c.body}
                </p>
                {c.href === "#" ? (
                  <ChatLauncherButton
                    className={c.primary ? "btn" : "btn btn-lt"}
                    style={{ width: "100%" }}
                  >
                    {c.action}
                  </ChatLauncherButton>
                ) : (
                  <a
                    className={c.primary ? "btn" : "btn btn-lt"}
                    href={c.href}
                    style={{ width: "100%" }}
                  >
                    {c.action}
                  </a>
                )}
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 10 }}>{c.meta}</div>
              </div>
            ))}
          </div>
          <div className="note2" style={{ marginTop: 28 }}>
            reMint is a demo storefront. Support channels and contact details shown are
            illustrative.
          </div>
        </div>
      </section>
    </>
  );
}
