import type { Metadata } from "next";
import { CategoryCard } from "@/components/category/CategoryCard";
import { Breadcrumbs } from "@/components/ui";
import { getCategories, getProducts } from "@/services";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, all] = await Promise.all([getCategories(), getProducts({ pageSize: 1 })]);
  const counts = Object.fromEntries(all.facets.categories.map((c) => [c.slug, c.count]));
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Shop by Category</h1>
      <p className="mt-2 text-sm text-ink-muted">Everything you need for a complete, considered wardrobe.</p>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id}>
            <CategoryCard category={c} variant="feature" productCount={counts[c.slug] ?? 0} />
          </li>
        ))}
      </ul>
    </div>
  );
}
