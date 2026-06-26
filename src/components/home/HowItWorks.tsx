import { PackageSearch, ScanLine, BadgeCheck, Truck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: PackageSearch,
    title: "We source smart",
    body: "Trade-ins, lease returns and overstock — vetted at the supplier before they ever reach our lab.",
  },
  {
    icon: ScanLine,
    title: "50-point inspection",
    body: "Battery, board, cameras, cellular, biometrics and more. Data is wiped to factory standards.",
  },
  {
    icon: BadgeCheck,
    title: "Honest grading",
    body: "Real photos and a transparent cosmetic grade — no surprises when it lands on your desk.",
  },
  {
    icon: Truck,
    title: "Warranty & ship",
    body: "12-month warranty, 14-day RMA, free carbon-neutral 2-day delivery on every order.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading
        eyebrow="The reMint standard"
        title={<>From someone&apos;s pocket to <span className="text-gradient">like-new</span></>}
        subtitle="A used phone is only as good as the process behind it. Here's exactly what every device goes through before it earns the reMint name."
      />

      <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* connecting line */}
        <div className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <div className="group relative h-full rounded-3xl border border-white/10 bg-ink-850/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/40">
              <div className="relative z-10 mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-glacier-400/10 ring-1 ring-white/10">
                <s.icon className="h-7 w-7 text-brand-200" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-glacier-400 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
