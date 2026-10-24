/**
 * Frontend service layer. UI code imports ONLY from here (or from
 * `@/services/actions` in client components) — never from `@/mocks`.
 *
 * Every function delegates to the active adapter in `./adapters`.
 */
import { dataSource } from "./adapters";
import type { ProductQueryInput } from "./types";

export type { HomepageConfiguration, ProductQueryInput, ProductSuggestion, StorefrontDataSource } from "./types";

export const getProducts = (query?: ProductQueryInput) => dataSource.getProducts(query);
export const getProductBySlug = (slug: string) => dataSource.getProductBySlug(slug);
export const getProductsByIds = (ids: string[]) => dataSource.getProductsByIds(ids);
export const getRelatedProducts: typeof dataSource.getRelatedProducts = (p, limit) => dataSource.getRelatedProducts(p, limit);
export const getCollection: typeof dataSource.getCollection = (kind, limit) => dataSource.getCollection(kind, limit);
export const getCategories = () => dataSource.getCategories();
export const getCategoryBySlug = (slug: string) => dataSource.getCategoryBySlug(slug);
export const getBrands = () => dataSource.getBrands();
export const getBrandBySlug = (slug: string) => dataSource.getBrandBySlug(slug);
export const getReviews = (productId: string) => dataSource.getReviews(productId);
export const getSizeGuide = (id: string) => dataSource.getSizeGuide(id);
export const getStorefrontSettings = () => dataSource.getStorefrontSettings();
export const getHomepageConfiguration = () => dataSource.getHomepageConfiguration();
export const getInitialCart = () => dataSource.getInitialCart();
export const getCurrentCustomer = () => dataSource.getCurrentCustomer();
export const getOrders = () => dataSource.getOrders();
export const getOrderByNumber = (orderNumber: string, phone?: string) => dataSource.getOrderByNumber(orderNumber, phone);
