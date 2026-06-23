import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("mask-fade-x relative flex overflow-hidden", className)}>
      <div className={cn("flex shrink-0 items-center gap-12 pr-12", reverse ? "animate-marquee-rev" : "animate-marquee")}>
        {children}
      </div>
      <div
        aria-hidden
        className={cn("flex shrink-0 items-center gap-12 pr-12", reverse ? "animate-marquee-rev" : "animate-marquee")}
      >
        {children}
      </div>
    </div>
  );
}
