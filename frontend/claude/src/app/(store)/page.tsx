import { HomepageView } from "@/components/home/HomepageView";
import { getBrands, getCategories, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function HomePage() {
  const [settings, categories, brands, candidates] = await Promise.all([
    getStorefrontSettings(), getCategories(), getBrands(), getHomepageProducts(),
  ]);
  return <HomepageView settings={settings} data={{ categories, brands, candidates, newArrivals: [], featured: [], bestSellers: [] }} />;
}
