import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 via-brand-400 to-glacier-400 text-white shadow-[0_10px_40px_-10px_rgba(116,48,255,.8)] hover:shadow-[0_14px_50px_-8px_rgba(116,48,255,.9)] hover:-translate-y-0.5",
  secondary:
    "glass-strong text-white hover:bg-white/10 hover:-translate-y-0.5",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
  outline:
    "border border-white/15 text-white hover:border-brand-400/60 hover:bg-brand-500/10 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
