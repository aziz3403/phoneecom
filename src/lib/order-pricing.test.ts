import { describe, expect, it } from "vitest";
import { priceOrder, TAX_RATE } from "./order-pricing";
import { DEVICES, getDevice } from "./products";
import { GRADES } from "./grades";
import { unitPrice } from "./wholesale";
import { EXPRESS_FEE } from "./delivery";
import type { OrderLine } from "./orders";

const device = DEVICES.find((d) => d.storage.length >= 2)!;
const storage = device.storage[1];

function line(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    name: device.name,
    qty: 1,
    gb: storage.gb,
    colorName: device.colors[0].name,
    mode: "retail",
    unit: 1, // deliberately wrong — server must ignore it
    slug: device.slug,
    grade: device.grade,
    ...overrides,
  };
}

describe("priceOrder()", () => {
  it("re-derives retail prices from the catalog, ignoring client numbers", () => {
    const priced = priceOrder([line({ unit: 1 })], false)!;
    expect(priced.lines[0].unit).toBe(storage.price);
    expect(priced.subtotal).toBe(storage.price);
    expect(priced.tax).toBe(Math.round(storage.price * TAX_RATE));
    expect(priced.total).toBe(priced.subtotal + priced.tax);
  });

  it("applies the grade multiplier exactly like the product page", () => {
    const other = (Object.keys(GRADES) as Array<keyof typeof GRADES>).find(
      (g) => g !== device.grade,
    )!;
    const priced = priceOrder([line({ grade: other })], false)!;
    const mult = 1 + (GRADES[other].score - GRADES[device.grade].score) * 0.06;
    expect(priced.lines[0].unit).toBe(Math.round(storage.price * mult));
  });

  it("prices wholesale lines by quantity tier", () => {
    const priced = priceOrder([line({ mode: "wholesale", qty: 100 })], false)!;
    expect(priced.lines[0].unit).toBe(unitPrice(storage.wholesale, 100));
  });

  it("adds the express fee before tax", () => {
    const priced = priceOrder([line()], true)!;
    expect(priced.deliveryCost).toBe(EXPRESS_FEE);
    expect(priced.tax).toBe(Math.round((storage.price + EXPRESS_FEE) * TAX_RATE));
  });

  it("rejects unknown devices, unknown storages and bogus quantities", () => {
    expect(priceOrder([line({ slug: "iphone-9999" })], false)).toBeUndefined();
    expect(priceOrder([line({ gb: 123 })], false)).toBeUndefined();
    expect(priceOrder([line({ qty: 0 })], false)).toBeUndefined();
    expect(priceOrder([line({ qty: -3 })], false)).toBeUndefined();
    expect(priceOrder([line({ qty: NaN })], false)).toBeUndefined();
    expect(priceOrder([], false)).toBeUndefined();
  });

  it("falls back to the device's own grade when the claimed grade is invalid", () => {
    const priced = priceOrder(
      [line({ grade: "diamond" as unknown as OrderLine["grade"] })],
      false,
    )!;
    expect(priced.lines[0].unit).toBe(storage.price);
  });

  it("every catalog device round-trips at its listed price", () => {
    for (const d of DEVICES) {
      const s = d.storage[0];
      const priced = priceOrder(
        [{ name: d.name, qty: 1, gb: s.gb, colorName: "x", mode: "retail", unit: 0, slug: d.slug, grade: d.grade }],
        false,
      );
      expect(priced, d.slug).toBeDefined();
      expect(priced!.lines[0].unit, d.slug).toBe(s.price);
      expect(getDevice(d.slug)).toBe(d);
    }
  });
});
