import type { Metadata } from "next";
import { BrandCard } from "@/components/brand/BrandCard";
import { Breadcrumbs, DemoNotice } from "@/components/ui";
import { getBrands, getProducts } from "@/services";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const [brands, all] = await Promise.all([getBrands(), getProducts({ pageSize: 1 })]);
  const counts = Object.fromEntries(all.facets.brands.map((b) => [b.slug, b.count]));
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
      <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Shop by Brand</h1>
      <DemoNotice className="mt-4 max-w-2xl">Brand listings are demonstration entries only. They do not represent confirmed inventory, authorised resale or official partnerships.</DemoNotice>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {brands.map((b) => (
          <li key={b.id}>
            <BrandCard brand={b} productCount={counts[b.slug] ?? 0} className="h-28 sm:h-32" />
          </li>
        ))}
      </ul>
    </div>
  );
}
