import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Accessibility — reMint",
  description: "reMint's accessibility commitment and how to reach us if something's in your way.",
};

export default function AccessibilityPage() {
  return (
    <PolicyPage
      eyebrow="Everyone shops here"
      title="Accessibility Statement"
      intro="We want buying a refurbished phone to be possible for everyone, whatever assistive technology you use. Here's where we stand and how to tell us when we fall short."
      updated="July 1, 2026"
    >
      <PolicySection title="Our standard">
        <p>
          We aim for <b>WCAG 2.2 Level AA</b> across the storefront. Concretely, that means we work
          to keep:
        </p>
        <PolicyList
          items={[
            "Full keyboard operability — including the search palette (⌘K / Ctrl+K), menus, carts and checkout.",
            "Labels and alt text on interactive controls and product imagery.",
            "Text contrast at or above AA ratios in the design system.",
            "Color never used as the only signal — grades and conditions carry text labels alongside color.",
            "Reduced-motion preferences respected for animation-heavy sections.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Known limitations">
        <PolicyList
          items={[
            "The interactive 3D phone viewer is decorative/supplementary — every spec and photo it shows is also available as text and standard images on the same page.",
            "Some older grade photos are being re-captioned with fuller descriptions.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Tell us what's broken">
        <p>
          If anything on this site is hard to use with a screen reader, switch access, magnification
          or any other assistive tech, please tell us via the{" "}
          <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">help page</Link> —
          include the page and what happened. Accessibility reports go to the front of the queue and
          we respond within two business days.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
