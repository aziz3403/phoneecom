export type ClassValue = string | number | null | false | undefined;

/** Lightweight className combiner (clsx-style, no deps). */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((1 - part / whole) * 100);
}
