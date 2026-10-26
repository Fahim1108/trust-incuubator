"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { SmartImage } from "@/components/ui";
import { PendingIndicator, SearchResultsSkeleton } from "@/components/ui/LoadingSkeleton";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { searchSuggestionsAction } from "@/services/actions";
import type { ProductSuggestion } from "@/services";

interface Suggestions { term: string; items: ProductSuggestion[]; pending: boolean; error: string | null }

/** Live suggestions use their own real request state; navigation keeps App Router streaming. */
export function SearchBar({ className, autoFocus, onNavigate, initialValue = "", variant = "pill" }: { className?: string; autoFocus?: boolean; onNavigate?: () => void; initialValue?: string; variant?: "pill" | "boxed" }) {
  const boxed = variant === "boxed";
  const { header } = useStorefront();
  const router = useRouter();
  const [term, setTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestions>({ term: "", items: [], pending: false, error: null });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [navigating, startNavigation] = useTransition();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const query = term.trim();
  const current = suggestions.term === query;
  const results = current ? suggestions.items : [];
  const pending = current && suggestions.pending;

  useEffect(() => {
    if (query.length < 2) return;
    let cancelled = false;
    const requestId = ++sequence.current;
    // Debounce requests, not the loading indicator or completion of an action.
    const handle = window.setTimeout(() => {
      setSuggestions({ term: query, items: [], pending: true, error: null });
      void (async () => {
        try {
          const items = await searchSuggestionsAction(query);
          if (!cancelled && requestId === sequence.current) {
            setSuggestions({ term: query, items, pending: false, error: null });
            setActive(-1);
          }
        } catch {
          if (!cancelled && requestId === sequence.current) setSuggestions({ term: query, items: [], pending: false, error: "Search is unavailable. Try again or view all results." });
        }
      })();
    }, 200);
    return () => { cancelled = true; window.clearTimeout(handle); };
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (href: string) => {
    if (navigating) return;
    setOpen(false);
    onNavigate?.();
    startNavigation(() => router.push(href));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigating) return;
    const selected = active >= 0 ? results[active] : undefined;
    go(selected ? `/product/${selected.slug}` : query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault(); setOpen(true); setActive(a => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); setOpen(true); setActive(a => a <= 0 ? results.length - 1 : a - 1);
    }
  };
  const showPanel = open && query.length >= 2;
  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form role="search" onSubmit={submit} className={cn("aa-search-form", boxed && "flex overflow-hidden rounded-[10px] border border-primary/20 bg-surface shadow-[0_1px_3px_rgba(70,1,1,0.06)]")}>
        <label htmlFor={`${listId}-input`} className="sr-only">Search products</label>
        <Search className={cn("aa-search-icon pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted", boxed ? "left-3.5 h-[18px] w-[18px]" : "left-3.5 h-4 w-4")} aria-hidden />
        <input
          id={`${listId}-input`} type="search" role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 && results[active] ? `${listId}-opt-${active}` : undefined}
          autoComplete="off" autoFocus={autoFocus} value={term}
          onChange={e => { if (e.target.value.trim() !== query) sequence.current++; setTerm(e.target.value); setActive(-1); setOpen(true); }}
          onFocus={() => setOpen(true)} onKeyDown={onKeyDown} placeholder={header.searchPlaceholder}
          className={cn("w-full text-sm text-ink placeholder:text-ink-muted/80 focus:outline-none [&::-webkit-search-cancel-button]:hidden", boxed ? "h-[46px] min-w-0 flex-1 bg-transparent pl-11 pr-8 text-[14px]" : "h-11 rounded-full border border-line bg-surface pl-10 pr-10 focus:border-primary/50")}
        />
        {term && <button type="button" onClick={() => { sequence.current++; setTerm(""); setActive(-1); }} className={cn("aa-press absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-muted hover:text-ink", boxed ? "right-[54px]" : "right-2")} aria-label="Clear search"><X className="h-4 w-4" /></button>}
        {boxed && <button type="submit" disabled={navigating} aria-busy={navigating || undefined} className="aa-press flex w-[48px] shrink-0 items-center justify-center bg-primary text-white hover:bg-primary-dark disabled:cursor-not-allowed" aria-label="Search">
          {navigating ? <PendingIndicator label="Loading search results" /> : <Search className="h-5 w-5" strokeWidth={2} />}
        </button>}
      </form>
      {showPanel && <div className="absolute inset-x-0 top-full z-50 mt-2 origin-top animate-dropdown-in overflow-hidden rounded-card border border-line bg-surface shadow-lift">
        <ul id={listId} role="listbox" aria-label="Product suggestions" aria-busy={pending} className="max-h-[60vh] overflow-y-auto py-1">
          {results.map((r, i) => <li key={r.slug} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
            <Link href={`/product/${r.slug}`} onClick={() => { setOpen(false); onNavigate?.(); }} className={cn("flex items-center gap-3 px-3 py-2 hover:bg-selected", i === active && "bg-selected")}>
              <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-surface"><SmartImage src={r.image.src} alt="" fill sizes="40px" className="object-cover" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink">{r.name}</span><span className="block text-xs text-ink-muted">{r.categoryName}</span></span>
              <span className="text-sm font-medium text-ink">{formatPrice(r.price)}</span>
            </Link>
          </li>)}
          {pending && <li role="presentation"><SearchResultsSkeleton/></li>}
          {current && !pending && suggestions.error && <li role="presentation" className="px-4 py-3 text-sm text-warning"><span role="status">{suggestions.error}</span></li>}
          {current && !pending && !suggestions.error && results.length === 0 && <li role="presentation" className="px-4 py-3 text-sm text-ink-muted">No products match “{query}”.</li>}
        </ul>
        <button type="button" disabled={navigating} onClick={() => go(`/shop?q=${encodeURIComponent(query)}`)} className="aa-press block w-full border-t border-line px-4 py-3 text-left text-sm font-medium text-primary hover:bg-selected">See all results for “{query}”</button>
      </div>}
    </div>
  );
}
