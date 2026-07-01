import { catalogSlugForModel } from "./inventory";

/**
 * Live trade-in payout prices — "the prices we pay for the items" — pulled from
 * the owner's Google Sheet at runtime, exactly like the storefront inventory
 * feed. The wizard anchors its instant offer to the real top payout for each
 * device instead of a generic formula.
 *
 * The sheet is authored by a human, so the parser is deliberately tolerant: it
 * sniffs out the model / capacity / price columns by header name and copes with
 * the layouts a trade-in price list is actually written in (see
 * `pricingFromCsv`). Anything it can't match simply isn't priced from the sheet
 * and falls back to the catalog formula — so the page never breaks or shows $0.
 */

// Owner's trade-in payout sheet (the prices reMint pays sellers).
export const TRADEIN_SHEET_ID = "1pu4Adxq4MGB6Qour0k__4gBdgnggWRoSVYnJUKgxzEw";
export const TRADEIN_SHEET_URL = `https://docs.google.com/spreadsheets/d/${TRADEIN_SHEET_ID}/edit`;
const CSV_URL = `https://docs.google.com/spreadsheets/d/${TRADEIN_SHEET_ID}/gviz/tq?tqx=out:csv`;

/** Flawless, unlocked payout is the ceiling; lesser conditions scale down from it. */
export interface TradeInPrice {
  /** best ("like new", unlocked) payout we pay for this model, across capacities */
  top: number;
  /** top payout broken out by capacity in GB, when the sheet lists capacities */
  byGb: Record<number, number>;
}
/** keyed by catalog device slug */
export type TradeInPricing = Record<string, TradeInPrice>;

// A plausible trade-in payout in USD. Guards against a stray year / SKU / phone
// number in the sheet being read as a price.
const MIN_PAYOUT = 5;
const MAX_PAYOUT = 3000;

const toNumber = (v: string): number => {
  const n = parseFloat((v || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

/** Capacity cell/header → GB. Bare numbers count ("256" → 256), since a
 *  "Storage" column or a capacity header is known to hold capacities.
 *  "128GB" → 128, "1TB" → 1024, "256" → 256, else 0. */
function parseGbCell(v: string): number {
  const s = (v || "").toUpperCase();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(TB|GB)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return 0;
  return m[2] === "TB" ? Math.round(n * 1024) : Math.round(n);
}

/** Capacity embedded in a free-form model name — requires an explicit GB/TB unit
 *  so "iPhone 13" isn't read as 13GB, and "iPhone 13 128GB" yields 128, not 13. */
function capacityInName(v: string): number {
  const m = (v || "").toUpperCase().match(/(\d+(?:\.\d+)?)\s*(TB|GB)\b/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return 0;
  return m[2] === "TB" ? Math.round(n * 1024) : Math.round(n);
}

// ---- tiny CSV parser (quotes + escaped quotes) -----------------------------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const RE_MODEL = /model|device|phone|handset|tablet|ipad|item|product|^name$|description/i;
const RE_STORAGE = /storage|capacity|^gb$|^size$|memory/i;
const RE_PRICEISH =
  /price|pay|payout|value|amount|quote|offer|cash|paypal|credit|buy|cost|\$|usd|flawless|pristine|mint|excellent|good|fair|poor|cracked|broken|damaged|working|used|grade|^new$|^a\+$|^a$|^ab$|^b$|^c$/i;

function addPrice(
  pricing: TradeInPricing,
  slug: string,
  gb: number,
  price: number,
): void {
  if (!(price >= MIN_PAYOUT && price <= MAX_PAYOUT)) return;
  const entry = (pricing[slug] ??= { top: 0, byGb: {} });
  entry.top = Math.max(entry.top, price);
  if (gb > 0) entry.byGb[gb] = Math.max(entry.byGb[gb] ?? 0, price);
}

/**
 * Build a per-device payout map from a trade-in CSV. Handles the layouts a
 * price list is realistically written in:
 *   • Model | 64 | 128 | 256 …            (capacity columns hold prices)
 *   • Model | Flawless | Good | Fair …    (condition columns hold prices)
 *   • Model | Storage | Price             (one row per model+capacity)
 *   • Model | Price                       (one price per model)
 * Model names may embed the capacity ("iPhone 13 128GB") — we read it out.
 */
export function pricingFromCsv(text: string): TradeInPricing {
  const rows = parseCsv(text).filter((r) => r.some((c) => (c || "").trim() !== ""));
  if (rows.length < 2) return {};
  const header = rows[0].map((h) => (h || "").trim());
  const lower = header.map((h) => h.toLowerCase());

  const modelCol = (() => {
    const named = lower.findIndex((h) => RE_MODEL.test(h));
    if (named >= 0) return named;
    return 0; // fall back to the first column
  })();
  const storageCol = lower.findIndex((h, i) => i !== modelCol && RE_STORAGE.test(h));

  // Which columns carry prices, and (if the header is a capacity) which GB it is.
  const priceCols: { col: number; gb: number }[] = [];
  for (let c = 0; c < header.length; c++) {
    if (c === modelCol || c === storageCol) continue;
    const h = lower[c];
    const gb = parseGbCell(header[c]);
    const headerIsCapacity = gb > 0 && /^\s*\d+(?:\.\d+)?\s*(tb|gb)?\s*$/i.test(header[c]);
    if (headerIsCapacity || RE_PRICEISH.test(h) || h === "") {
      priceCols.push({ col: c, gb: headerIsCapacity ? gb : 0 });
    }
  }
  // Nothing looked like a price column → treat every non-model/storage column as one.
  if (priceCols.length === 0) {
    for (let c = 0; c < header.length; c++) {
      if (c !== modelCol && c !== storageCol) priceCols.push({ col: c, gb: 0 });
    }
  }

  const pricing: TradeInPricing = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const modelRaw = (r[modelCol] || "").trim();
    if (!modelRaw) continue;
    const slug = catalogSlugForModel(modelRaw);
    if (!slug) continue; // model we don't sell → not priced from the sheet

    // capacity from a dedicated column, else read it out of the model name
    const rowGb = storageCol >= 0 ? parseGbCell(r[storageCol] || "") : capacityInName(modelRaw);

    for (const { col, gb } of priceCols) {
      const price = toNumber(r[col] || "");
      if (!Number.isFinite(price)) continue;
      addPrice(pricing, slug, gb || rowGb, price);
    }
  }
  return pricing;
}

/**
 * Fetch the live trade-in payout sheet (revalidated daily). Returns an empty map
 * if the sheet isn't publicly readable or the fetch fails — callers fall back to
 * the catalog-derived estimate so the wizard always has a number to show.
 */
export async function getTradeInPricing(): Promise<TradeInPricing> {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return {};
    const text = await res.text();
    if (/^\s*</.test(text)) return {}; // private sheet → HTML login page, not CSV
    return pricingFromCsv(text);
  } catch {
    return {};
  }
}
