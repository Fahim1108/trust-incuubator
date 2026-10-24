import { PreviewClient } from "@/components/admin/PreviewClient";
import { getBrands, getCategories, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function AppearancePreviewPage() {
  const [settings, categories, brands, candidates] = await Promise.all([
    getStorefrontSettings(),
    getCategories(),
    getBrands(),
    getHomepageProducts(),
  ]);
  return <PreviewClient initial={settings} data={{ categories, brands, candidates, newArrivals: [], featured: [], bestSellers: [] }} />;
}
