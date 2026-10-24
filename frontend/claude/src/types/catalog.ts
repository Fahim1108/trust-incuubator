/** Catalogue contracts. These mirror what the backend should return. */

export type ID = string;

/** Money is stored in whole Bangladeshi Taka (BDT). */
export type Money = number;

export interface ProductImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ColorOption {
  /** Stable key used in variants, URLs and filters, e.g. "maroon". */
  id: string;
  name: string;
  /** Swatch color as CSS color string. */
  hex: string;
}

export interface ProductVariant {
  id: ID;
  sku: string;
  colorId: string;
  size: string;
  /** Overrides product.price when present. */
  price?: Money;
  stock: number;
}

export type ProductBadge = "new" | "bestseller" | "sale" | "limited";

export interface Product {
  id: ID;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: ID;
  brandId: ID;
  price: Money;
  /** Original price before discount; omit when not on sale. */
  compareAtPrice?: Money;
  colors: ColorOption[];
  sizes: string[];
  variants: ProductVariant[];
  /** Images per color id. Falls back to `defaultImages` when a color has none. */
  imagesByColor: Record<string, ProductImage[]>;
  defaultImages: ProductImage[];
  details: string[];
  material?: string;
  care?: string[];
  badges: ProductBadge[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: { average: number; count: number };
  /** ISO date string. */
  createdAt: string;
  tags: string[];
  /** Key into the size-guide table (see mocks/size-guides.ts). */
  sizeGuideId?: string;
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  image: ProductImage;
  /** Photo used by the mobile category cards. Falls back to `image`. */
  thumbnail?: ProductImage;
  sortOrder: number;
}

export interface Brand {
  id: ID;
  slug: string;
  name: string;
  description: string;
  /** Optional logo image. When absent the BrandCard renders a typographic wordmark. */
  logo?: ProductImage;
  /** Wordmark style used when there is no logo image. */
  wordmark: { fontFamily: "serif" | "sans" | "condensed" | "script"; letterSpacing?: string; weight?: number; italic?: boolean; uppercase?: boolean };
  sortOrder: number;
}

export interface Review {
  id: ID;
  productId: ID;
  author: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
  size?: string;
}

export interface SizeGuide {
  id: string;
  title: string;
  unit: string;
  columns: string[];
  rows: string[][];
  notes: string[];
}

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  search?: string;
  categorySlugs?: string[];
  brandSlugs?: string[];
  sizes?: string[];
  colorIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Facet values available for filtering a result set. */
export interface CatalogFacets {
  categories: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string; count: number }[];
  sizes: string[];
  colors: ColorOption[];
  priceRange: { min: number; max: number };
}
