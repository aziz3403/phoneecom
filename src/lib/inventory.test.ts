import { describe, expect, it } from "vitest";
import { catalogSlugForModel, snapshotItems, EXCLUDE_RE } from "./inventory";
import { getDevice } from "./products";

describe("warehouse → catalog model matching", () => {
  it("maps common sheet names onto catalog slugs", () => {
    const cases: Array<[string, string]> = [
      ["IPHONE 14", "iphone-14"],
      ["IPHONE 14 PRO MAX", "iphone-14-pro-max"],
      ["GALAXY S23 (S911U)", "galaxy-s23"],
      // the warehouse's biggest lines — SE generations are named by number
      ["IPHONE SE 2", "iphone-se-2020"],
      ["IPHONE SE 2 (A2275)", "iphone-se-2020"],
      ["IPHONE SE 3", "iphone-se-2022"],
    ];
    for (const [sheet, slug] of cases) {
      expect(catalogSlugForModel(sheet), sheet).toBe(slug);
    }
    // 1st-gen SE isn't in the catalog and must NOT hitch a ride on SE 2/3
    expect(catalogSlugForModel("IPHONE SE")).toBeUndefined();
  });

  it("parses terabyte storage labels as 1024-multiples", () => {
    const tb = snapshotItems().filter((i) => /TB/i.test(i.storageLabel));
    expect(tb.length).toBeGreaterThan(0);
    for (const i of tb) expect(i.gb, `${i.model} ${i.storageLabel}`).toBeGreaterThanOrEqual(1024);
  });

  it("every mapped render slug exists in the catalog", () => {
    for (const item of snapshotItems()) {
      if (item.renderSlug) {
        expect(getDevice(item.renderSlug), `${item.model} → ${item.renderSlug}`).toBeDefined();
      }
    }
  });

  it("excluded stock classes never reach the storefront", () => {
    for (const item of snapshotItems()) {
      expect(EXCLUDE_RE.test(item.model), item.model).toBe(false);
    }
  });
});

describe("inventory snapshot", () => {
  it("parses into non-empty, sane items", () => {
    const items = snapshotItems();
    expect(items.length).toBeGreaterThan(100);
    for (const item of items) {
      expect(item.model).toBeTruthy();
      expect(item.stock).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThanOrEqual(0);
      const chipSum = item.chips.reduce((n, g) => n + g.count, 0);
      expect(chipSum, item.model).toBeLessThanOrEqual(item.stock);
      expect(item.topGrade).toBeTruthy();
    }
  });
});
