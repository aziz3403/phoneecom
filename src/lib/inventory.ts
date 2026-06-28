import snapshot from "@/data/inventory-snapshot.json";
import { DEVICES, type Brand, type CameraLayout, type DeviceType } from "./products";
import type { GradeId } from "./grades";

// Map a sheet model string ("IPHONE 13 PRO MAX (A2484)") to a catalog device
// slug so live-inventory cards can reuse the real 3D render. Picks the longest
// catalog name the model name starts with (so "13 Pro Max" beats "13").
const NORM = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
const CATALOG_NORM = DEVICES.map((d) => ({ slug: d.slug, n: NORM(d.name) })).sort(
  (a, b) => b.n.length - a.n.length,
);
function catalogSlugForModel(model: string): string | undefined {
  const m = NORM(model);
  for (const c of CATALOG_NORM) if (m === c.n || m.startsWith(c.n)) return c.slug;
  return undefined;
}

/** Models/colors we never list (parts units, cosmetic-fail, sticker variants, insurance returns). */
export const EXCLUDE_RE = /U\/P|DISCOLOR|HOLOGRAM|ASURION/i;

export interface InvRecord {
  model: string;
  storage: string;
  color: string;
  manufacturer: string;
  // RAW (salvage) grade is intentionally excluded from the storefront.
  grades: { aPlus: number; a: number; ab: number; b: number; c: number; new: number };
  total: number;
  /** optional real photo URL from an "Image"/"Photo" column in the sheet */
  image?: string;
}

export interface GradeChip {
  code: string; // A+, A, AB, B, C, NEW
  count: number;
  gradeId: GradeId;
}

export interface InventoryItem {
  id: string;
  slug: string;
  model: string;
  manufacturer: string;
  brand: Brand; // visual brand (Apple vs other)
  type: DeviceType;
  storageLabel: string;
  gb: number;
  color: string;
  colorHex: string;
  accent: string;
  cameraLayout: CameraLayout;
  stock: number;
  chips: GradeChip[];
  topGrade: GradeId;
  price: number;
  fiveG: boolean;
  image?: string;
  /** catalog slug whose 3D render matches this model (if any) */
  renderSlug?: string;
}

export const SHEET_ID = "13tjQAKJoT4YsWIDRc0phZN2Fjb424FEVyQRHDpd8LOk";
export const SHEET_GID = "1647518731";
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}`;
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

// ---- colour resolver -------------------------------------------------------
const COLOR_MAP: [RegExp, string, string][] = [
  [/BRONZE|COPPER/, "#b08a5e", "#8a6a42"],
  [/GOLD/, "#d4b878", "#b2945a"],
  [/LAVENDER/, "#cfc6da", "#aaa0bc"],
  [/VIOLET|PURPLE/, "#8a7fc4", "#675c9c"],
  [/NAVY/, "#2f3d57", "#212c41"],
  [/ICY|SIERRA|PACIFIC|CLOUD NAVY|PRISM BLUE|BLUE/, "#3f5f8c", "#2c466a"],
  [/MINT|ALPINE|AWESOME LIME|LIME/, "#9fce9a", "#79ab74"],
  [/GREEN/, "#3f6b52", "#2c4f3c"],
  [/BURGUNDY/, "#5c2a33", "#411d24"],
  [/RED/, "#b3303a", "#852430"],
  [/PINK|ROSE/, "#e6b8c2", "#cf94a3"],
  [/YELLOW/, "#e6cf6a", "#c7ad47"],
  [/GRAPHITE|TITANIUM|GRAY|GREY/, "#6b6f76", "#4a4d53"],
  [/SILVER|STARLIGHT|CREAM|WHITE/, "#e3e3df", "#c2c2bd"],
  [/BLACK|GRAPHITE|ONYX|MIDNIGHT|PHANTOM/, "#26282d", "#3d4047"],
];
function resolveColor(name: string): { hex: string; accent: string } {
  const u = name.toUpperCase();
  for (const [re, hex, accent] of COLOR_MAP) if (re.test(u)) return { hex, accent };
  return { hex: "#5b6066", accent: "#3f444a" };
}

// ---- camera layout guess ---------------------------------------------------
function guessCamera(model: string, isApple: boolean): CameraLayout {
  const u = model.toUpperCase();
  if (isApple) {
    if (/IPAD|TAB/.test(u)) return "single";
    return /PRO/.test(u) ? "triple" : "dual";
  }
  if (/FLIP/.test(u)) return "dual";
  if (/FOLD/.test(u)) return "vertical";
  if (/ULTRA|NOTE 20 ULTRA|S20 ULTRA|S21 ULTRA|S22 ULTRA|S23 ULTRA|S24 ULTRA/.test(u)) return "grid";
  if (/NOTE|GALAXY S\d/.test(u)) return "vertical";
  if (/GALAXY A\d|A0\d|A1\d|A2\d|A3\d/.test(u)) return "grid";
  if (/PIXEL/.test(u)) return "bar";
  return "vertical";
}

function isTablet(model: string): boolean {
  return /IPAD|GALAXY TAB|BOOK|TABLET/.test(model.toUpperCase());
}

// ---- price estimate (no prices in sheet; override later via a Price column) -
const PRICE_RULES: [RegExp, number][] = [
  // iPhone
  [/IPHONE 15 PRO MAX/, 1020], [/IPHONE 15 PRO/, 860], [/IPHONE 15 PLUS/, 660], [/IPHONE 15/, 630],
  [/IPHONE 14 PRO MAX/, 730], [/IPHONE 14 PRO/, 650], [/IPHONE 14 PLUS/, 540], [/IPHONE 14/, 500],
  [/IPHONE 13 PRO MAX/, 560], [/IPHONE 13 PRO/, 490], [/IPHONE 13 MINI/, 340], [/IPHONE 13/, 390],
  [/IPHONE 12 PRO MAX/, 430], [/IPHONE 12 PRO/, 380], [/IPHONE 12 MINI/, 250], [/IPHONE 12/, 300],
  [/IPHONE 11 PRO MAX/, 320], [/IPHONE 11 PRO/, 270], [/IPHONE 11/, 220], [/IPHONE SE/, 150], [/IPHONE XR|XS|X /, 180],
  [/IPAD PRO/, 600], [/IPAD AIR/, 400], [/IPAD MINI/, 320], [/IPAD/, 250],
  // Samsung S / Note / Z
  [/S24 ULTRA/, 940], [/S24/, 600], [/S23 ULTRA/, 620], [/S23 FE/, 380], [/S23/, 450],
  [/S22 ULTRA/, 470], [/S22/, 330], [/S21 ULTRA/, 380], [/S21 FE/, 260], [/S21/, 260],
  [/S20 ULTRA/, 330], [/S20 FE/, 230], [/S20 PLUS/, 280], [/S20/, 250],
  [/S10 PLUS/, 200], [/S10E/, 160], [/S10/, 180],
  [/NOTE 20 ULTRA/, 400], [/NOTE 20/, 290], [/NOTE 10 PLUS/, 240], [/NOTE 10/, 200], [/NOTE 9/, 170], [/NOTE 8/, 140],
  [/Z FOLD/, 700], [/Z FLIP/, 360],
  [/GALAXY A5\d/, 220], [/GALAXY A4\d/, 180], [/GALAXY A3\d/, 160], [/GALAXY A2\d/, 120], [/GALAXY A1\d/, 100], [/GALAXY A0\d/, 80],
  [/BOOK/, 280], [/TAB/, 230],
  [/G STYLUS|MOTO|MOTOROLA/, 150],
];
function estimatePrice(model: string, gb: number): number {
  const u = model.toUpperCase();
  let base = 150;
  for (const [re, p] of PRICE_RULES) if (re.test(u)) { base = p; break; }
  const mult = gb >= 1024 ? 1.6 : gb >= 512 ? 1.35 : gb >= 256 ? 1.15 : gb >= 128 ? 1 : gb >= 64 ? 0.9 : 0.8;
  return Math.max(45, Math.round((base * mult) / 5) * 5);
}

const GRADE_TO_ID: Record<string, GradeId> = {
  "A+": "pristine", NEW: "pristine", A: "excellent", AB: "good", B: "good", C: "fair", RAW: "fair",
};

function toItem(r: InvRecord, i: number): InventoryItem {
  const isApple = /APPLE/i.test(r.manufacturer);
  const gb = parseInt(r.storage, 10) || 0;
  const { hex, accent } = resolveColor(r.color);
  const chipDefs: [string, number, GradeId][] = [
    ["A+", r.grades.aPlus, "pristine"],
    ["NEW", r.grades.new, "pristine"],
    ["A", r.grades.a, "excellent"],
    ["AB", r.grades.ab, "good"],
    ["B", r.grades.b, "good"],
    ["C", r.grades.c, "fair"],
  ];
  const chips: GradeChip[] = chipDefs
    .filter(([, count]) => count > 0)
    .map(([code, count, gradeId]) => ({ code, count, gradeId }));
  const topGrade = chips[0]?.gradeId ?? "good";
  const slug = `${r.model}-${r.storage}-${r.color}-${i}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    id: slug,
    slug,
    model: r.model,
    manufacturer: r.manufacturer.replace(/\b\w/g, (c) => c.toUpperCase()),
    brand: isApple ? "Apple" : "Samsung",
    type: isTablet(r.model) ? "tablet" : "phone",
    storageLabel: r.storage,
    gb,
    color: r.color.replace(/\b\w/g, (c) => c.toUpperCase()),
    colorHex: hex,
    accent,
    cameraLayout: guessCamera(r.model, isApple),
    stock: r.total,
    chips,
    topGrade,
    price: estimatePrice(r.model, gb),
    fiveG: /5G/i.test(r.model),
    image: r.image && /^https?:\/\//i.test(r.image) ? r.image : undefined,
    renderSlug: catalogSlugForModel(r.model),
  };
}

export function snapshotItems(): InventoryItem[] {
  return (snapshot as InvRecord[]).filter((r) => r.total > 0).map(toItem);
}

// ---- tiny CSV parser (handles quotes) --------------------------------------
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

function recordsFromCsv(text: string): InvRecord[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h === name.toLowerCase());
  const ci = {
    model: idx("model"), storage: idx("storage"), color: idx("color"), man: idx("manufacturer"),
    aPlus: idx("a+"), a: idx("a"), ab: idx("ab"), b: idx("b"), c: idx("c"), nw: idx("new"), total: idx("total"),
  };
  if (ci.model < 0 || ci.total < 0) return [];
  const imgIdx = header.findIndex((h) => /^(image|photo)(\s*url)?$/.test(h));
  const num = (r: string[], i: number) => (i >= 0 ? parseInt((r[i] || "").trim(), 10) || 0 : 0);
  const out: InvRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const model = (r[ci.model] || "").trim();
    if (!model || /^model$/i.test(model)) continue;
    const color = (r[ci.color] || "").trim();
    if (EXCLUDE_RE.test(model) || EXCLUDE_RE.test(color)) continue; // U/P, discolored, hologram, Asurion
    const grades = {
      aPlus: num(r, ci.aPlus), a: num(r, ci.a), ab: num(r, ci.ab), b: num(r, ci.b), c: num(r, ci.c), new: num(r, ci.nw),
    };
    // RAW excluded entirely — sellable stock is the sum of the kept grades.
    const total = grades.aPlus + grades.a + grades.ab + grades.b + grades.c + grades.new;
    if (total <= 0) continue;
    const image = imgIdx >= 0 ? (r[imgIdx] || "").trim() : undefined;
    out.push({ model, storage: (r[ci.storage] || "").trim(), color, manufacturer: (r[ci.man] || "").trim(), grades, total, image: image || undefined });
  }
  return out;
}

export interface InventoryFeed {
  items: InventoryItem[];
  live: boolean;
  units: number;
}

/**
 * Fetch the live Google Sheet (revalidated daily). Falls back to the committed
 * snapshot if the sheet isn't publicly readable or the fetch fails.
 */
export async function getInventory(): Promise<InventoryFeed> {
  let items = snapshotItems();
  let live = false;
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 86400 } });
    if (res.ok) {
      const text = await res.text();
      // a private sheet returns an HTML login page, not CSV
      if (!/^\s*</.test(text)) {
        const recs = recordsFromCsv(text).filter((r) => r.total > 0);
        if (recs.length > 0) {
          items = recs.map(toItem);
          live = true;
        }
      }
    }
  } catch {
    // keep snapshot
  }
  const units = items.reduce((n, it) => n + it.stock, 0);
  return { items, live, units };
}
