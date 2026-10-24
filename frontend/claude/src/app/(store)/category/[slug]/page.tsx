import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/CatalogView";
import { parseProductQuery } from "@/lib/catalog-query";
import { getBrands, getCategories, getCategoryBySlug, getProducts } from "@/services";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
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
