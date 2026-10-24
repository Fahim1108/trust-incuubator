import type { Brand, CatalogFacets, Category, Paginated, Product, ProductQuery, SortOption } from "@/types";

export const DEFAULT_PAGE_SIZE = 12;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const list = (v: string | string[] | undefined): string[] | undefined => {
  if (!v) return undefined;
  const arr = (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
};

const num = (v: string | string[] | undefined): number | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** Parses URL search params (as given to a Next.js page) into a ProductQuery. */
export function parseProductQuery(sp: Record<string, string | string[] | undefined>): ProductQuery & { offers?: boolean } {
  const sort = (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) as SortOption | undefined;
  return {
    search: (Array.isArray(sp.q) ? sp.q[0] : sp.q) || undefined,
    categorySlugs: list(sp.category),
    brandSlugs: list(sp.brand),
    sizes: list(sp.sizes),
    colorIds: list(sp.colors),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : undefined,
    page: num(sp.page),
    offers: sp.offers === "1",
  };
}

/** Builds a query string from a ProductQuery (inverse of parseProductQuery). */
export function toSearchParams(q: ProductQuery & { offers?: boolean }): URLSearchParams {
  const p = new URLSearchParams();
  if (q.search) p.set("q", q.search);
  if (q.categorySlugs?.length) p.set("category", q.categorySlugs.join(","));
  if (q.brandSlugs?.length) p.set("brand", q.brandSlugs.join(","));
  if (q.sizes?.length) p.set("sizes", q.sizes.join(","));
  if (q.colorIds?.length) p.set("colors", q.colorIds.join(","));
  if (q.minPrice !== undefined) p.set("min", String(q.minPrice));
  if (q.maxPrice !== undefined) p.set("max", String(q.maxPrice));
  if (q.sort && q.sort !== "featured") p.set("sort", q.sort);
  if (q.offers) p.set("offers", "1");
  if (q.page && q.page > 1) p.set("page", String(q.page));
  return p;
}

function matchesSearch(p: Product, term: string, categories: Category[], brands: Brand[]): boolean {
  const t = term.toLowerCase();
  const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
  const brand = brands.find((b) => b.id === p.brandId)?.name ?? "";
  return [p.name, p.shortDescription, cat, brand, ...p.tags, ...p.colors.map((c) => c.name)]
    .join(" ")
    .toLowerCase()
    .includes(t);
}

/**
 * Pure in-memory implementation of catalogue filtering, used by the mock adapter.
 * A real backend should implement the same semantics in SQL.
 */
export function queryProducts(
  products: Product[],
  categories: Category[],
  brands: Brand[],
  query: ProductQuery & { offers?: boolean },
): Paginated<Product> & { facets: CatalogFacets } {
  const catIds = query.categorySlugs?.map((s) => categories.find((c) => c.slug === s)?.id).filter(Boolean);
  const brandIds = query.brandSlugs?.map((s) => brands.find((b) => b.slug === s)?.id).filter(Boolean);

  // Base set: everything except price/size/color filters, used for facet counts.
  const base = products.filter(
    (p) =>
      (!query.search || matchesSearch(p, query.search, categories, brands)) &&
      (!query.offers || (p.compareAtPrice ?? 0) > p.price),
  );

  let items = base.filter(
    (p) =>
      (!catIds?.length || catIds.includes(p.categoryId)) &&
      (!brandIds?.length || brandIds.includes(p.brandId)) &&
      (!query.sizes?.length || p.sizes.some((s) => query.sizes!.includes(s))) &&
      (!query.colorIds?.length || p.colors.some((c) => query.colorIds!.includes(c.id))) &&
      (query.minPrice === undefined || p.price >= query.minPrice) &&
      (query.maxPrice === undefined || p.price <= query.maxPrice),
  );

  switch (query.sort ?? "featured") {
    case "newest":
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      items = [...items].sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count);
      break;
    default:
      items = [...items].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isBestSeller) - Number(a.isBestSeller));
  }

  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);

  const colorMap = new Map<string, Product["colors"][number]>();
  base.forEach((p) => p.colors.forEach((c) => colorMap.set(c.id, c)));
  const sizeOrder = ["S", "M", "L", "XL", "XXL"];
  const sizes = Array.from(new Set(base.flatMap((p) => p.sizes))).sort((a, b) => {
    const ia = sizeOrder.indexOf(a), ib = sizeOrder.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return Number(a) - Number(b) || a.localeCompare(b);
  });
  const prices = base.map((p) => p.price);

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
    facets: {
      categories: categories
        .map((c) => ({ slug: c.slug, name: c.name, count: base.filter((p) => p.categoryId === c.id).length }))
        .filter((c) => c.count > 0),
      brands: brands
        .map((b) => ({ slug: b.slug, name: b.name, count: base.filter((p) => p.brandId === b.id).length }))
        .filter((b) => b.count > 0),
      sizes,
      colors: Array.from(colorMap.values()),
      priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    },
  };
}

/** Number of user-applied filters (for the mobile filter badge). */
export function countActiveFilters(q: { categorySlugs?: string[]; brandSlugs?: string[]; sizes?: string[]; colorIds?: string[]; minPrice?: number; maxPrice?: number; offers?: boolean }) {
  return (q.categorySlugs?.length ?? 0) + (q.brandSlugs?.length ?? 0) + (q.sizes?.length ?? 0) + (q.colorIds?.length ?? 0) + (q.minPrice !== undefined || q.maxPrice !== undefined ? 1 : 0) + (q.offers ? 1 : 0);
}
