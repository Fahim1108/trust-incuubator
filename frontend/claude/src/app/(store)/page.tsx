import { HomepageView } from "@/components/home/HomepageView";
import { getProducts, getBrands, getCategories, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function HomePage() {
  const [settings, categories, brands, candidates, catalogue] = await Promise.all([
    getStorefrontSettings(), getCategories(), getBrands(), getHomepageProducts(), getProducts({pageSize:500}),
  ]);
  return <HomepageView settings={settings} data={{ reviewProducts:catalogue.items.filter(p=>p.reviewOnly), categories, brands, candidates, newArrivals: [], featured: [], bestSellers: [] }} />;
}
