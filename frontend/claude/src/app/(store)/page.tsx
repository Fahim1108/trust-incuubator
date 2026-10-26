import { HomepageView } from "@/components/home/HomepageView";
import { getProducts, getCollection, getBrands, getCategories, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function HomePage() {
  const [settings, categories, brands, candidates, newArrivals, featured, catalogue] = await Promise.all([
    getStorefrontSettings(), getCategories(), getBrands(), getHomepageProducts(), getCollection('new-arrivals'), getCollection('featured'), getProducts({pageSize:500}),
  ]);
  return <HomepageView settings={settings} data={{ sizingProducts:catalogue.items, categories, brands, candidates, newArrivals, featured, bestSellers: [] }} />;
}
