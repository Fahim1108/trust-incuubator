"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCatalog } from "./CatalogContext";

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1), end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { update } = useCatalog();
  if (totalPages <= 1) return null;
  const go = (p: number) => {
    update({ page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const btn = "flex h-10 min-w-10 items-center justify-center rounded-control border px-3 text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => go(page - 1)} disabled={page <= 1} className={cn(btn, "border-line disabled:opacity-40")} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink-muted">…</span>
        ) : (
          <button key={p} type="button" onClick={() => go(p)} aria-current={p === page ? "page" : undefined} className={cn(btn, p === page ? "border-primary bg-primary text-white" : "border-line text-ink hover:border-ink/50")}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => go(page + 1)} disabled={page >= totalPages} className={cn(btn, "border-line disabled:opacity-40")} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
