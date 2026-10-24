"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useTransition, type ReactNode } from "react";
import { toSearchParams } from "@/lib/catalog-query";
import { cn } from "@/lib/cn";
import type { ProductQueryInput } from "@/services";

interface CatalogContextValue {
  query: ProductQueryInput;
  /** Filters fixed by the page (e.g. category on a category page). Not shown as removable. */
  locked: { category?: string; brand?: string };
  pending: boolean;
  update: (patch: Partial<ProductQueryInput>) => void;
  reset: () => void;
}

const Ctx = createContext<CatalogContextValue | null>(null);

/** URL is the single source of truth for catalogue filters — easy for a backend to read. */
export function CatalogProvider({ query, locked = {}, children }: { query: ProductQueryInput; locked?: CatalogContextValue["locked"]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (q: ProductQueryInput) => {
      const params = toSearchParams({ ...q, categorySlugs: locked.category ? undefined : q.categorySlugs, brandSlugs: locked.brand ? undefined : q.brandSlugs });
      const qs = params.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [router, pathname, locked.category, locked.brand],
  );

  const update = useCallback((patch: Partial<ProductQueryInput>) => navigate({ ...query, ...patch, page: patch.page ?? 1 }), [navigate, query]);
  const reset = useCallback(() => navigate({ search: query.search, sort: query.sort }), [navigate, query.search, query.sort]);

  return <Ctx.Provider value={{ query, locked, pending, update, reset }}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return c;
}

export function CatalogResults({ children }: { children: ReactNode }) {
  const { pending } = useCatalog();
  return (
    <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-50")}>
      {children}
    </div>
  );
}
