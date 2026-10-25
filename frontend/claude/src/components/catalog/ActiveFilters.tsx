"use client";

import { X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { CatalogFacets } from "@/types";
import { useCatalog } from "./CatalogContext";

export function ActiveFilters({ facets }: { facets: CatalogFacets }) {
  const { query, update, reset, locked } = useCatalog();
  const chips: { label: string; remove: () => void }[] = [];
  if (!locked.category) query.categorySlugs?.forEach((s) => chips.push({ label: facets.categories.find((c) => c.slug === s)?.name ?? s, remove: () => update({ categorySlugs: query.categorySlugs!.filter((x) => x !== s) }) }));
  if (!locked.brand) query.brandSlugs?.forEach((s) => chips.push({ label: facets.brands.find((b) => b.slug === s)?.name ?? s, remove: () => update({ brandSlugs: query.brandSlugs!.filter((x) => x !== s) }) }));
  query.sizes?.forEach((s) => chips.push({ label: `Size ${facets.sizeLabels?.[s] ?? s}`, remove: () => update({ sizes: query.sizes!.filter((x) => x !== s) }) }));
  query.colorIds?.forEach((s) => chips.push({ label: facets.colors.find((c) => c.id === s)?.name ?? s, remove: () => update({ colorIds: query.colorIds!.filter((x) => x !== s) }) }));
  if (query.minPrice !== undefined || query.maxPrice !== undefined)
    chips.push({
      label: `${query.minPrice !== undefined ? formatPrice(query.minPrice) : "Any"} – ${query.maxPrice !== undefined ? formatPrice(query.maxPrice) : "Any"}`,
      remove: () => update({ minPrice: undefined, maxPrice: undefined }),
    });
  if (query.offers) chips.push({ label: "On offer", remove: () => update({ offers: undefined }) });
  if (query.search) chips.push({ label: `“${query.search}”`, remove: () => update({ search: undefined }) });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={c.remove} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-selected px-3 text-xs text-primary hover:bg-primary/10" aria-label={`Remove filter ${c.label}`}>
          {c.label} <X className="h-3 w-3" aria-hidden />
        </button>
      ))}
      <button type="button" onClick={reset} className="px-1 text-xs text-ink-muted underline underline-offset-4 hover:text-ink">
        Clear all
      </button>
    </div>
  );
}
