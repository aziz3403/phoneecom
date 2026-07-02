import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy — reMint",
  description: "What data reMint collects, why, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Your data, plainly"
      title="Privacy Policy"
      intro="We collect the minimum needed to sell you a device, buy back your old one, and run our accounts — and we don't sell your personal information. Here's the full picture."
      updated="July 1, 2026"
    >
      <PolicySection title="What we collect">
        <PolicyList
          items={[
            <><b>Order details</b> — name, email, shipping address, and what you bought. Card numbers go directly to Stripe and never touch our servers.</>,
            <><b>Account data</b> — email, password hash (we can't read your password), saved address, order history. Sign-in with Google shares your name, email and avatar with us.</>,
            <><b>Trade-in details</b> — contact info, device descriptions and payout details (PayPal email or bank details) you provide to get paid.</>,
            <><b>Wholesale applications</b> — company and contact details you submit.</>,
            <><b>Device data on trade-ins</b> — we factory-wipe every device on arrival to industry data-sanitization practice; we don't browse or retain your content.</>,
            <><b>Technical basics</b> — standard server logs (IP, user-agent) for security and rate-limiting. Cart, wishlist and recently-viewed live in your own browser's storage, not on our servers.</>,
          ]}
        />
      </PolicySection>

      <PolicySection title="How we use it">
        <PolicyList
          items={[
            "Fulfilling orders, trade-ins and warranty claims — including transactional email (order confirmations, shipping notices, trade-in status).",
            "Account management, fraud prevention and abuse rate-limiting.",
            "Legal obligations — tax records, and lawful requests concerning lost/stolen devices.",
            "We do not sell or rent personal information, and we don't send marketing email without your consent.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Who we share with">
        <PolicyList
          items={[
            <><b>Stripe</b> — payment processing.</>,
            <><b>Resend</b> — transactional email delivery.</>,
            <><b>Shipping carriers</b> — name and address, to deliver your order.</>,
            <><b>Our database host</b> — encrypted storage of the data above.</>,
            "Authorities where the law requires it (e.g. stolen-device reports).",
          ]}
        />
      </PolicySection>

      <PolicySection title="Retention & security">
        <p>
          Order and trade-in records are kept as long as tax law requires; account data until you
          delete your account. Passwords are bcrypt-hashed, connections are TLS-encrypted, and
          payment data is handled entirely by Stripe (PCI-DSS Level 1).
        </p>
      </PolicySection>

      <PolicySection title="Your choices & rights">
        <PolicyList
          items={[
            "Access, correct or delete your data — from your account page or by contacting support.",
            "California residents: we don't sell personal information as defined by the CCPA/CPRA; you still have the rights to know, delete and correct, exercisable via support.",
            "EU/UK visitors: our lawful bases are contract (orders), legitimate interest (security) and consent (optional email); you may lodge complaints with your local supervisory authority.",
          ]}
        />
        <p>
          To exercise any of these, reach us via the{" "}
          <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">help page</Link>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
