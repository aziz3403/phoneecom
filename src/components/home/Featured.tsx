import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { popularDevices } from "@/lib/products";

export function Featured() {
  const devices = popularDevices().slice(0, 4);
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-200">
            This week&apos;s drops
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Most-wanted, <span className="text-gradient">freshly graded</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ButtonLink href="/shop" variant="outline" size="md">
            View all phones <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {devices.map((d, i) => (
          <ProductCard key={d.id} device={d} index={i} />
        ))}
      </div>
    </Section>
  );
}
