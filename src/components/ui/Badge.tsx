import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GRADES, type GradeId } from "@/lib/grades";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "mint" | "glacier" | "amber";
}) {
  const tones = {
    neutral: "bg-[#f5f5f7] text-[#6e6e73]",
    brand: "bg-[rgba(10,143,110,.1)] text-[#0a8f6e]",
    mint: "bg-[rgba(10,143,110,.1)] text-[#0a8f6e]",
    glacier: "bg-[rgba(38,165,168,.12)] text-[#1f7f82]",
    amber: "bg-[rgba(245,166,35,.14)] text-[#9a6a00]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A light, legible grade pill: neutral chip + a small grade-coloured dot. */
export function GradeBadge({
  grade,
  size = "md",
  showDot = true,
  className,
}: {
  grade: GradeId;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}) {
  const g = GRADES[grade];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] font-semibold tracking-wide text-[#1d1d1f]",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: g.hex }}
        />
      )}
      {g.label}
    </span>
  );
}
