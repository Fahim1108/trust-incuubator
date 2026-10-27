import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Category } from "@/types";

export function CategoryCard({ category, variant = "tile", productCount }: { category: Category; variant?: "tile" | "circle" | "feature"; productCount?: number }) {
  if (variant === "circle") {
    return (
      <Link href={`/category/${category.slug}`} className="group flex flex-col items-center gap-2 text-center">
        <span className="relative h-[68px] w-[68px] overflow-hidden rounded-full border border-line bg-white border border-line transition-colors group-hover:border-primary/40 transition-colors group-hover:border-primary/50 sm:h-20 sm:w-20">
          <SmartImage src={category.image.src} alt="" fill sizes="80px" className="object-cover" />
        </span>
        <span className="text-xs text-ink group-hover:text-primary">{category.name}</span>
      </Link>
    );
  }
  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div className={cn("relative overflow-hidden rounded-card bg-white border border-line transition-colors group-hover:border-primary/40", variant === "feature" ? "aspect-[4/5]" : "aspect-[8/9]")}>
        <SmartImage src={category.image.src} alt={category.image.alt} fill sizes="(min-width:1024px) 16vw, 33vw" className="object-cover" />
        {variant === "feature" && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent" />}
        {variant === "feature" && (
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="flex items-center gap-1.5 font-serif text-2xl">
              {category.name}
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            </p>
            {productCount !== undefined && <p className="text-xs opacity-80">{productCount} products</p>}
          </div>
        )}
      </div>
      {variant === "tile" && (
        <p className="mt-2.5 flex items-center justify-center gap-1 text-sm text-ink transition-colors duration-300 group-hover:text-primary">
          {category.name}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
        </p>
      )}
    </Link>
  );
}
