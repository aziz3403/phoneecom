/**
 * One-off data audit runner (not a permanent gate): cross-checks the
 * warehouse snapshot, catalog, color photos and trade-in book, and prints a
 * findings report. Run: npx vitest run src/test/data-audit.test.ts
 */
import { describe, it } from "vitest";
import { snapshotItems, catalogSlugForModel } from "../lib/inventory";
import { warehouseFamily } from "../lib/availability";
import { DEVICES, getDevice, colorSlug } from "../lib/products";
import { tradeInModelsFromSnapshot, findRow } from "../lib/trade-in-pricing";
import colorPhotos from "../data/color-photos.json";

describe("data audit", () => {
  it("prints the cross-check report", () => {
    const items = snapshotItems();
    const out: string[] = [];

    // 1. Warehouse stock that maps to NO catalog listing (we own it, can't sell it)
    const unmapped = new Map<string, number>();
    for (const i of items) {
      if (!i.renderSlug || !getDevice(i.renderSlug)) {
        unmapped.set(i.model, (unmapped.get(i.model) ?? 0) + i.stock);
      }
    }
    out.push(`--- warehouse models with NO catalog listing (${unmapped.size} models, ${[...unmapped.values()].reduce((a, b) => a + b, 0)} units) ---`);
    for (const [m, n] of [...unmapped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) out.push(`  ${String(n).padStart(4)}× ${m}`);

    // 2. Catalog devices with ZERO warehouse stock (render as out of stock)
    const stockBySlug = new Map<string, number>();
    for (const i of items) if (i.renderSlug) stockBySlug.set(i.renderSlug, (stockBySlug.get(i.renderSlug) ?? 0) + i.stock);
    const zero = DEVICES.filter((d) => !stockBySlug.has(d.slug));
    out.push(`--- catalog devices with zero warehouse stock (${zero.length}/${DEVICES.length}) ---`);
    out.push("  " + zero.map((d) => d.slug).join(", "));

    // 3. Warehouse colors that don't exist on the mapped catalog device
    out.push(`--- warehouse color → catalog family mismatches ---`);
    let colorMiss = 0;
    for (const i of items) {
      if (!i.renderSlug) continue;
      const d = getDevice(i.renderSlug);
      if (!d) continue;
      const fam = warehouseFamily(i.color);
      if (!fam) { out.push(`  UNPARSED color "${i.color}" (${i.model})`); colorMiss++; continue; }
      if (!d.colors.some((c) => c.family === fam)) {
        out.push(`  ${i.model} → ${d.slug}: warehouse color "${i.color}" (${fam}) not on catalog device [${[...new Set(d.colors.map((c) => c.family))].join(",")}] · ${i.stock}u`);
        colorMiss++;
      }
    }
    if (!colorMiss) out.push("  none 🎉");

    // 4. Warehouse GBs missing from the catalog device's storage options
    out.push(`--- warehouse capacity missing on catalog device ---`);
    let gbMiss = 0;
    for (const i of items) {
      if (!i.renderSlug || !i.gb) continue;
      const d = getDevice(i.renderSlug);
      if (!d) continue;
      if (!d.storage.some((s) => s.gb === i.gb)) {
        out.push(`  ${d.slug}: warehouse has ${i.gb}GB (${i.stock}u), catalog sells [${d.storage.map((s) => s.gb).join(",")}]`);
        gbMiss++;
      }
    }
    if (!gbMiss) out.push("  none 🎉");

    // 5. Catalog price sanity
    out.push(`--- catalog price sanity ---`);
    let priceBad = 0;
    for (const d of DEVICES) {
      for (const s of d.storage) {
        if (!(s.price > 0) || !(s.original > s.price) || !(s.wholesale > 0) || !(s.wholesale <= s.price)) {
          out.push(`  ${d.slug} ${s.gb}GB: price=${s.price} original=${s.original} wholesale=${s.wholesale}`);
          priceBad++;
        }
      }
    }
    if (!priceBad) out.push("  all good 🎉");

    // 6. color-photos.json entries that don't resolve
    out.push(`--- color-photos entries that don't resolve ---`);
    let photoBad = 0;
    for (const key of colorPhotos as string[]) {
      const [slug, cslug] = key.split("::");
      const d = getDevice(slug);
      if (!d) { out.push(`  unknown device: ${key}`); photoBad++; continue; }
      if (!d.colors.some((c) => colorSlug(c.name) === cslug)) { out.push(`  unknown color: ${key}`); photoBad++; }
    }
    if (!photoBad) out.push("  all resolve 🎉");

    // 7. Trade-in book coverage
    out.push(`--- trade-in book checks ---`);
    const models = tradeInModelsFromSnapshot();
    let tiBad = 0;
    for (const m of models) {
      if (m.storages.length === 0 && m.rows.every((r) => !r.gb)) {
        // storage-less models are fine (priced flat) — check they have any priced row
      }
      const probe = m.storages[0] ?? 0;
      for (const lock of m.locks) {
        const row = findRow(m, probe, lock);
        if (!row) { out.push(`  ${m.name}: no row for ${probe}GB/${lock}`); tiBad++; continue; }
        const anyPrice = [row.swap, row.new, row.a, row.b, row.c, row.d, row.doa].some((v) => v != null && v > 0);
        if (!anyPrice) { out.push(`  ${m.name} ${probe}GB/${lock}: all grades null/zero`); tiBad++; }
      }
      if (m.catalogSlug && !getDevice(m.catalogSlug)) { out.push(`  ${m.name}: bad catalogSlug ${m.catalogSlug}`); tiBad++; }
    }
    if (!tiBad) out.push(`  all ${models.length} models priceable 🎉`);

    console.log("\n" + out.join("\n") + "\n");
  });
});
