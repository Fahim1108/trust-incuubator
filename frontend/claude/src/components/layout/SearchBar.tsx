"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { SmartImage } from "@/components/ui";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { searchSuggestionsAction } from "@/services/actions";
import type { ProductSuggestion } from "@/services";

/** Search input with live product suggestions (via a server action) and keyboard navigation. */
export function SearchBar({ className, autoFocus, onNavigate, initialValue = "", variant = "pill" }: { className?: string; autoFocus?: boolean; onNavigate?: () => void; initialValue?: string; variant?: "pill" | "boxed" }) {
  const boxed = variant === "boxed";
  const { header } = useStorefront();
  const router = useRouter();
  const [term, setTerm] = useState(initialValue);
  const [results, setResults] = useState<ProductSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pending, startTransition] = useTransition();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = term.trim();
    if (t.length < 2) return;
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        setResults(await searchSuggestionsAction(t));
        setActive(-1);
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [term]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = active >= 0 ? results[active] : undefined;
    if (selected) return go(`/product/${selected.slug}`);
    const t = term.trim();
    go(t ? `/shop?q=${encodeURIComponent(t)}` : "/shop");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && term.trim().length >= 2;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form role="search" onSubmit={submit} className={boxed ? "flex overflow-hidden rounded-[10px] border border-primary/20 bg-surface shadow-[0_1px_3px_rgba(70,1,1,0.06)]" : undefined}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted", boxed ? "left-3.5 h-[18px] w-[18px]" : "left-3.5 h-4 w-4")} aria-hidden />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setActive(-1);
            if (e.target.value.trim().length < 2) setResults([]);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={header.searchPlaceholder}
          className={cn(
            "w-full text-sm text-ink placeholder:text-ink-muted/80 focus:outline-none [&::-webkit-search-cancel-button]:hidden",
            boxed
              ? "h-[46px] min-w-0 flex-1 bg-transparent pl-11 pr-8 text-[14px]"
              : "h-11 rounded-full border border-line bg-[#F7F6F5] pl-10 pr-10 focus:border-primary/50 focus:bg-surface focus:ring-2 focus:ring-primary/10",
          )}
        />
        {term && (
          <button type="button" onClick={() => { setTerm(""); setResults([]); setActive(-1); }} className={cn("absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-muted hover:text-ink", boxed ? "right-[54px]" : "right-2")} aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
        {boxed && (
          <button type="submit" className="flex w-[48px] shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-primary-dark" aria-label="Search">
            <Search className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </form>
      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 origin-top animate-dropdown-in overflow-hidden rounded-card border border-line bg-surface shadow-lift">
          <ul id={listId} role="listbox" aria-label="Product suggestions" className="max-h-[60vh] overflow-y-auto py-1">
            {results.map((r, i) => (
              <li key={r.slug} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={`/product/${r.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={cn("flex items-center gap-3 px-3 py-2 hover:bg-selected", i === active && "bg-selected")}
                >
                  <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-[#F4F2F0]">
                    <SmartImage src={r.image.src} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{r.name}</span>
                    <span className="block text-xs text-ink-muted">{r.categoryName}</span>
                  </span>
                  <span className="text-sm font-medium text-ink">{formatPrice(r.price)}</span>
                </Link>
              </li>
            ))}
            {!pending && results.length === 0 && <li className="px-4 py-3 text-sm text-ink-muted">No products match “{term.trim()}”.</li>}
            {pending && results.length === 0 && <li className="px-4 py-3 text-sm text-ink-muted">Searching…</li>}
          </ul>
          <button type="button" onClick={() => go(`/shop?q=${encodeURIComponent(term.trim())}`)} className="block w-full border-t border-line px-4 py-3 text-left text-sm font-medium text-primary hover:bg-selected">
            See all results for “{term.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
