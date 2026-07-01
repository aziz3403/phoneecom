import SNAPSHOT from "@/data/trade-in-prices.json";
import { DEVICES } from "./products";
import { catalogSlugForModel } from "./inventory";

/**
 * Trade-in payouts — the real prices reMint pays sellers — from the Atlas Mobile
 * buyback price book. The committed snapshot (src/data/trade-in-prices.json,
 * built by scripts/extract-trade-in-prices.py) is the baseline; in production we
 * additionally re-fetch the owner's live sheet once a day and, when it parses
 * cleanly, use that instead so prices stay current. If the live sheet is
 * unreachable or looks wrong we keep the snapshot, so the page never breaks.
 *
 * Atlas grades each device SWAP/HSO · A · B · C · D · DOA (plus NEW for Samsung),
 * priced per storage and carrier-lock state, with itemised deductions for a
 * cracked back, cracked lens and a faulty Face ID.
 */

export type Grade = "swap" | "new" | "a" | "b" | "c" | "d" | "doa";
export type Lock = "unlocked" | "locked" | "att";

export interface PriceRow {
  cat: "iphone" | "samsung" | "ipad";
  model: string;
  gb: number; // 0 = not storage-specific (Samsung is priced per model)
  lock: string;
  swap?: number | null;
  new?: number | null;
  a?: number | null;
  b?: number | null;
  c?: number | null;
  d?: number | null;
  doa?: number | null;
  crackedBack?: number;
  crackedLens?: number;
  faceId?: string;
}

/** One tradeable model, grouping its price rows across storage & lock. */
export interface TradeInModel {
  key: string;
  cat: PriceRow["cat"];
  group: "iPhone" | "iPad" | "Galaxy";
  name: string;
  storages: number[];
  locks: Lock[];
  colors: { name: string; hex: string; image?: string }[];
  catalogSlug?: string;
  image?: string;
  rows: PriceRow[];
}

/** Flat deduction for a battery under 80% health. */
export const BATTERY_DEDUCTION = 15;
/** Free prepaid shipping kicks in at this many devices in one trade-in. */
export const FREE_SHIP_MIN = 5;

// Fallback colour palette for models the catalog doesn't carry a swatch for.
const DEFAULT_COLORS = [
  { name: "Black", hex: "#26282d" },
  { name: "White", hex: "#e8e8e6" },
  { name: "Silver", hex: "#d9dbdd" },
  { name: "Blue", hex: "#3f5f8c" },
  { name: "Green", hex: "#3f6b52" },
  { name: "Gold", hex: "#d4b878" },
  { name: "Purple", hex: "#8a7fc4" },
  { name: "Red", hex: "#b3303a" },
  { name: "Pink", hex: "#e6b8c2" },
  { name: "Other", hex: "#8b9099" },
];

// ---- live sheet config -----------------------------------------------------
// Owner's buyback sheet. Override the id via env without a code change; the tab
// names must match the workbook the snapshot was built from.
const SHEET_ID = process.env.TRADEIN_SHEET_ID || "1pu4Adxq4MGB6Qour0k__4gBdgnggWRoSVYnJUKgxzEw";
const TAB_URL = (sheet: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;

// ---- cell helpers ----------------------------------------------------------
function money(v: unknown): number | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /#(num|ref|value)/i.test(s) || /not buying|\bask\b|n\/?a/i.test(s)) return undefined;
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? Math.round(parseFloat(m[0])) : undefined;
}
function gbOf(s: string): number {
  const m = (s || "").toUpperCase().match(/(\d+(?:\.\d+)?)\s*(TB|GB)\b/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2] === "TB" ? Math.round(n * 1024) : Math.round(n);
}
function lockOf(s: string): Lock | null {
  const u = (s || "").toLowerCase();
  if (u.includes("unlocked")) return "unlocked";
  if (u.includes("at&t") || /\batt\b/.test(u)) return "att";
  if (u.includes("locked")) return "locked";
  return null;
}
function parseDed(note: string): Partial<PriceRow> {
  const d: Partial<PriceRow> = {};
  let m = note.match(/Cracked Back\s*=\s*\$?(\d+)/i);
  if (m) d.crackedBack = parseInt(m[1], 10);
  m = note.match(/Cracked Lens\s*=\s*\$?(\d+)/i);
  if (m) d.crackedLens = parseInt(m[1], 10);
  m = note.match(/Bad Face ID\s*=\s*([A-Za-z ]+?)(?:\s*\/|$)/i);
  if (m) d.faceId = m[1].trim();
  return d;
}

// ---- CSV parser (quotes + escaped quotes) ----------------------------------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// ---- per-tab row parsers (mirror scripts/extract-trade-in-prices.py) --------
const hasCap = (s: string) => /\d+\s*(GB|TB)/i.test(s);
const stripCap = (s: string) => s.replace(/\s*\d+\s*(GB|TB).*$/i, "").trim();

// Anchor on header labels so the parsers survive a leading empty column or a
// gviz export that drops one — the price grid is always contiguous from the
// model column, so we locate one landmark and read relative to it.
const findCol = (rows: string[][], pred: (c: string) => boolean, fallback: number): number => {
  for (const r of rows) {
    const i = r.findIndex((c) => pred((c ?? "").trim()));
    if (i >= 0) return i;
  }
  return fallback;
};

export function parseIphone(rows: string[][]): PriceRow[] {
  const out: PriceRow[] = [];
  // Model | SWAP/HSO | Grade A | B | C | D | DOA  (contiguous from the model col)
  const mc = findCol(rows, (c) => c.toLowerCase() === "model", 1);
  let ded: Partial<PriceRow> = {};
  for (const r of rows) {
    const b = (r[mc] ?? "").trim();
    if (b.includes("Cracked Back")) { ded = parseDed(b); continue; }
    if (!b || b.toLowerCase() === "model" || !hasCap(b)) continue;
    const lock = lockOf(b);
    if (!lock) continue;
    out.push({
      cat: "iphone", model: stripCap(b), gb: gbOf(b), lock,
      swap: money(r[mc + 1]), a: money(r[mc + 2]), b: money(r[mc + 3]),
      c: money(r[mc + 4]), d: money(r[mc + 5]), doa: money(r[mc + 6]),
      ...ded,
    });
  }
  return out;
}

export function parseSamsung(rows: string[][]): PriceRow[] {
  const out: PriceRow[] = [];
  // header row: NEW | A | B | C | D | DOA ; model is two cols left, variant one left
  const nc = findCol(rows, (c) => c.toUpperCase() === "NEW", 3);
  const mc = Math.max(0, nc - 2);
  const vc = Math.max(0, nc - 1);
  let model: string | null = null;
  for (const r of rows) {
    const b = (r[mc] ?? "").trim();
    const v = (r[vc] ?? "").trim();
    // Model is in col B on the section-title AND data rows, but older models
    // drop the "Galaxy" prefix ("S22 Ultra") — take it whenever present and
    // normalise. The NEW|A|B|C|D|DOA header row has an empty model col.
    if (b) model = /^galaxy/i.test(b) ? b : `Galaxy ${b}`;
    const lock = lockOf(v);
    if (!lock || !model) continue;
    out.push({
      cat: "samsung", model, gb: 0, lock,
      new: money(r[nc]), a: money(r[nc + 1]), b: money(r[nc + 2]),
      c: money(r[nc + 3]), d: money(r[nc + 4]), doa: money(r[nc + 5]),
    });
  }
  return out;
}

export function parseIpad(rows: string[][]): PriceRow[] {
  const out: PriceRow[] = [];
  // header row: Grade A | Grade B | Grade C | Grade D | DOA ; model is one col left
  const ga = findCol(rows, (c) => /^grade a$/i.test(c), 2);
  const mc = Math.max(0, ga - 1);
  for (const r of rows) {
    const b = (r[mc] ?? "").trim();
    if (!b || /^grade/i.test(b) || /grade a/i.test(r[ga] ?? "")) continue;
    if (!hasCap(b)) continue;
    out.push({
      cat: "ipad", model: stripCap(b), gb: gbOf(b), lock: "unlocked",
      a: money(r[ga]), b: money(r[ga + 1]), c: money(r[ga + 2]), d: money(r[ga + 3]), doa: money(r[ga + 4]),
    });
  }
  return out;
}

// ---- model → catalog slug (for the 3D render) ------------------------------
const NORM = (s: string) => s.toUpperCase().replace(/\+/g, "PLUS").replace(/[^A-Z0-9]/g, "");
const CATALOG = DEVICES.map((d) => ({ slug: d.slug, n: NORM(d.name) })).sort((a, b) => b.n.length - a.n.length);
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
  if (/\bplus\b/i.test(t)) {
    const m = NORM(t);
    for (const c of CATALOG) if (m === c.n || m.startsWith(c.n)) return c.slug;
  }
  return catalogSlugForModel(t);
}

// ---- model list ------------------------------------------------------------
const GROUP: Record<PriceRow["cat"], TradeInModel["group"]> = {
  iphone: "iPhone", ipad: "iPad", samsung: "Galaxy",
};
const isLock = (l: string): l is Lock => l === "unlocked" || l === "locked" || l === "att";

function buildModels(rows: PriceRow[]): TradeInModel[] {
  const order: string[] = [];
  const groups = new Map<string, PriceRow[]>();
  for (const r of rows) {
    const k = `${r.cat}|${r.model}`;
    if (!groups.has(k)) { groups.set(k, []); order.push(k); }
    groups.get(k)!.push(r);
  }
  return order.map((k) => {
    const rs = groups.get(k)!;
    const first = rs[0];
    const catalogSlug = slugFor(first.model);
    const dev = catalogSlug ? DEVICES.find((d) => d.slug === catalogSlug) : undefined;
    const colors = dev?.colors?.length
      ? dev.colors.map((c) => ({ name: c.name, hex: c.hex, image: c.image }))
      : DEFAULT_COLORS;
    return {
      key: `${first.cat}:${NORM(first.model)}`,
      cat: first.cat,
      group: GROUP[first.cat],
      name: first.model,
      storages: [...new Set(rs.filter((r) => r.gb > 0).map((r) => r.gb))].sort((a, b) => a - b),
      locks: [...new Set(rs.map((r) => r.lock))].filter(isLock),
      colors,
      catalogSlug,
      image: dev?.image,
      rows: rs,
    };
  });
}

// ---- live fetch (daily) + snapshot fallback --------------------------------
async function fetchTab(sheet: string): Promise<string[][] | null> {
  try {
    const res = await fetch(TAB_URL(sheet), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const text = await res.text();
    if (/^\s*</.test(text)) return null; // private sheet → HTML login page
    return parseCsv(text);
  } catch {
    return null;
  }
}

// A live parse is only trusted if it looks structurally right — enough rows,
// most iPhones carrying a numeric Grade-A price, and known anchor models pricing
// sanely. A different sheet layout produces nulls/garbage, which this rejects so
// we keep the verified snapshot instead of ever quoting $0.
function validLive(rows: PriceRow[]): boolean {
  if (rows.length < 300) return false;
  const iph = rows.filter((r) => r.cat === "iphone");
  const withA = iph.filter((r) => typeof r.a === "number" && (r.a as number) > 0).length;
  if (iph.length < 100 || withA / iph.length < 0.7) return false;
  const anchor = (model: string, gb: number) => {
    const r = rows.find((x) => x.cat === "iphone" && x.model === model && x.gb === gb && x.lock === "unlocked");
    const v = r?.a;
    return typeof v === "number" && v > 30 && v < 3000;
  };
  return anchor("iPhone 13", 128) && anchor("iPhone 15", 128);
}

async function liveRows(): Promise<PriceRow[] | null> {
  // Opt-in: the committed snapshot (built from the owner's price book) is the
  // trusted source. Set TRADEIN_LIVE=1 only once the live sheet is confirmed to
  // match the book's tab layout, so a mismatched sheet can never mis-price.
  if (process.env.TRADEIN_LIVE !== "1") return null;
  const [ip, sm, ip2] = await Promise.all([
    fetchTab("iPhone Used"), fetchTab("Samsung"), fetchTab("iPad Used"),
  ]);
  if (!ip || !sm || !ip2) return null;
  const rows = [...parseIphone(ip), ...parseSamsung(sm), ...parseIpad(ip2)];
  return validLive(rows) ? rows : null;
}

/** All tradeable models, live when possible and current within a day. */
export async function getTradeInModels(): Promise<{ models: TradeInModel[]; live: boolean }> {
  const live = await liveRows();
  const rows = (live ?? (SNAPSHOT as PriceRow[])) as PriceRow[];
  return { models: buildModels(rows), live: !!live };
}

/** Snapshot-only build (sync) — for tests / non-async callers. */
export function tradeInModelsFromSnapshot(): TradeInModel[] {
  return buildModels(SNAPSHOT as PriceRow[]);
}

// ---- lookup + quote --------------------------------------------------------
/** True when at least one grade column carries a positive price. */
function priceable(r: PriceRow): boolean {
  return [r.swap, r.new, r.a, r.b, r.c, r.d, r.doa].some((v) => v != null && v > 0);
}

export function findRow(model: TradeInModel, gb: number, lock: Lock): PriceRow | undefined {
  const rows = model.rows;
  // Prefer the exact tier asked for, then fall back sensibly. AT&T-locked has
  // its own (lower) price, so an AT&T request must try "att" before generic
  // "locked". Unlocked also falls back to the locked book — some brand-new
  // models are only priced locked, and quoting the (lower) locked price is
  // safe: we re-quote UP after inspection when the device turns out unlocked.
  const pref: Lock[] =
    lock === "unlocked"
      ? ["unlocked", "locked", "att"]
      : lock === "att"
        ? ["att", "locked", "unlocked"]
        : ["locked", "att", "unlocked"];
  // Rows with every grade empty (placeholder book lines) are never candidates.
  const usable = rows.filter(priceable);
  if (model.storages.length) {
    for (const l of pref) { const hit = usable.find((r) => r.gb === gb && r.lock === l); if (hit) return hit; }
    for (const l of pref) {
      const same = usable.filter((r) => r.lock === l && r.gb > 0).sort((a, b) => a.gb - b.gb);
      if (same.length) return same.reduce((best, r) => (Math.abs(r.gb - gb) < Math.abs(best.gb - gb) ? r : best));
    }
  }
  for (const l of pref) { const hit = usable.find((r) => r.lock === l); if (hit) return hit; }
  return usable[0] ?? rows[0];
}

export interface QuoteInput {
  grade: Grade;
  crackedBack?: boolean;
  crackedLens?: boolean;
  badFaceId?: boolean;
  batteryLow?: boolean;
  repairMessage?: boolean;
}
export interface Deduction { label: string; amount: number; }
export interface Quote {
  hasPrice: boolean;
  grade: Grade;
  base: number;
  deductions: Deduction[];
  notes: string[];
  total: number;
}

export function quote(r: PriceRow, input: QuoteInput): Quote {
  const notes: string[] = [];
  const deductions: Deduction[] = [];
  let grade = input.grade;
  let base = r[grade];

  if (input.badFaceId) {
    const rule = (r.faceId ?? "").toLowerCase();
    if (rule.includes("part")) {
      base = r.doa ?? base; grade = "doa";
      notes.push("Face ID fault — priced at our parts rate. We confirm it free when we inspect, so there are no surprises.");
    } else if (rule.includes("d")) {
      base = r.d ?? base; grade = "d";
      notes.push("Face ID fault — regraded to D. We confirm it free when we inspect.");
    } else {
      notes.push("Face ID fault — a deduction applies; we confirm the exact amount free when we inspect it.");
    }
  }

  if (base == null) return { hasPrice: false, grade, base: 0, deductions: [], notes, total: 0 };

  if (input.crackedBack && r.crackedBack) deductions.push({ label: "Cracked back glass", amount: r.crackedBack });
  if (input.crackedLens && r.crackedLens) deductions.push({ label: "Cracked camera lens", amount: r.crackedLens });
  if (input.batteryLow) deductions.push({ label: "Battery under 80%", amount: BATTERY_DEDUCTION });
  if (input.repairMessage) notes.push("Prior repair / non-genuine part message — a deduction may apply; we confirm it free when we inspect it.");

  const total = Math.max(0, base - deductions.reduce((s, d) => s + d.amount, 0));
  return { hasPrice: true, grade, base, deductions, notes, total };
}

export const GRADE_TAG: Record<Grade, string> = {
  swap: "Like new", new: "Brand new", a: "Grade A · Flawless", b: "Grade B · Good",
  c: "Grade C · Cracked glass", d: "Grade D · Screen fault", doa: "Not working",
};
