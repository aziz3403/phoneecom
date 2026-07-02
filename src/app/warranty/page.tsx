import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "12-Month Limited Warranty — reMint",
  description:
    "Every reMint device is covered by a 12-month limited warranty on functional hardware defects. What's covered, what isn't, and how to claim.",
};

export default function WarrantyPage() {
  return (
    <PolicyPage
      eyebrow="Peace of mind, in writing"
      title="12-Month Limited Warranty"
      intro="Every device we sell is covered against functional hardware defects for 12 months from delivery. This is a warranty on the device working — not on cosmetic wear, accidents, or normal battery ageing. Here's exactly what that means."
      updated="July 1, 2026"
    >
      <PolicySection title="What's covered">
        <p>
          For <b>12 months from the delivery date</b>, we warrant that your device is free from
          defects in materials and workmanship that stop it functioning as intended under normal
          use. That covers functional hardware failures such as:
        </p>
        <PolicyList
          items={[
            "Device won't power on or spontaneously shuts down",
            "Display failure — dead pixels appearing after purchase, lines, no image, unresponsive touch",
            "Complete battery failure, or battery capacity found below 80% at delivery",
            "Camera, speaker, microphone, vibration motor or charging-port failure",
            "Face ID / Touch ID failure (where fitted and sold as working)",
            "Wi-Fi, Bluetooth or cellular radio failure on a device sold as network-ready",
          ]}
        />
      </PolicySection>

      <PolicySection title="What's not covered">
        <p>
          Like every seller of electronics, we can't warrant things outside the device's own
          workmanship. This warranty does <b>not</b> cover:
        </p>
        <PolicyList
          items={[
            <><b>Accidental damage</b> — drops, impacts, cracked glass or frames, bends, and pressure damage occurring after delivery.</>,
            <><b>Liquid damage</b> of any kind, regardless of the device's original water-resistance rating (seals age on all used devices).</>,
            <><b>Cosmetic wear</b> — scratches, scuffs and marks consistent with the condition grade you purchased, or arising from normal use afterwards.</>,
            <><b>Normal battery ageing</b> — every battery degrades with use. We guarantee at least 80% capacity at delivery and cover complete failure; gradual decline after delivery is normal wear, not a defect.</>,
            <><b>Software issues</b> — OS bugs, app problems, update failures, configuration, or data loss. Always back up your data; we are not responsible for data on a returned device.</>,
            <><b>Unauthorized repair or modification</b> — the warranty is void if the device is opened, repaired with non-genuine parts by a third party, jailbroken/rooted, or has its IMEI/serial altered or removed.</>,
            <><b>Misuse</b> — damage from use contrary to the manufacturer's guidelines, extreme environments, or non-compliant chargers and accessories.</>,
            <><b>Loss or theft</b>, and devices reported lost/stolen or blacklisted after delivery.</>,
            <>Free promotional accessories (e.g. the included charging cable and adapter).</>,
          ]}
        />
      </PolicySection>

      <PolicySection title="Your remedy">
        <p>
          If a covered defect appears within the warranty period, we will — <b>at our option</b> —
          repair the device, replace it with an equivalent certified pre-owned device of the same
          or better specification and condition grade, or refund the price you paid. That remedy is
          your exclusive remedy under this warranty. Replacement devices carry the remainder of the
          original 12-month term.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for incidental or
          consequential damages (lost data, lost profits, cost of substitute devices). Any implied
          warranties, including merchantability and fitness for a particular purpose, are limited
          to the duration of this written warranty. Some states don&apos;t allow those limitations, so
          they may not apply to you — this warranty gives you specific legal rights, and you may
          have other rights that vary from state to state.
        </p>
      </PolicySection>

      <PolicySection title="How to claim">
        <PolicyList
          items={[
            <><b>1.</b> Contact support from <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">the help page</Link> with your order number and a description (photos or a short video help a lot).</>,
            <><b>2.</b> We confirm the claim looks covered and send shipping instructions. You ship the device to us — please use a tracked service and remove activation locks (Find My / Google account) first; we can't inspect a locked device.</>,
            <><b>3.</b> Our technicians verify the defect, usually within 2 business days of arrival. Approved claims are repaired, replaced or refunded — and we cover the shipping back to you.</>,
            <>If inspection finds the issue isn't covered (e.g. liquid damage or an aftermarket repair), we'll email you photos and the reason, and return the device to you.</>,
          ]}
        />
      </PolicySection>

      <PolicySection title="Scope">
        <p>
          This warranty applies to devices purchased directly from reMint, for the original
          purchaser, and is not transferable. It applies alongside — not instead of — your{" "}
          <Link href="/returns" className="text-[#0a8f6e] underline-offset-2 hover:underline">30-day return window</Link>.
          Wholesale orders are covered by the RMA terms on the{" "}
          <Link href="/wholesale" className="text-[#0a8f6e] underline-offset-2 hover:underline">wholesale portal</Link> instead.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
