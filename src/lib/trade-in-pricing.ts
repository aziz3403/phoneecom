import RAW from "@/data/trade-in-prices.json";
import { DEVICES } from "./products";
import { catalogSlugForModel } from "./inventory";

/**
 * Trade-in payouts — the real prices reMint pays sellers — extracted from the
 * Atlas Mobile buyback price book (scripts/extract-trade-in-prices.py →
 * src/data/trade-in-prices.json). Re-run that script whenever a fresh price
 * book is provided to refresh the numbers.
 *
 * Atlas grades a device SWAP/HSO · A · B · C · D · DOA (plus NEW for Samsung),
 * priced per storage and carrier-lock state, with itemised deductions for a
 * cracked back, cracked camera lens and a faulty Face ID. This module resolves
 * each price row to a catalog device and turns the buyer's condition answers
 * into a faithful quote.
 */

// Wholesale grade codes as they appear in the price book.
export type Grade = "swap" | "new" | "a" | "b" | "c" | "d" | "doa";
export type Lock = "unlocked" | "locked" | "att";

export interface PriceRow {
  cat: "iphone" | "samsung" | "ipad";
  model: string;
  gb: number; // 0 = not storage-specific (Samsung is priced per model, not capacity)
  lock: string;
  swap?: number;
  new?: number;
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  doa?: number;
  /** flat $ off for a cracked back glass (iPhone groups) */
  crackedBack?: number;
  /** flat $ off for a cracked camera lens (iPhone groups) */
  crackedLens?: number;
  /** how a bad Face ID is handled for this group: "Parts" | "Grade D" | "ASK" */
  faceId?: string;
}

const ROWS = RAW as PriceRow[];

// ---- model → catalog slug --------------------------------------------------
// "+"→"PLUS" so "Galaxy S24+" (catalog) and "Galaxy S24 Plus" (price book) meet
// and stay distinct from the base "Galaxy S24".
const NORM = (s: string) => s.toUpperCase().replace(/\+/g, "PLUS").replace(/[^A-Z0-9]/g, "");
const CATALOG = DEVICES.map((d) => ({ slug: d.slug, n: NORM(d.name) })).sort(
  (a, b) => b.n.length - a.n.length,
);

// Price-book names the catalog matcher can't bridge (short "Mini 6", "SE (2020)").
const ALIASES: [RegExp, string][] = [
  [/^SE\s*\(?2020\)?/i, "iphone-se-2020"],
  [/^iPhone\s*SE\s*\(?3rd/i, "iphone-se-2022"],
  [/^iPhone\s*17\s*Air\b/i, "iphone-air"],
  [/^Mini\s*6\b/i, "ipad-mini-6"],
  [/^Mini\s*5\b/i, "ipad-mini-5"],
  [/^Mini\s*4\b/i, "ipad-mini-4"],
];

function slugFor(model: string): string | undefined {
  const t = model.trim();
  for (const [re, slug] of ALIASES) if (re.test(t)) return slug;
  // "Plus" models: the catalog spells them "S24+", the price book "S24 Plus" —
  // only here do we need the PLUS-aware match (keeps them distinct from base).
  if (/\bplus\b/i.test(t)) {
    const m = NORM(t);
    for (const c of CATALOG) if (m === c.n || m.startsWith(c.n)) return c.slug;
  }
  // Everything else: the inventory matcher (alias-first, comprehensive for the
  // iPad generations — "iPad 10" → ipad-10th-gen, "iPad Air 5" → ipad-air-5-m1).
  return catalogSlugForModel(t);
}

// slug → its price rows (first match wins for a given storage+lock)
const BY_SLUG: Record<string, PriceRow[]> = {};
for (const r of ROWS) {
  const slug = slugFor(r.model);
  if (!slug) continue;
  (BY_SLUG[slug] ??= []).push(r);
}

// ---- per-device availability ----------------------------------------------
export interface DeviceTradeIn {
  hasData: boolean;
  cat?: PriceRow["cat"];
  rows: PriceRow[];
  storages: number[]; // capacities we have prices for (empty when not storage-specific)
  locks: Lock[]; // carrier states we have prices for
}

export function tradeInForDevice(slug: string): DeviceTradeIn {
  const rows = BY_SLUG[slug] ?? [];
  if (!rows.length) return { hasData: false, rows: [], storages: [], locks: [] };
  const storages = [...new Set(rows.filter((r) => r.gb > 0).map((r) => r.gb))].sort((a, b) => a - b);
  const locks = [...new Set(rows.map((r) => r.lock))].filter(
    (l): l is Lock => l === "unlocked" || l === "locked" || l === "att",
  );
  return { hasData: true, cat: rows[0].cat, rows, storages, locks };
}

/** Pick the row matching a capacity + carrier state, tolerating gaps. */
export function findRow(dev: DeviceTradeIn, gb: number, lock: Lock): PriceRow | undefined {
  const { rows } = dev;
  const lockPref: Lock[] = lock === "unlocked" ? ["unlocked"] : ["locked", "att", "unlocked"];
  // storage-specific (iPhone / iPad)
  if (dev.storages.length) {
    for (const l of lockPref) {
      const hit = rows.find((r) => r.gb === gb && r.lock === l);
      if (hit) return hit;
    }
    // capacity we don't price → nearest available capacity, same lock preference
    for (const l of lockPref) {
      const same = rows.filter((r) => r.lock === l && r.gb > 0).sort((a, b) => a.gb - b.gb);
      if (same.length) {
        return same.reduce((best, r) => (Math.abs(r.gb - gb) < Math.abs(best.gb - gb) ? r : best));
      }
    }
  }
  // not storage-specific (Samsung): match on lock only
  for (const l of lockPref) {
    const hit = rows.find((r) => r.lock === l);
    if (hit) return hit;
  }
  return rows[0];
}

// ---- quote -----------------------------------------------------------------
export interface QuoteInput {
  grade: Grade;
  crackedBack?: boolean;
  crackedLens?: boolean;
  badFaceId?: boolean;
  batteryLow?: boolean; // < 80%
  repairMessage?: boolean;
}
export interface Deduction {
  label: string;
  amount: number;
}
export interface Quote {
  hasPrice: boolean;
  grade: Grade;
  base: number;
  deductions: Deduction[];
  notes: string[];
  total: number;
}

const GRADE_VALUE = (r: PriceRow, g: Grade): number | undefined => r[g];

/** Turn a price row + the buyer's answers into a faithful payout. */
export function quote(r: PriceRow, input: QuoteInput): Quote {
  const notes: string[] = [];
  const deductions: Deduction[] = [];
  let grade = input.grade;
  let base = GRADE_VALUE(r, grade);

  // Bad Face ID follows the group's rule: priced as parts, capped to Grade D, or "ask".
  if (input.badFaceId) {
    const rule = (r.faceId ?? "").toLowerCase();
    if (rule.includes("part")) {
      base = r.doa ?? base;
      grade = "doa";
      notes.push("Face ID fault — priced as parts; final value confirmed on inspection.");
    } else if (rule.includes("grade d") || rule.includes("d")) {
      base = r.d ?? base;
      grade = "d";
      notes.push("Face ID fault — regraded to D.");
    } else {
      notes.push("Face ID fault — subject to deduction, confirmed on inspection.");
    }
  }

  if (base == null) {
    return { hasPrice: false, grade, base: 0, deductions: [], notes, total: 0 };
  }

  if (input.crackedBack && r.crackedBack) {
    deductions.push({ label: "Cracked back glass", amount: r.crackedBack });
  }
  if (input.crackedLens && r.crackedLens) {
    deductions.push({ label: "Cracked camera lens", amount: r.crackedLens });
  }
  if (input.batteryLow) {
    notes.push("Battery health under 80% — subject to deduction, confirmed on inspection.");
  }
  if (input.repairMessage) {
    notes.push("Prior repair / non-genuine part message — subject to deduction.");
  }

  const total = Math.max(0, base - deductions.reduce((s, d) => s + d.amount, 0));
  return { hasPrice: true, grade, base, deductions, notes, total };
}

/** Human labels for the grades, customer-facing. */
export const GRADE_LABEL: Record<Grade, string> = {
  swap: "Like new (sealed / barely used)",
  new: "Brand new",
  a: "Flawless",
  b: "Good",
  c: "Cracked glass",
  d: "Screen fault",
  doa: "Not working",
};
