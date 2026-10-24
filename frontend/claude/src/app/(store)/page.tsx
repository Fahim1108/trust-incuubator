import { HomepageView } from "@/components/home/HomepageView";
import { getBrands, getCategories, getCollection, getStorefrontSettings } from "@/services";

export default async function HomePage() {
  const [settings, categories, brands, newArrivals, featured, bestSellers] = await Promise.all([
    getStorefrontSettings(),
    getCategories(),
    getBrands(),
    getCollection("new-arrivals", 12),
    getCollection("featured", 12),
    getCollection("best-sellers", 12),
  ]);
  return <HomepageView settings={settings} data={{ categories, brands, newArrivals, featured, bestSellers }} />;
}
