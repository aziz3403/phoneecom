import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ScanLine, Sparkles } from "lucide-react";
import { DEVICES, getDevice, relatedDevices, startingPrice } from "@/lib/products";
import { ProductExperience } from "@/components/product/ProductExperience";
import { Reviews } from "@/components/product/Reviews";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return DEVICES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const device = getDevice(slug);
  if (!device) return { title: "Not found" };
  return {
    title: `${device.name} — certified pre-owned`,
    description: `Certified pre-owned ${device.name} from ${startingPrice(device)}. Guaranteed 80%+ battery, fully unlocked, 12-month warranty, free 2-day shipping.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const device = getDevice(slug);
  if (!device) notFound();

  const related = relatedDevices(device, 3);
  const specs: [string, string][] = [
    ["Display", `${device.screen}" ${device.type === "tablet" ? "Liquid Retina" : "OLED"}`],
    ["Chip", device.chip],
    ["Memory", `${device.ram}GB RAM`],
    ["Storage", device.storage.map((s) => `${s.gb}GB`).join(" · ")],
    ["Battery health", "80%+ guaranteed"],
    [
      "Connectivity",
      device.fiveG ? "5G · Wi-Fi 6" : device.cellular ? "Wi-Fi + Cellular" : "Wi-Fi 6",
    ],
    ["Colors", `${device.colors.length} available`],
    ["Released", String(device.releaseYear)],
  ];

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-sm text-white/40">
          <Link href="/shop" className="hover:text-white">
            Shop
          </Link>{" "}
          · {device.type === "tablet" ? "iPad" : device.brand} ·{" "}
          <span className="text-white/70">{device.name}</span>
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
        <ProductExperience device={device} />
      </div>

      {/* highlights */}
      <Section className="py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Why you&apos;ll love it
            </h2>
            <p className="mt-3 text-white/55">
              The standout reasons this {device.brand} {device.type === "tablet" ? "iPad" : "device"} is
              a smart buy — certified, guaranteed, and priced for the real world.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {device.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70"
                >
                  {f}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="space-y-3">
              {device.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-850/50 p-4">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint-500/20">
                    <Check className="h-3.5 w-3.5 text-mint-400" />
                  </span>
                  <span className="text-white/75">{h}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* specs + inspection */}
      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-white">Tech specs</h3>
            <dl className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/10 py-3">
                  <dt className="text-sm text-white/45">{k}</dt>
                  <dd className="text-sm font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-ink-850/50 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-brand-300" />
              <h3 className="font-display text-xl font-bold text-white">The 50-point check</h3>
            </div>
            <p className="mt-3 text-sm text-white/55">
              Before this device shipped, our lab verified each of these — and every unit is
              guaranteed fully unlocked, fully functional, with 80%+ battery health.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                "Touchscreen & display",
                "Battery cycle count",
                "Cameras & sensors",
                "Face ID / Touch ID",
                "Speakers & mics",
                "Wi-Fi & cellular",
                "Buttons & haptics",
                "Charging & ports",
                "Housing integrity",
                "Factory data wipe",
              ].map((c) => (
                <div key={c} className="flex items-center gap-2 text-sm text-white/65">
                  <Check className="h-4 w-4 shrink-0 text-mint-400" /> {c}
                </div>
              ))}
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-mint-500/15 px-3 py-1.5 text-sm font-medium text-mint-300">
              <Sparkles className="h-4 w-4" /> Passed all checks · reMint Certified
            </div>
          </Reveal>
        </div>
      </Section>

      {/* reviews */}
      <Section className="py-8">
        <SectionHeading align="left" eyebrow="Customer reviews" title="What buyers say" />
        <div className="mt-10">
          <Reviews rating={device.rating} count={device.reviews} slug={device.slug} />
        </div>
      </Section>

      {/* related */}
      <Section>
        <SectionHeading align="left" eyebrow="You may also like" title="Complete the lineup" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((d, i) => (
            <ProductCard key={d.id} device={d} index={i} />
          ))}
        </div>
      </Section>

      <RecentlyViewed exclude={device.slug} />
    </div>
  );
}
