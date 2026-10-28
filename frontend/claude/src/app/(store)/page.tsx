import { HomepageView } from "@/components/home/HomepageView";
import { getProducts, getCollection, getBrands, getCategories, getHomepageProducts, getStorefrontSettings } from "@/services";

export default async function HomePage() {
  const [settings, categories, brands, candidates, newArrivals, featured, catalogue] = await Promise.all([
    getStorefrontSettings(), getCategories(), getBrands(), getHomepageProducts(), getCollection('new-arrivals'), getCollection('featured'), getProducts({pageSize:500}),
  ]);
  return <><HomepageView settings={settings} data={{ sizingProducts:catalogue.items, categories, brands, candidates, newArrivals, featured, bestSellers: [] }} />{!catalogue.items.length&&<section className="container py-12 text-center" aria-labelledby="collection-coming-soon" data-catalogue-empty><h1 id="collection-coming-soon" className="font-display text-3xl text-primary">Our collection is coming soon</h1><p className="mt-3 text-ink-muted">We’re preparing our next collection. Products will appear here once their details and availability are verified.</p></section>}</>;
}
