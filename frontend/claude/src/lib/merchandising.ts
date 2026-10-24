import type { Product, ProductImage } from "@/types";

export type CollectionKind = "new-arrivals" | "featured" | "trending" | "most-popular";
/** A trusted adapter must supply publication metadata, never infer it from createdAt. */
export interface MerchandisingCandidate {
  product: Product;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  popularity?: { score: number; measure: "units-sold" | "paid-orders" };
}
export interface CompleteLook {
  id: string;
  title: string;
  image: ProductImage;
  productIds: string[];
  enabled: boolean;
}
export interface MerchandisingRules {
  productIds?: string[];
  softCategoryCap?: number;
  preferInStock?: boolean;
}
export function isAvailable(product: Product) {
  return product.variants.some(v => v.stock > 0);
}
export function eligibleCandidates(candidates: MerchandisingCandidate[], now = Date.now()) {
  const seen = new Set<string>();
  return candidates.filter(c => {
    const published = Date.parse(c.publishedAt);
    if (c.status !== "published" || !Number.isFinite(published) || published > now || seen.has(c.product.id)) return false;
    seen.add(c.product.id);
    return true;
  });
}

/** Rank first, apply a soft category cap, then redistribute unused slots. No randomness. */
export function selectMixedProducts(candidates: MerchandisingCandidate[], options: MerchandisingRules & {
  kind: CollectionKind;
  limit?: number;
  avoidIds?: string[];
  now?: number;
}): Product[] {
  const limit = Math.max(0, Math.min(8, Math.floor(options.limit ?? 8)));
  if (!Number.isFinite(limit) || limit === 0) return [];
  const order = new Map((options.productIds ?? []).map((id, index) => [id, index]));
  const avoid = new Set(options.avoidIds);
  const curated = options.kind === "featured" || options.kind === "trending";
  const ranked = eligibleCandidates(candidates, options.now).filter(c => {
    if (curated) return order.has(c.product.id);
    if (options.kind === "most-popular") return c.popularity && Number.isFinite(c.popularity.score) && c.popularity.score > 0;
    return true;
  }).sort((a, b) => {
    const available = options.preferInStock !== false ? Number(isAvailable(b.product)) - Number(isAvailable(a.product)) : 0;
    const repeated = Number(avoid.has(a.product.id)) - Number(avoid.has(b.product.id));
    const rank = curated ? order.get(a.product.id)! - order.get(b.product.id)!
      : options.kind === "most-popular" ? b.popularity!.score - a.popularity!.score
      : Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    return available || repeated || rank || a.product.id.localeCompare(b.product.id);
  });
  const result: Product[] = [];
  const used = new Set<string>();
  const counts = new Map<string, number>();
  const requestedCap = options.softCategoryCap ?? 2;
  const softCap = Number.isFinite(requestedCap) ? Math.max(1, Math.floor(requestedCap)) : 2;
  // Give the initial mobile row/group category variety before second picks.
  let cap = 1;
  while (result.length < Math.min(limit, ranked.length)) {
    for (const { product } of ranked) {
      if (used.has(product.id) || (counts.get(product.categoryId) ?? 0) >= cap) continue;
      used.add(product.id);
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
      result.push(product);
      if (result.length === limit) break;
    }
    cap = cap === 1 ? Math.max(2, softCap) : cap + 1;
  }
  return result;
}
export function resolveLook(look: CompleteLook, candidates: MerchandisingCandidate[]): Product[] {
  if (!look.enabled || !look.image.src || look.productIds.length < 2) return [];
  const byId = new Map(eligibleCandidates(candidates).map(c => [c.product.id, c.product]));
  const ids = [...new Set(look.productIds)];
  if (ids.length < 2) return [];
  const products = ids.map(id => byId.get(id));
  return products.every((p): p is Product => Boolean(p && isAvailable(p))) ? products : [];
}

export function selectHomepageCollections(sections: import("@/types").HomepageSection[], candidates: MerchandisingCandidate[]) {
  const selected = new Map<string, Product[]>();
  let previous: string[] = [];
  for (const section of sections.filter(s => s.enabled)) {
    if (!["new-arrivals", "featured", "trending", "most-popular", "best-sellers"].includes(section.type)) continue;
    const kind = section.type === "best-sellers" ? "most-popular" : section.type as CollectionKind;
    const products = selectMixedProducts(candidates, { ...section, kind, avoidIds: previous });
    selected.set(section.id, products);
    if (products.length) previous = products.map(p => p.id);
  }
  return selected;
}
