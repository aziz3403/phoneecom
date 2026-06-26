import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import { devicesOfType, startingPrice } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const CATS = [
  {
    href: "/shop?type=phone",
    label: "Phones",
    blurb: "iPhone 11 to 16, the full Galaxy lineup, foldables and more.",
    type: "phone" as const,
    color: "#566472",
    accent: "#9aa7b4",
    glow: "from-brand-600/30",
  },
  {
    href: "/shop?type=tablet",
    label: "iPads",
    blurb: "iPad, mini, Air and Pro — from everyday to M4 powerhouses.",
    type: "tablet" as const,
    color: "#2a2b2e",
    accent: "#45464a",
    glow: "from-glacier-500/25",
  },
];

export function Categories() {
  return (
    <Section className="py-16">
      <SectionHeading
        eyebrow="Shop by category"
        title={<>Find your <span className="text-gradient">perfect match</span></>}
        subtitle="Phones and tablets, every brand, every budget — all certified and warrantied."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {CATS.map((c, i) => {
          const list = devicesOfType(c.type);
          const from = Math.min(...list.map(startingPrice));
          return (
            <Reveal key={c.label} delay={i * 0.1}>
              <Link
                href={c.href}
                className="group relative flex h-64 items-center overflow-hidden rounded-3xl border border-white/10 bg-ink-850/60 p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
              >
                <div className={`pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-3xl`} />
                <div className="relative z-10 flex-1">
                  <h3 className="font-display text-3xl font-bold text-white">{c.label}</h3>
                  <p className="mt-2 max-w-xs text-sm text-white/55">{c.blurb}</p>
                  <p className="mt-4 text-sm text-white/40">
                    {list.length} models · from <span className="font-semibold text-white">{formatPrice(from)}</span>
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-200">
                    Shop {c.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="relative z-10 h-full w-32 shrink-0">
                  <DeviceVisual colorHex={c.color} accent={c.accent} brand="Apple" type={c.type} className="h-full" />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
