import type {
  ActionResult,
  Address,
  Brand,
  CartItem,
  CatalogFacets,
  Category,
  CheckoutPayload,
  Customer,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Review,
  SizeGuide,
  StorefrontSettings,
} from "@/types";

export type ProductQueryInput = ProductQuery & { offers?: boolean };

export interface HomepageConfiguration {
  sections: StorefrontSettings["homepage"];
  hero: StorefrontSettings["hero"];
  promoBanners: StorefrontSettings["promoBanners"];
  valueProps: StorefrontSettings["valueProps"];
}

export interface ProductSuggestion {
  slug: string;
  name: string;
  price: number;
  image: { src: string; alt: string };
  categoryName: string;
}

/**
 * The contract every data source must implement.
 *
 * `src/services/adapters/mock.ts` implements it with local fixtures.
 * Codex: create `src/services/adapters/supabase.ts` implementing this same
 * interface, then switch the export in `src/services/adapters/index.ts`.
 */
export interface StorefrontDataSource {
  // ---- Catalogue (read) ----
  getProducts(query?: ProductQueryInput): Promise<Paginated<Product> & { facets: CatalogFacets }>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  getCollection(kind: "new-arrivals" | "featured" | "best-sellers", limit?: number): Promise<Product[]>;
  searchSuggestions(term: string, limit?: number): Promise<ProductSuggestion[]>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getBrands(): Promise<Brand[]>;
  getBrandBySlug(slug: string): Promise<Brand | null>;
  getReviews(productId: string): Promise<Review[]>;
  getSizeGuide(id: string): Promise<SizeGuide | null>;

  // ---- Storefront configuration ----
  getStorefrontSettings(): Promise<StorefrontSettings>;
  getHomepageConfiguration(): Promise<HomepageConfiguration>;

  // ---- Cart ----
  /** Cart lines to pre-fill on a first visit (demo only; real backend returns the saved cart). */
  getInitialCart(): Promise<CartItem[]>;

  // ---- Customer (requires auth) ----
  getCurrentCustomer(): Promise<Customer | null>;
  getOrders(): Promise<Order[]>;
  getOrderByNumber(orderNumber: string, phone?: string): Promise<Order | null>;

  // ---- Mutations (all require backend) ----
  placeOrder(payload: CheckoutPayload): Promise<ActionResult<{ orderNumber: string }>>;
  signIn(input: { identifier: string; password: string }): Promise<ActionResult>;
  register(input: { fullName: string; email: string; phone: string; password: string }): Promise<ActionResult>;
  requestPasswordReset(input: { identifier: string }): Promise<ActionResult>;
  updateProfile(input: Pick<Customer, "fullName" | "email" | "phone">): Promise<ActionResult>;
  saveAddress(address: Address): Promise<ActionResult<Address>>;
  deleteAddress(addressId: string): Promise<ActionResult>;
  subscribeNewsletter(email: string): Promise<ActionResult>;
  submitContactForm(input: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<ActionResult>;
  saveStorefrontDraft(settings: StorefrontSettings): Promise<ActionResult>;
  publishStorefrontSettings(settings: StorefrontSettings): Promise<ActionResult>;
  uploadMedia(file: { name: string; type: string; size: number }): Promise<ActionResult<{ url: string }>>;
}
