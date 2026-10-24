"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Accordion, Checkbox } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isLightColor } from "@/lib/color";
import { formatPrice } from "@/lib/format";
import type { CatalogFacets } from "@/types";
import { useCatalog } from "./CatalogContext";

const toggle = (list: string[] | undefined, value: string) => {
  const cur = list ?? [];
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  return next.length ? next : undefined;
};

const PRICE_PRESETS = [
  { label: "Under ৳1,500", min: undefined, max: 1500 },
  { label: "৳1,500 – ৳2,500", min: 1500, max: 2500 },
  { label: "৳2,500 – ৳4,000", min: 2500, max: 4000 },
  { label: "Over ৳4,000", min: 4000, max: undefined },
];

export function FilterPanel({ facets }: { facets: CatalogFacets }) {
  const { query, update, locked } = useCatalog();
  const [min, setMin] = useState(query.minPrice?.toString() ?? "");
  const [max, setMax] = useState(query.maxPrice?.toString() ?? "");

  const [priceQuery, setPriceQuery] = useState({ min: query.minPrice, max: query.maxPrice });
  if (priceQuery.min !== query.minPrice || priceQuery.max !== query.maxPrice) {
    setPriceQuery({ min: query.minPrice, max: query.maxPrice });
    setMin(query.minPrice?.toString() ?? "");
    setMax(query.maxPrice?.toString() ?? "");
  }

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
    {
      id: "price",
      title: "Price",
      content: (
        <div className="space-y-3">
          <ul className="space-y-1">
            {PRICE_PRESETS.map((p) => {
              const active = query.minPrice === p.min && query.maxPrice === p.max;
              return (
                <li key={p.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => update(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min, maxPrice: p.max })}
                    className={cn("w-full rounded px-2 py-1.5 text-left text-sm", active ? "bg-selected text-primary" : "text-ink hover:bg-ink/5")}
                  >
                    {p.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              update({ minPrice: min ? Number(min) : undefined, maxPrice: max ? Number(max) : undefined });
            }}
          >
            <label className="flex-1 text-xs text-ink-muted">
              Min
              <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder={String(facets.priceRange.min)} className="mt-1 h-10 w-full rounded-control border border-line px-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
            </label>
            <label className="flex-1 text-xs text-ink-muted">
              Max
              <input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={String(facets.priceRange.max)} className="mt-1 h-10 w-full rounded-control border border-line px-2.5 text-sm text-ink focus:border-primary focus:outline-none" />
            </label>
            <button type="submit" className="h-10 rounded-control bg-ink px-3 text-xs font-medium text-white hover:bg-primary">
              Go
            </button>
          </form>
          <p className="text-[11px] text-ink-muted">
            Range: {formatPrice(facets.priceRange.min)} – {formatPrice(facets.priceRange.max)}
          </p>
        </div>
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
                className={cn("h-9 min-w-[44px] rounded-control border px-2.5 text-xs", active ? "border-primary bg-primary text-white" : "border-line text-ink hover:border-ink/50")}
              >
                {s}
              </button>
            );
          })}
        </div>
      ),
    },
    facets.colors.length > 0 && {
      id: "color",
      title: "Color",
      content: (
        <div className="grid grid-cols-5 gap-2">
          {facets.colors.map((c) => {
            const active = query.colorIds?.includes(c.id) ?? false;
            return (
              <button key={c.id} type="button" aria-pressed={active} title={c.name} aria-label={c.name} onClick={() => update({ colorIds: toggle(query.colorIds, c.id) })} className="flex flex-col items-center gap-1">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", active ? "border-primary" : "border-transparent")}>
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", isLightColor(c.hex) && "ring-1 ring-inset ring-ink/15")} style={{ backgroundColor: c.hex }}>
                    {active && <Check className={cn("h-3 w-3", isLightColor(c.hex) ? "text-ink" : "text-white")} />}
                  </span>
                </span>
                <span className="text-[10px] text-ink-muted">{c.name}</span>
              </button>
            );
          })}
        </div>
      ),
    },
  ].filter(Boolean) as { id: string; title: string; content: React.ReactNode }[];

  return <Accordion items={items} defaultOpen={items.map((i) => i.id)} className="border-t-0" />;
}
