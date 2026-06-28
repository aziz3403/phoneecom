import type { Metadata } from "next";
import Link from "next/link";
import { Truck, RefreshCw, ShieldCheck, CreditCard, MessageCircle, Mail, Phone } from "lucide-react";
import { FaqAccordion } from "@/components/help/FaqAccordion";

export const metadata: Metadata = {
  title: "Help & support",
  description:
    "Shipping, returns, warranty and payment info, plus answers to common questions about buying certified pre-owned from reMint.",
};

const TOPICS = [
  {
    icon: Truck,
    title: "Orders & shipping",
    body: "Track a delivery, change an address, shipping times and costs, and order changes.",
  },
  {
    icon: RefreshCw,
    title: "Returns & refunds",
    body: "Our 14-day return window, how to start a return, and when refunds land.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty & repairs",
    body: "What the 12-month warranty covers and how to file a claim.",
  },
  {
    icon: CreditCard,
    title: "Payments & financing",
    body: "Accepted payment methods, monthly financing, and billing questions.",
  },
];

const CONTACT = [
  {
    icon: MessageCircle,
    title: "Live chat",
    body: "Fastest way to reach us. Real people, no bots for the hard stuff.",
    action: "Start a chat",
    href: "#",
    meta: "Avg. reply: under 3 min",
    primary: true,
  },
  {
    icon: Mail,
    title: "Email us",
    body: "Send details and screenshots — great for order-specific questions.",
    action: "help@remint.com",
    href: "mailto:help@remint.com",
    meta: "Replies within 24 hours",
    primary: false,
  },
  {
    icon: Phone,
    title: "Call us",
    body: "Prefer to talk? Our support line is open 8am–8pm ET, every day.",
    action: "1-800-REMINT",
    href: "tel:+18007364680",
    meta: "Mon–Sun · 8am–8pm ET",
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
          Answers on orders, grading, warranty, returns and trade-ins — or reach a real human in
          minutes.
        </p>
      </div>

      {/* browse by topic */}
      <section className="sec" style={{ paddingTop: 64 }}>
        <div className="shell">
          <h2 className="sechead h2" style={{ marginBottom: 32 }}>
            Browse by topic
          </h2>
          <div className="grid-cards">
            {TOPICS.map((t) => (
              <div className="scard-bord" key={t.title}>
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
              </div>
            ))}
          </div>
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
          <div className="scard-bord" style={{ padding: "8px 22px" }}>
            <FaqAccordion />
          </div>
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
                  <button
                    type="button"
                    className={c.primary ? "btn" : "btn btn-lt"}
                    style={{ width: "100%" }}
                  >
                    {c.action}
                  </button>
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
