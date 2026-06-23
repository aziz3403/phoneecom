export interface WholesaleTier {
  id: string;
  label: string;
  min: number;
  max: number | null; // null = no upper bound
  discount: number; // fraction off the base wholesale unit price
  blurb: string;
  perks: string[];
}

/** Minimum order quantity to unlock trade pricing. */
export const MOQ = 5;

/**
 * Five volume tiers. The base wholesale price on each phone is the Starter
 * (5–24 unit) price; larger commitments unlock progressively deeper discounts.
 */
export const WHOLESALE_TIERS: WholesaleTier[] = [
  {
    id: "starter",
    label: "Starter",
    min: 5,
    max: 24,
    discount: 0,
    blurb: "Test the waters with small mixed lots.",
    perks: ["Trade pricing unlocked", "Mixed-model lots", "Net-7 terms"],
  },
  {
    id: "reseller",
    label: "Reseller",
    min: 25,
    max: 99,
    discount: 0.06,
    blurb: "For active resellers and repair shops.",
    perks: ["6% volume discount", "Priority grading", "Net-15 terms"],
  },
  {
    id: "business",
    label: "Business",
    min: 100,
    max: 249,
    discount: 0.12,
    blurb: "Outfit teams and stock storefronts.",
    perks: ["12% volume discount", "Dedicated account rep", "Net-30 terms"],
  },
  {
    id: "distributor",
    label: "Distributor",
    min: 250,
    max: 499,
    discount: 0.18,
    blurb: "Regional distribution at scale.",
    perks: ["18% volume discount", "Custom grading specs", "Blind drop-ship"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    min: 500,
    max: null,
    discount: 0.24,
    blurb: "Carrier, MVNO and enterprise volume.",
    perks: ["24%+ volume discount", "Locked quarterly pricing", "API & EDI feeds"],
  },
];

export function tierForQty(qty: number): WholesaleTier {
  // highest tier whose minimum is satisfied
  let match = WHOLESALE_TIERS[0];
  for (const t of WHOLESALE_TIERS) {
    if (qty >= t.min) match = t;
  }
  return match;
}

/** Per-unit wholesale price for a given base price and quantity. */
export function unitPrice(base: number, qty: number): number {
  const tier = tierForQty(qty);
  return Math.round(base * (1 - tier.discount));
}

export function nextTier(qty: number): WholesaleTier | null {
  return WHOLESALE_TIERS.find((t) => t.min > qty) ?? null;
}
