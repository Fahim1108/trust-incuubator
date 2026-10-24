import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandWordmark } from "@/components/brand/BrandCard";
import { CatalogView } from "@/components/catalog/CatalogView";
import { DemoNotice } from "@/components/ui";
import { parseProductQuery } from "@/lib/catalog-query";
import { getBrandBySlug, getBrands, getProducts } from "@/services";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const brand = await getBrandBySlug((await params).slug);
  return brand ? { title: brand.name } : {};
}

export default async function BrandPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const query = { ...parseProductQuery(await searchParams), brandSlugs: [slug] };
  const [result, brands] = await Promise.all([getProducts(query), getBrands()]);
  return (
    <CatalogView
      title={brand.name}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]}
      query={query}
      result={result}
      brands={brands}
      locked={{ brand: slug }}
      banner={
        <div className="mt-6 space-y-3">
          <div className="flex h-28 items-center justify-center rounded-card border border-line bg-[#FAF9F8] sm:h-36">
            <BrandWordmark brand={brand} className="text-3xl sm:text-5xl" />
          </div>
          <DemoNotice>Demonstration brand page. Brand names are sample entries and do not represent confirmed inventory, authorised resale or partnerships.</DemoNotice>
        </div>
      }
    />
  );
}
