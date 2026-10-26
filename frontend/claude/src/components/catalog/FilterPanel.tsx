"use client";

import { Accordion, Checkbox } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CatalogFacets } from "@/types";
import { useCatalog } from "./CatalogContext";

const toggle = (list: string[] | undefined, value: string) => {
  const cur = list ?? [];
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  return next.length ? next : undefined;
};

export function FilterPanel({ facets }: { facets: CatalogFacets }) {
  const { query, update, locked } = useCatalog();

  const items = [
    !locked.category &&
      facets.categories.length > 0 && {
        id: "category",
        title: "Category",
        content: (
          <ul className="space-y-2.5">
            {facets.categories.map((c) => (
              <li key={c.slug}>
                <Checkbox
                  label={
                    <span className="flex w-full justify-between gap-3">
                      {c.name} <span className="text-xs text-ink-muted">{c.count}</span>
                    </span>
                  }
                  checked={query.categorySlugs?.includes(c.slug) ?? false}
                  onChange={() => update({ categorySlugs: toggle(query.categorySlugs, c.slug) })}
                  className="[&>span]:flex-1"
                />
              </li>
            ))}
          </ul>
        ),
      },
    !locked.brand &&
      facets.brands.length > 0 && {
        id: "brand",
        title: "Brand",
        content: (
          <ul className="space-y-2.5">
            {facets.brands.map((b) => (
              <li key={b.slug}>
                <Checkbox
                  label={
                    <span className="flex w-full justify-between gap-3">
                      {b.name} <span className="text-xs text-ink-muted">{b.count}</span>
                    </span>
                  }
                  checked={query.brandSlugs?.includes(b.slug) ?? false}
                  onChange={() => update({ brandSlugs: toggle(query.brandSlugs, b.slug) })}
                  className="[&>span]:flex-1"
                />
              </li>
            ))}
          </ul>
        ),
      },
    facets.sizes.length > 0 && {
      id: "size",
      title: "Size",
      content: (
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => {
            const active = query.sizes?.includes(s) ?? false;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => update({ sizes: toggle(query.sizes, s) })}
                className={cn("h-9 min-w-[44px] rounded-control border px-2.5 text-sm transition-colors duration-200", active ? "border-primary bg-primary text-white" : "border-line text-ink hover:border-ink/50")}
              >
                {facets.sizeLabels?.[s] ?? s}
              </button>
            );
          })}
        </div>
      ),
    },
    {id:'availability',title:'Availability',content:<Checkbox label="In stock" checked={query.inStock??false} onChange={()=>update({inStock:query.inStock?undefined:true})}/>},
  ].filter(Boolean) as { id: string; title: string; content: React.ReactNode }[];

  return <Accordion items={items} defaultOpen={items.map((i) => i.id)} className="border-t-0" />;
}
