import { getInventory } from "./inventory";
import { DEVICES, type ColorFamily } from "./products";
import type { GradeId } from "./grades";

/**
 * Which variants of a catalog model are actually in the warehouse, derived from
 * the live inventory feed. The PDP uses this to only offer storage / colour /
 * grade combinations that are really in stock (you can't buy what we don't
 * have) instead of every theoretical combination.
 */
export interface VariantAvailability {
  storages: number[];
  families: ColorFamily[];
  grades: GradeId[];
  /** in-stock combinations, keyed `${gb}|${family}|${gradeId}` */
  combos: string[];
  /** true when we have real feed data for this model */
  inStock: boolean;
  /** true when the feed was unusable, so callers should not gate (fail open) */
  degraded: boolean;
}

export function comboKey(gb: number, family: string, grade: string): string {
  return `${gb}|${family}|${grade}`;
}

// Warehouse colour name → catalog ColorFamily. Order matters: real colour
// words win first, and marketing prefixes that usually mean black (Midnight,
// Phantom, Cosmic…) are a FALLBACK — so "Midnight Green" is Green,
// "Phantom White" is White, "Cosmic Orange" is Orange, while plain
// "Midnight" / "Phantom Black" still land on Black.
const FAMILY_RULES: [RegExp, ColorFamily][] = [
  [/TITANIUM/i, "Titanium"],
  [/ROSE\s*GOLD|\bROSE\b|\bPINK\b|BLOSSOM/i, "Pink"],
  [/\bGOLD\b|CHAMPAGNE|BRONZE|COPPER/i, "Gold"],
  [/GRAPHITE|SPACE\s*GR[AE]Y|\bGR[AE]Y\b|GUN\s*METAL|SLATE/i, "Gray"],
  [/STARLIGHT|\bWHITE\b|CREAM|CERAMIC|SNOW|PEARL|MARBLE/i, "White"],
  [/SILVER|PLATINUM/i, "Silver"],
  [/\bBLUE\b|SIERRA|PACIFIC|NAVY|\bIC[EY]\b|SKY|TEAL|CYAN|DENIM|COBALT/i, "Blue"],
  [/GREEN|ALPINE|\bMINT\b|\bLIME\b|SAGE|EMERALD|FOREST/i, "Green"],
  [/PURPLE|VIOLET|LAVENDER|LILAC|ORCHID|PLUM/i, "Purple"],
  [/\bRED\b|CRIMSON|BURGUNDY|SCARLET|MAROON/i, "Red"],
  [/YELLOW/i, "Yellow"],
  [/ORANGE|CORAL|AMBER|PEACH/i, "Orange"],
  [/MIDNIGHT|\bBLACK\b|ONYX|PHANTOM|CARBON|COSMIC|SHADOW|OBSIDIAN|\bJET\b/i, "Black"],
];

export function warehouseFamily(color: string): ColorFamily | null {
  for (const [re, fam] of FAMILY_RULES) if (re.test(color)) return fam;
  return null;
}

export async function getAvailability(slug: string): Promise<VariantAvailability> {
  const device = DEVICES.find((d) => d.slug === slug);
  const catalogDefault: VariantAvailability = {
    storages: device ? device.storage.map((s) => s.gb) : [],
    families: device ? device.colors.map((c) => c.family) : [],
    grades: device ? [device.grade] : [],
    combos: [],
    inStock: false,
    degraded: true,
  };

  let items;
  try {
    items = (await getInventory()).items;
  } catch {
    return catalogDefault; // feed unreachable → don't gate
  }
  if (!items.length) return catalogDefault;

  const storages = new Set<number>();
  const families = new Set<ColorFamily>();
  const grades = new Set<GradeId>();
  const combos = new Set<string>();

  for (const it of items) {
    if (it.renderSlug !== slug) continue;
    const fam = warehouseFamily(it.color);
    for (const chip of it.chips) {
      if (chip.count <= 0) continue;
      storages.add(it.gb);
      grades.add(chip.gradeId);
      if (fam) {
        families.add(fam);
        combos.add(comboKey(it.gb, fam, chip.gradeId));
      }
    }
  }

  // Feed has data but this model has no matching stock → genuinely sold out.
  if (combos.size === 0) {
    return { storages: [], families: [], grades: [], combos: [], inStock: false, degraded: false };
  }

  return {
    storages: [...storages],
    families: [...families],
    grades: [...grades],
    combos: [...combos],
    inStock: true,
    degraded: false,
  };
}
