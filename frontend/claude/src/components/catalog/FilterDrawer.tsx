"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button, Drawer } from "@/components/ui";
import type { CatalogFacets } from "@/types";
import { useCatalog } from "./CatalogContext";
import { FilterPanel } from "./FilterPanel";

/** Mobile/tablet filter drawer. Filters apply instantly; the button just closes the drawer. */
export function FilterDrawer({ facets, total, activeCount }: { facets: CatalogFacets; total: number; activeCount: number }) {
  const [open, setOpen] = useState(false);
  const { reset, pending } = useCatalog();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-control border border-line px-3.5 text-xs text-ink hover:border-ink/40 sm:text-sm lg:hidden">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        Filter
        {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">{activeCount}</span>}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        side="left"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={reset} disabled={!activeCount}>
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)} loading={pending}>
              Show {total} results
            </Button>
          </div>
        }
      >
        <div className="px-5">
          <FilterPanel facets={facets} />
        </div>
      </Drawer>
    </>
  );
}
