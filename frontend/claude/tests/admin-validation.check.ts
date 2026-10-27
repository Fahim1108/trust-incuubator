import { describe, it, expect } from "vitest";
import {
  draftSchema,
  toMinorUnits,
  rolesSchema,
  totpSchema,
} from "../src/lib/admin/validation";
const draft = {
  id: "00000000-0000-4000-8000-000000000001",
  updated_at: "2026-10-27T00:00:00+00:00",
  name: "Original thrift shirt",
  description: "",
  price: "550.50",
  stock_quantity: "1",
  actual_size: "",
  actual_color: "",
};
describe("admin trust boundaries", () => {
  it("preserves blank unknown sizes", () =>
    expect(draftSchema.parse(draft).actual_size).toBe(""));
  it("rejects placeholder sizes and fabricated thrift stock", () => {
    expect(
      draftSchema.safeParse({ ...draft, actual_size: "N/A" }).success,
    ).toBe(false);
    expect(
      draftSchema.safeParse({ ...draft, stock_quantity: "2" }).success,
    ).toBe(false);
  });
  it("converts decimal BDT without floating point multiplication", () => {
    expect(toMinorUnits("550.50")).toBe(55050);
    expect(toMinorUnits("0.29")).toBe(29);
    expect(toMinorUnits("600")).toBe(60000);
  });
  it("rejects untrusted roles and invalid authenticator codes", () => {
    expect(rolesSchema.safeParse([{ role: "admin" }]).success).toBe(false);
    expect(
      totpSchema.safeParse({ factorId: draft.id, code: "12345x" }).success,
    ).toBe(false);
  });
  it("rejects negative or precision-losing prices", () => {
    for (const price of ["-1", "5.999", "1e5", "Infinity"])
      expect(draftSchema.safeParse({ ...draft, price }).success).toBe(false);
  });
});
