import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & Refunds — reMint",
  description: "30-day returns on every device. How returns, refunds and deductions work at reMint.",
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Changed your mind? No drama."
      title="Returns & Refunds"
      intro="Every retail device can come back within 30 days of delivery, for any reason. Here's how the process works and what can affect your refund."
      updated="July 1, 2026"
    >
      <PolicySection title="The 30-day window">
        <p>
          You have <b>30 days from the delivery date</b> to start a return for any reason — didn&apos;t
          like the colour, found a better deal, changed your mind. Start it from{" "}
          <Link href="/account" className="text-[#0a8f6e] underline-offset-2 hover:underline">your account</Link>{" "}
          or the <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">help page</Link> with
          your order number.
        </p>
      </PolicySection>

      <PolicySection title="Condition of the return">
        <p>Your refund is for the device in the condition we sold it. Before shipping it back:</p>
        <PolicyList
          items={[
            <>Remove activation locks — sign out of Find My / your Google account. <b>We cannot refund a locked device</b>; it will be returned to you.</>,
            "Include everything that came in the box (charging cable and adapter).",
            "Pack it safely — you're responsible for the device until it reaches us, so use the original packaging where possible and a tracked service.",
          ]}
        />
        <p>
          A deduction from the refund applies if the device comes back in worse condition than
          sold — for example new cracks, dents, liquid damage, or a lower cosmetic grade than it
          shipped in. We&apos;ll email you photos and the deduction before processing.
        </p>
      </PolicySection>

      <PolicySection title="Refund timing">
        <PolicyList
          items={[
            "We inspect returns within 2 business days of arrival.",
            "Approved refunds go back to your original payment method and typically appear in 3–5 business days depending on your bank.",
            "Faulty-on-arrival devices are refunded in full including any delivery fee you paid — or replaced, your choice. Functional failures after 30 days are handled under the 12-month warranty instead.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Return shipping">
        <p>
          For change-of-mind returns you cover return postage. If the device arrived not as
          described (wrong item, wrong grade, or dead on arrival), we email you a prepaid label —
          that one&apos;s on us.
        </p>
      </PolicySection>

      <PolicySection title="Trade-ins and wholesale">
        <p>
          Trade-in devices follow the offer terms shown at quote time: your price is locked for 7
          days, revised offers come with photos and a 7-day decision window, and declined devices
          are returned with postage at your cost. Wholesale orders follow the RMA terms on the{" "}
          <Link href="/wholesale" className="text-[#0a8f6e] underline-offset-2 hover:underline">wholesale portal</Link>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
