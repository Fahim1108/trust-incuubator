import { describe, expect, it } from "vitest";
import { mockProducts } from "@/mocks/products";
import { homepageSections } from "@/config/homepage";
import { eligibleCandidates, resolveLook, selectHomepageCollections, selectMixedProducts, type MerchandisingCandidate } from "@/lib/merchandising";
const now = Date.parse("2026-10-25T00:00:00Z");
const candidates: MerchandisingCandidate[] = mockProducts.map(product => ({ product, status: "published", publishedAt: product.createdAt }));
function fixture(index: number) {
  const candidate = candidates[index];
  if (!candidate) throw new Error(`Missing fixture ${index}`);
  return candidate;
}
const options = { kind: "new-arrivals" as const, now };
const ids = (products: typeof mockProducts) => products.map(p => p.id);

describe("mixed-category merchandising", () => {
  it("uses publication time instead of creation time with stable ties", () => {
    const input = candidates.slice(0, 3).map((c, index) => ({ ...c, publishedAt: index === 1 ? "2026-10-24" : "2026-10-01" }));
    expect(ids(selectMixedProducts(input, options))).toEqual(["p002", "p001", "p003"]);
    expect(ids(selectMixedProducts([...input].reverse(), options))).toEqual(["p002", "p001", "p003"]);
  });
  it("rejects drafts, archives, invalid and future publication timestamps, and duplicate IDs", () => {
    const input: MerchandisingCandidate[] = [fixture(0), fixture(0), { ...fixture(1), status: "draft" }, { ...fixture(2), status: "archived" }, { ...fixture(3), publishedAt: "bad" }, { ...fixture(4), publishedAt: "2027-01-01" }];
    expect(eligibleCandidates(input, now)).toHaveLength(1);
  });
  it("fills eight slots across six available categories without hardcoded category IDs", () => {
    const products = selectMixedProducts(candidates, options);
    const counts = new Map<string, number>();
    products.forEach(p => counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1));
    expect(products).toHaveLength(8);
    expect(new Set(products.slice(0, 4).map(p => p.categoryId)).size).toBe(4);
    expect(counts.size).toBe(6);
    expect(Math.max(...counts.values())).toBe(2);
  });
  it("redistributes unused quota instead of hiding valid products in a sparse catalogue", () => {
    expect(selectMixedProducts(candidates.slice(0, 7), options)).toHaveLength(7);
    expect(selectMixedProducts([], options)).toEqual([]);
    expect(selectMixedProducts(candidates, { ...options, limit: 0 })).toEqual([]);
  });
  it("prefers in-stock products while retaining unavailable products as a last resort", () => {
    const unavailable = { ...fixture(0), product: { ...fixture(0).product, variants: fixture(0).product.variants.map(v => ({ ...v, stock: 0 })) }, publishedAt: "2026-10-24" };
    expect(ids(selectMixedProducts([unavailable, fixture(1)], options))).toEqual(["p002", "p001"]);
  });
  it("uses only explicit featured/trending assignments and preserves their ranking", () => {
    expect(selectMixedProducts(candidates, { ...options, kind: "trending" })).toEqual([]);
    expect(ids(selectMixedProducts(candidates, { ...options, kind: "featured", productIds: ["p003", "missing", "p002"] }))).toEqual(["p003", "p002"]);
  });
  it("avoids adjacent repeats when alternatives exist but allows repeats for sparse inventory", () => {
    const prior = ids(selectMixedProducts(candidates, options));
    const next = selectMixedProducts(candidates, { ...options, avoidIds: prior });
    expect(next.every(p => !prior.includes(p.id))).toBe(true);
    expect(selectMixedProducts(candidates.slice(0, 2), { ...options, avoidIds: ["p001", "p002"] })).toHaveLength(2);
  });
  it("never substitutes ratings or bestseller flags for measured popularity", () => {
    expect(selectMixedProducts(candidates, { ...options, kind: "most-popular" })).toEqual([]);
    const measured = candidates.slice(0, 2).map((c, index) => ({ ...c, popularity: { score: index + 1, measure: "units-sold" as const } }));
    expect(ids(selectMixedProducts(measured, { ...options, kind: "most-popular" }))).toEqual(["p002", "p001"]);
  });
  it("respects enabled section order, limits and duplicate prevention", () => {
    const collections = selectHomepageCollections(homepageSections, candidates);
    expect([...collections.keys()]).toEqual(["new-arrivals", "featured"]);
    expect(collections.get("new-arrivals")).toHaveLength(8);
    expect(collections.get("featured")).toHaveLength(8);
    const first = new Set(ids(collections.get("new-arrivals")!));
    expect(collections.get("featured")!.every(p => !first.has(p.id))).toBe(true);
  });
  it("only publishes complete configured looks when every linked product is available", () => {
    const look = { id: "test-look", title: "Test outfit", enabled: true, image: { src: "/test.jpg", alt: "Test" }, productIds: ["p001", "p002"] };
    expect(resolveLook(look, candidates)).toHaveLength(2);
    expect(resolveLook({ ...look, productIds: ["p001", "missing"] }, candidates)).toEqual([]);
    expect(resolveLook({ ...look, enabled: false }, candidates)).toEqual([]);
    expect(resolveLook({ ...look, productIds: ["p001", "p001"] }, candidates)).toEqual([]);
    const unavailable = candidates.map(c => ({ ...c, product: { ...c.product, variants: [] } }));
    expect(resolveLook(look, unavailable)).toEqual([]);
  });
});
