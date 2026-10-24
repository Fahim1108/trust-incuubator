import { describe, expect, it } from "vitest";
import { formatBdt, getProductPrice } from "./pricing";
describe("catalogue display prices in integer poisha", () => {
  it("formats BDT and poisha without floating-point division", () => {
    expect(formatBdt(189000)).toBe("৳ 1,890");
    expect(formatBdt(189005)).toBe("৳ 1,890.05");
    expect(formatBdt(0)).toBe("৳ 0");
    expect(formatBdt(Number.MAX_SAFE_INTEGER)).toBe("৳ 90,071,992,547,409.91");
  });
  it("rejects unsafe or negative money values", () => {
    for (const value of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1])
      expect(() => formatBdt(value)).toThrow();
  });
  it("does not invent a price when active variants are missing", () => {
    expect(getProductPrice([])).toBeNull();
    expect(
      getProductPrice([
        { price_minor: 10, sale_price_minor: null, active: false },
      ]),
    ).toBeNull();
  });
  it("shows the sale and original price of a single active variant", () => {
    expect(
      getProductPrice([
        { price_minor: 249000, sale_price_minor: 189000, active: true },
      ]),
    ).toEqual({ priceMinor: 189000, regularMinor: 249000, from: false });
  });
  it("uses the cheapest active variant without misleading crossed-out prices", () => {
    expect(
      getProductPrice([
        { price_minor: 249000, sale_price_minor: 189000, active: true },
        { price_minor: 179000, sale_price_minor: null, active: true },
        { price_minor: 1, sale_price_minor: null, active: false },
      ]),
    ).toEqual({ priceMinor: 179000, regularMinor: null, from: true });
  });
  it("rejects an invalid sale amount", () => {
    expect(() =>
      getProductPrice([
        { price_minor: 100, sale_price_minor: 101, active: true },
      ]),
    ).toThrow();
  });
});
