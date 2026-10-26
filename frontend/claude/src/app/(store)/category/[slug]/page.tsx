import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/CatalogView";
import { parseProductQuery } from "@/lib/catalog-query";
import { getBrands, getCategoryBySlug, getProducts } from "@/services";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  if(category.available===false) return <section className="container animate-dropdown-in py-16 text-center"><h1 className="font-serif text-4xl text-primary">Coming Soon</h1><p className="mt-4 text-ink-muted">We&apos;re expanding our collection. Stay tuned.</p><Link href="/category/shirts" className="mt-6 inline-block rounded bg-primary px-5 py-3 text-white">Explore Shirts</Link></section>;
  const query = { ...parseProductQuery(await searchParams), categorySlugs: [slug] };
  const [result, brands] = await Promise.all([getProducts(query), getBrands()]);
  return (
    <CatalogView
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]}
      query={query}
      result={result}
      brands={brands}
      locked={{ category: slug }}
    />
  );
}
