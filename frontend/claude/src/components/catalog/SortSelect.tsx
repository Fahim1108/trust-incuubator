"use client";

import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/catalog-query";
import type { SortOption } from "@/types";
import { useCatalog } from "./CatalogContext";

export function SortSelect({ className }: { className?: string }) {
  const { query, update } = useCatalog();
  return (
    <label className={className}>
      <span className="sr-only">Sort by</span>
      <span className="relative inline-flex">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden />
        <select
          value={query.sort ?? "featured"}
          onChange={(e) => update({ sort: e.target.value as SortOption })}
          className="h-10 appearance-none rounded-control border border-line bg-surface pl-8 pr-8 text-xs text-ink focus:border-primary focus:outline-none sm:text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
