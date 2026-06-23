import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-600/30 via-ink-850 to-glacier-500/20 px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/40 blur-[100px]" />

          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Upgrade for less.
              <br />
              <span className="text-gradient">Waste nothing.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">
              Join 250,000+ people and 1,200+ businesses choosing certified pre-owned. Better for
              your wallet, better for the planet.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/shop" size="lg">
                Start shopping <ArrowRight className="h-4.5 w-4.5" />
              </ButtonLink>
              <ButtonLink href="/wholesale" variant="secondary" size="lg">
                I&apos;m a business
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
