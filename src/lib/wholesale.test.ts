import { describe, expect, it } from "vitest";
import { MOQ, WHOLESALE_TIERS, tierForQty, unitPrice, nextTier } from "./wholesale";

describe("wholesale tiers", () => {
  it("tiers are contiguous from the MOQ up", () => {
    expect(WHOLESALE_TIERS[0].min).toBe(MOQ);
    for (let i = 1; i < WHOLESALE_TIERS.length; i++) {
      expect(WHOLESALE_TIERS[i].min).toBe((WHOLESALE_TIERS[i - 1].max ?? NaN) + 1);
    }
    expect(WHOLESALE_TIERS.at(-1)!.max).toBeNull();
  });

  it("picks the highest tier whose minimum is met", () => {
    expect(tierForQty(5).id).toBe("starter");
    expect(tierForQty(24).id).toBe("starter");
    expect(tierForQty(25).id).toBe("reseller");
    expect(tierForQty(99).id).toBe("reseller");
    expect(tierForQty(100).id).toBe("business");
    expect(tierForQty(250).id).toBe("distributor");
    expect(tierForQty(500).id).toBe("enterprise");
    expect(tierForQty(10_000).id).toBe("enterprise");
  });

  it("applies the tier discount to the unit price, rounded", () => {
    expect(unitPrice(100, 5)).toBe(100); // starter: 0%
    expect(unitPrice(100, 25)).toBe(94); // 6%
    expect(unitPrice(100, 100)).toBe(88); // 12%
    expect(unitPrice(100, 250)).toBe(82); // 18%
    expect(unitPrice(100, 500)).toBe(76); // 24%
    expect(unitPrice(333, 25)).toBe(Math.round(333 * 0.94));
  });

  it("discounts never increase the price and grow monotonically", () => {
    let last = Infinity;
    for (const q of [5, 25, 100, 250, 500]) {
      const p = unitPrice(999, q);
      expect(p).toBeLessThanOrEqual(999);
      expect(p).toBeLessThanOrEqual(last);
      last = p;
    }
  });

  it("nextTier points at the next threshold and null at the top", () => {
    expect(nextTier(5)!.id).toBe("reseller");
    expect(nextTier(499)!.id).toBe("enterprise");
    expect(nextTier(500)).toBeNull();
  });
});
