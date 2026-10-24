import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs, ButtonLink, EmptyState } from "@/components/ui";
import type { ProductQueryInput } from "@/services";
import type { Brand, CatalogFacets, Paginated, Product } from "@/types";
import { countActiveFilters } from "@/lib/catalog-query";
import { ActiveFilters } from "./ActiveFilters";
import { CatalogProvider, CatalogResults } from "./CatalogContext";
import { FilterDrawer } from "./FilterDrawer";
import { FilterPanel } from "./FilterPanel";
import { Pagination } from "./Pagination";
import { SortSelect } from "./SortSelect";

interface CatalogViewProps {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  query: ProductQueryInput;
  result: Paginated<Product> & { facets: CatalogFacets };
  brands: Brand[];
  locked?: { category?: string; brand?: string };
  banner?: ReactNode;
}

/** Shared product listing layout for /shop, /category/[slug] and /brand/[slug]. */
export function CatalogView({ title, description, breadcrumbs, query, result, brands, locked, banner }: CatalogViewProps) {
  const active = countActiveFilters({ ...query, categorySlugs: locked?.category ? undefined : query.categorySlugs, brandSlugs: locked?.brand ? undefined : query.brandSlugs });
  return (
    <CatalogProvider query={query} locked={locked}>
      <div className="container pb-8 pt-5 sm:pt-8">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-[34px] leading-tight text-ink sm:text-5xl">
              {title} <span className="align-middle font-sans text-base font-normal text-ink-muted sm:text-lg">({result.total})</span>
            </h1>
            {description && <p className="mt-2 max-w-xl text-sm text-ink-muted">{description}</p>}
          </div>
        </div>
        {banner}

        <div className="sticky top-[151px] z-20 -mx-4 mt-5 flex items-center justify-between gap-2 border-y border-line bg-surface/95 px-4 py-2.5 backdrop-blur sm:mx-0 sm:px-0 lg:static lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:pb-4 lg:pt-0">
          <div className="flex items-center gap-2">
            <FilterDrawer facets={result.facets} total={result.total} activeCount={active} />
            <p className="hidden text-sm text-ink-muted lg:block">
              Showing {result.items.length ? (result.page - 1) * result.pageSize + 1 : 0}–{(result.page - 1) * result.pageSize + result.items.length} of {result.total}
            </p>
          </div>
          <SortSelect />
        </div>

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-[240px_1fr]">
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-none">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Filter by</h2>
              <FilterPanel facets={result.facets} />
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-5">
              <ActiveFilters facets={result.facets} />
            </div>
            <CatalogResults>
              {result.items.length ? (
                <ProductGrid products={result.items} brands={brands} columns={3} className="lg:grid-cols-3 xl:grid-cols-4" />
              ) : (
                <EmptyState
                  icon={<SearchX className="h-7 w-7" />}
                  title="No products found"
                  description="Try removing a filter or searching for something else."
                  action={<ButtonLink href="/shop" variant="outline">View all products</ButtonLink>}
                />
              )}
            </CatalogResults>
            <Pagination page={result.page} totalPages={result.totalPages} />
          </div>
        </div>
      </div>
    </CatalogProvider>
  );
}
