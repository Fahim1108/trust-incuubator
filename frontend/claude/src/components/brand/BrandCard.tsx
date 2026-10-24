import Link from "next/link";
import { SmartImage } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Brand } from "@/types";

/** Renders a brand logo image if provided, otherwise a typographic wordmark. */
/** `compact` tightens letter-spacing so long names fit small tiles. */
export function BrandWordmark({ brand, className, compact }: { brand: Brand; className?: string; compact?: boolean }) {
  const w = brand.wordmark;
  const family = w.fontFamily === "serif" || w.fontFamily === "script" ? "font-serif" : "font-sans";
  return (
    <span
      className={cn(family, w.fontFamily === "condensed" && "scale-x-90", "whitespace-nowrap text-ink", className)}
      style={{ letterSpacing: compact ? "-0.01em" : w.letterSpacing, fontWeight: compact ? Math.max(w.weight ?? 500, 600) : w.weight, fontStyle: w.italic ? "italic" : undefined, textTransform: w.uppercase ? "uppercase" : undefined }}
    >
      {brand.name}
    </span>
  );
}

export function BrandCard({ brand, productCount, className }: { brand: Brand; productCount?: number; className?: string }) {
  return (
    <Link href={`/brand/${brand.slug}`} className={cn("group flex h-[76px] flex-col items-center justify-center rounded-card border border-line bg-surface px-3 transition-all hover:border-primary/40 hover:shadow-soft sm:h-[92px]", className)} aria-label={brand.name}>
      {brand.logo ? (
        <span className="relative h-10 w-full">
          <SmartImage src={brand.logo.src} alt={brand.logo.alt} fill sizes="160px" className="object-contain" />
        </span>
      ) : (
        <BrandWordmark brand={brand} className="text-base transition-colors group-hover:text-primary sm:text-xl" />
      )}
      {productCount !== undefined && <span className="mt-1 text-[11px] text-ink-muted">{productCount} items</span>}
    </Link>
  );
}
