import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, RotateCw, ScanLine, Sparkles } from "lucide-react";
import { PHONES, getPhone, relatedPhones } from "@/lib/products";
import PhoneViewer from "@/components/three/PhoneViewer";
import { ProductBuyPanel } from "@/components/product/ProductBuyPanel";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return PHONES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const phone = getPhone(slug);
  if (!phone) return { title: "Phone not found" };
  return {
    title: `${phone.name} — ${phone.color}`,
    description: `Certified pre-owned ${phone.name} (${phone.color}, ${phone.storage}GB) graded ${phone.grade}. ${phone.batteryHealth}% battery health, 12-month warranty.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phone = getPhone(slug);
  if (!phone) notFound();

  const related = relatedPhones(phone, 3);
  const specs: [string, string][] = [
    ["Display", `${phone.screen}" OLED`],
    ["Chip", phone.chip],
    ["Memory", `${phone.ram}GB RAM`],
    ["Storage", `${phone.storage}GB`],
    ["Battery health", `${phone.batteryHealth}%`],
    ["Connectivity", phone.fiveG ? "5G · Wi-Fi 6" : "4G LTE · Wi-Fi"],
    ["Carrier", phone.carrier],
    ["Released", String(phone.releaseYear)],
  ];

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-sm text-white/40">
          <Link href="/shop" className="hover:text-white">
            Shop
          </Link>{" "}
          · {phone.brand} · <span className="text-white/70">{phone.name}</span>
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2">
        {/* 3D viewer */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-ink-800/60 to-ink-900/70">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[90px]"
              style={{ background: phone.colorHex }}
            />
            <PhoneViewer
              colorHex={phone.colorHex}
              accentHex={phone.accentHex}
              cameraLayout={phone.cameraLayout}
              brand={phone.brand}
              mode="viewer"
              className="h-full w-full"
            />
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5" /> Drag to rotate · scroll to zoom
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-white/45">Colorway</span>
            <span
              className="h-7 w-7 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-ink-950"
              style={{ background: phone.colorHex }}
            />
            <span className="text-sm font-medium text-white">{phone.color}</span>
          </div>
        </div>

        {/* purchase */}
        <ProductBuyPanel phone={phone} />
      </div>

      {/* highlights */}
      <Section className="py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Why you&apos;ll love it
            </h2>
            <p className="mt-3 text-white/55">
              The standout reasons this {phone.brand} is a smart buy — certified, guaranteed, and
              priced for the real world.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {phone.features.map((f) => (
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
              {phone.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-850/50 p-4"
                >
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
            <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
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
              Before this device shipped, our lab verified each of these — and {phone.batteryHealth}%
              battery health was measured directly.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                "Touchscreen & display",
                "Battery cycle count",
                "Front & rear cameras",
                "Face ID / fingerprint",
                "Speakers & mics",
                "Cellular & Wi-Fi",
                "Buttons & haptics",
                "Charging & ports",
                "Water-resist seals",
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

      {/* related */}
      <Section>
        <SectionHeading align="left" eyebrow="You may also like" title="Complete the lineup" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <ProductCard key={p.id} phone={p} index={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}
