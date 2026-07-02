import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Service — reMint",
  description: "The terms that govern buying, trading in and wholesale ordering at reMint.",
};

const A = "text-[#0a8f6e] underline-offset-2 hover:underline";

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="The fine print, minus the fog"
      title="Terms of Service"
      intro="These terms govern your use of the reMint site and your purchases, trade-ins and wholesale orders. By using the site you agree to them."
      updated="July 1, 2026"
    >
      <PolicySection title="1. Who we are & what we sell">
        <p>
          reMint sells certified pre-owned smartphones and tablets. Every device is used or
          refurbished, tested against our 50-point inspection, graded per the published{" "}
          <Link href="/grades" className={A}>condition standards</Link>, and sold unlocked unless
          stated otherwise. Product photos of condition grades are representative examples — your
          unit will match the grade description, not a specific photo.
        </p>
      </PolicySection>

      <PolicySection title="2. Orders, pricing & availability">
        <PolicyList
          items={[
            "All prices are in US dollars. Taxes are estimated at checkout and finalized on your receipt.",
            "Stock is live and each unit is unique: an order isn't accepted until we confirm it. If we can't cover an item after you order (e.g. a warehouse discrepancy), we cancel and refund that line in full.",
            "Obvious pricing errors (e.g. a device listed at $0 due to a data fault) may be cancelled and refunded even after confirmation.",
            "We may decline or cancel orders that appear fraudulent, automated, or intended for resale abuse of promotional pricing.",
          ]}
        />
      </PolicySection>

      <PolicySection title="3. Payment">
        <p>
          Payments are processed by Stripe; your card details never touch our servers. Financing
          options (e.g. Klarna, Affirm), where offered, are separate credit agreements between you
          and the provider — their terms apply to the credit, ours to the device.
        </p>
      </PolicySection>

      <PolicySection title="4. Delivery, returns & warranty">
        <p>
          Delivery estimates are business-day estimates, not guarantees. Your purchase is covered
          by <Link href="/returns" className={A}>30-day returns</Link> and the{" "}
          <Link href="/warranty" className={A}>12-month limited warranty on functional defects</Link> —
          both incorporated into these terms. Risk in the device passes to you on delivery.
        </p>
      </PolicySection>

      <PolicySection title="5. Trade-ins & buyback">
        <PolicyList
          items={[
            "Quotes are generated from your description of the device and locked for 7 days from submission.",
            "You must be the lawful owner. Devices must have activation locks removed (Find My / Google account) and must not be reported lost, stolen or blacklisted — such devices are surrendered to the relevant carrier/authorities where required by law, without payment.",
            "Erase your data before shipping. We factory-wipe every device on arrival as a courtesy, but you are responsible for your data and for removing SIM/memory cards.",
            "If inspection finds a different condition than described, we send a revised offer with photos and you have 7 days to accept or decline; declined devices are returned with postage at your cost. If we don't hear back within 7 days of the revised offer, the device is returned to your address on file (postage deducted where permitted).",
            "Payouts are sent after inspection by your chosen method. Store-credit payouts include the stated bonus and are non-refundable for cash.",
            "Batches under 5 devices are shipped to us at your cost; 5+ devices qualify for a prepaid label.",
          ]}
        />
      </PolicySection>

      <PolicySection title="6. Wholesale">
        <p>
          Wholesale pricing, live inventory and bulk ordering are available to approved trade
          accounts only. Applications are reviewed by our team and approval may be revoked for
          abuse. Wholesale purchases are business-to-business: consumer return rights don&apos;t apply;
          the RMA terms published on the <Link href="/wholesale" className={A}>wholesale portal</Link> govern instead.
        </p>
      </PolicySection>

      <PolicySection title="7. Accounts">
        <PolicyList
          items={[
            "Keep your credentials confidential; you're responsible for activity on your account.",
            "We may suspend accounts used for fraud, abuse, scraping, or violation of these terms.",
            "You can request deletion of your account and data at any time — see the Privacy Policy.",
          ]}
        />
      </PolicySection>

      <PolicySection title="8. Reviews & content">
        <p>
          Reviews must reflect a genuine purchase experience. We never pay for positive reviews,
          never suppress negative ones, and moderate only for abuse, spam and personal data — in
          line with the FTC&apos;s Consumer Reviews and Testimonials Rule.
        </p>
      </PolicySection>

      <PolicySection title="9. Liability">
        <p>
          To the fullest extent permitted by law, our total liability for any claim arising from a
          purchase is limited to the amount you paid for the device concerned, and we are not
          liable for indirect, incidental or consequential losses (including data loss). Nothing in
          these terms limits liability that cannot be limited by law, or your statutory rights as a
          consumer.
        </p>
      </PolicySection>

      <PolicySection title="10. General">
        <PolicyList
          items={[
            "These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules.",
            "If any clause is found unenforceable, the rest remain in force.",
            "We may update these terms; material changes are posted here with a new 'last updated' date and apply to orders placed after that date.",
          ]}
        />
      </PolicySection>
    </PolicyPage>
  );
}
