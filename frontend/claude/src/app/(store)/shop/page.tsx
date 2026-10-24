import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { parseProductQuery } from "@/lib/catalog-query";
import { getBrands, getProducts } from "@/services";

export const metadata: Metadata = { title: "Shop", description: "Shop shirts, pants, sneakers, belts, wallets and watches." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseProductQuery(await searchParams);
  const [result, brands] = await Promise.all([getProducts(query), getBrands()]);
  const title = query.search ? `Results for “${query.search}”` : query.offers ? "Offers" : query.sort === "newest" ? "New Arrivals" : "All Products";
  return <CatalogView title={title} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} query={query} result={result} brands={brands} />;
}
