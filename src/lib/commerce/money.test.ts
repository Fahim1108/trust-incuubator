import { describe, expect, it } from "vitest";
import { effectivePrice, lineTotal, percentageDiscount } from "./money";
describe("BDT minor-unit calculations", () => {
  it("multiplies unit prices without fractional currency", () => expect(lineTotal(125050, 3)).toBe(375150));
  it("uses a valid sale price including zero", () => { expect(effectivePrice(10000, 8000)).toBe(8000); expect(effectivePrice(10000, 0)).toBe(0); });
  it("preserves regular prices", () => expect(effectivePrice(10000, null)).toBe(10000));
  it("rejects invalid sale prices", () => expect(() => effectivePrice(100, 101)).toThrow());
  it("rounds discounts down to whole poisha", () => expect(percentageDiscount(999, 1500)).toBe(149));
  it("calculates large discounts without intermediate precision loss", () => expect(percentageDiscount(Number.MAX_SAFE_INTEGER, 10000)).toBe(Number.MAX_SAFE_INTEGER));
  it("rejects invalid prices and quantities", () => { for (const price of [-1, 0.1, NaN, Infinity]) expect(() => lineTotal(price, 1)).toThrow(); for (const quantity of [0, -1, 1.5]) expect(() => lineTotal(100, quantity)).toThrow(); });
  it("rejects overflowing totals", () => expect(() => lineTotal(Number.MAX_SAFE_INTEGER, 2)).toThrow());
  it("rejects invalid discount percentages", () => { for (const rate of [-1, 10001, 1.5]) expect(() => percentageDiscount(100, rate)).toThrow(); });
});
