import { defaultStorefrontSettings } from "@/config";
import { queryProducts } from "@/lib/catalog-query";
import { findVariant, imagesForColor } from "@/lib/product";
import { mockBrands, mockCartSeed, mockCategories, mockCustomer, mockOrders, mockProducts, mockReviewsFor, mockSizeGuides } from "@/mocks";
import type { ActionResult, CartItem } from "@/types";
import type { StorefrontDataSource } from "../types";

/** Every mutation in the mock adapter resolves to this — never a fake success. */
const notConnected = (what: string): ActionResult<never> => ({
  ok: false,
  reason: "not_connected",
  message: `${what} is not connected yet. This is a frontend demonstration — no data was sent or saved.`,
});

const byId = new Map(mockProducts.map((p) => [p.id, p]));

export const mockDataSource: StorefrontDataSource = {
  async getProducts(query = {}) {
    return queryProducts(mockProducts, mockCategories, mockBrands, query);
  },
  async getProductBySlug(slug) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    return ids.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  },
  async getRelatedProducts(product, limit = 4) {
    const same = mockProducts.filter((p) => p.id !== product.id && p.categoryId === product.categoryId);
    const others = mockProducts.filter((p) => p.id !== product.id && p.categoryId !== product.categoryId && p.isBestSeller);
    return [...same, ...others].slice(0, limit);
  },
  async getCollection(kind, limit = 8) {
    const filtered =
      kind === "new-arrivals"
        ? [...mockProducts].filter((p) => p.isNewArrival).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : kind === "featured"
          ? mockProducts.filter((p) => p.isFeatured)
          : [...mockProducts].filter((p) => p.isBestSeller).sort((a, b) => b.rating.count - a.rating.count);
    return filtered.slice(0, limit);
  },
  async searchSuggestions(term, limit = 6) {
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return mockProducts
      .filter((p) => {
        const cat = mockCategories.find((c) => c.id === p.categoryId)?.name ?? "";
        return `${p.name} ${cat} ${p.tags.join(" ")}`.toLowerCase().includes(t);
      })
      .slice(0, limit)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.defaultImages[0] ?? { src: "", alt: p.name },
        categoryName: mockCategories.find((c) => c.id === p.categoryId)?.name ?? "",
      }));
  },
  async getCategories() {
    return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getCategoryBySlug(slug) {
    return mockCategories.find((c) => c.slug === slug) ?? null;
  },
  async getBrands() {
    return [...mockBrands].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async getBrandBySlug(slug) {
    return mockBrands.find((b) => b.slug === slug) ?? null;
  },
  async getReviews(productId) {
    return mockReviewsFor(productId);
  },
  async getSizeGuide(id) {
    return mockSizeGuides[id] ?? null;
  },

  async getStorefrontSettings() {
    return defaultStorefrontSettings;
  },
  async getHomepageConfiguration() {
    const s = defaultStorefrontSettings;
    return { sections: s.homepage, hero: s.hero, promoBanners: s.promoBanners, valueProps: s.valueProps };
  },

  async getInitialCart() {
    const items: CartItem[] = [];
    for (const seed of mockCartSeed) {
      const product = byId.get(seed.productId);
      if (!product) continue;
      const variant = findVariant(product, seed.colorId, seed.size) ?? product.variants.find((v) => v.colorId === seed.colorId && v.stock > 0);
      if (!variant || variant.stock < 1) continue;
      const brand = mockBrands.find((b) => b.id === product.brandId);
      items.push({
        id: `${product.id}:${variant.id}`,
        productId: product.id,
        productSlug: product.slug,
        variantId: variant.id,
        name: product.name,
        brandName: brand?.name ?? "",
        image: imagesForColor(product, variant.colorId)[0] ?? { src: "", alt: product.name },
        colorName: product.colors.find((c) => c.id === variant.colorId)?.name ?? variant.colorId,
        size: variant.size,
        unitPrice: variant.price ?? product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: Math.min(seed.quantity, variant.stock),
        maxQuantity: variant.stock,
      });
    }
    return items;
  },

  async getCurrentCustomer() {
    return mockCustomer;
  },
  async getOrders() {
    return mockOrders;
  },
  async getOrderByNumber(orderNumber) {
    const n = orderNumber.trim().toUpperCase();
    return mockOrders.find((o) => o.orderNumber === n) ?? null;
  },

  async placeOrder() {
    return notConnected("Order placement");
  },
  async signIn() {
    return notConnected("Sign in");
  },
  async register() {
    return notConnected("Account registration");
  },
  async requestPasswordReset() {
    return notConnected("Password reset");
  },
  async updateProfile() {
    return notConnected("Profile update");
  },
  async saveAddress() {
    return notConnected("Address saving");
  },
  async deleteAddress() {
    return notConnected("Address deletion");
  },
  async subscribeNewsletter() {
    return notConnected("Newsletter signup");
  },
  async submitContactForm() {
    return notConnected("Contact form");
  },
  async saveStorefrontDraft() {
    return notConnected("Saving appearance drafts");
  },
  async publishStorefrontSettings() {
    return notConnected("Publishing appearance settings");
  },
  async uploadMedia() {
    return notConnected("Media upload");
  },
};
