import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-[1280px] px-[22px] py-20 sm:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-2xl items-start text-left",
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="text-[clamp(28px,4vw,46px)] font-bold leading-[1.07] tracking-[-.025em] text-[#1d1d1f]">
        {title}
      </h2>
      {subtitle && <p className="text-[17px] leading-relaxed text-[#6e6e73] sm:text-[19px]">{subtitle}</p>}
    </Reveal>
  );
}
