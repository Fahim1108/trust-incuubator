"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { BrandWordmark } from "@/components/brand/BrandCard";
import { SmartImage } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Brand, Category } from "@/types";

/** Phone-only "Categories | Brands" switcher with photo cards (approved mobile mockup). */
export function CategoryBrandTabs({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [tab, setTab] = useState<"categories" | "brands">("categories");
  const id = useId();
  const tabs = [
    { key: "categories" as const, label: "Categories" },
    { key: "brands" as const, label: "Brands" },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Browse by" className="grid grid-cols-2 rounded-[10px] border border-line bg-white p-0 sm:max-w-[460px] sm:rounded-md">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`${id}-${t.key}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`${id}-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn("h-[40px] rounded-[10px] text-[15px] sm:h-[34px] sm:rounded-md sm:text-[14px] transition-colors", tab === t.key ? "bg-primary font-medium text-white shadow-sm" : "text-ink-muted")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`${id}-categories`} role="tabpanel" aria-labelledby={`${id}-categories-tab`} hidden={tab !== "categories"}>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-4">
          {categories.map((c) => {
            const img = c.thumbnail ?? c.image;
            return (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="group block overflow-hidden rounded-xl bg-surface shadow-[0_2px_10px_-4px_rgba(23,23,23,0.18)] ring-1 ring-ink/[0.04] transition-transform duration-200 active:scale-[0.98]">
                  <span className="relative block aspect-[3/2] overflow-hidden bg-[#F4F2F0] sm:aspect-[7/3]">
                    <SmartImage src={img.src} alt={img.alt} fill sizes="34vw" className="object-cover transition-[transform,filter] duration-[400ms] ease-out group-hover:scale-105 group-hover:brightness-[1.04] group-active:scale-105" />
                  </span>
                  <span className="flex items-center justify-between gap-1 px-2.5 py-2">
                    <span className="truncate text-[12.5px] font-medium text-ink">{c.name}</span>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={`${id}-brands`} role="tabpanel" aria-labelledby={`${id}-brands-tab`} hidden={tab !== "brands"}>
        <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-4">
          {brands.slice(0, 6).map((b) => (
            <li key={b.id}>
              <Link href={`/brand/${b.slug}`} className="flex h-[92px] flex-col items-center justify-center gap-2 rounded-xl bg-surface px-2 shadow-[0_2px_10px_-4px_rgba(23,23,23,0.18)] ring-1 ring-ink/[0.04]">
                {b.logo ? (
                  <span className="relative h-8 w-full">
                    <SmartImage src={b.logo.src} alt={b.logo.alt} fill sizes="30vw" className="object-contain" />
                  </span>
                ) : (
                  <BrandWordmark brand={b} compact={b.name.length > 7} className={b.name.length > 7 ? "text-[12px]" : "text-[15px]"} />
                )}
                <span className="flex items-center gap-0.5 text-[11px] text-ink-muted">
                  Shop <ChevronRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Phone-only compact row of brand tiles ("Top Brands" in the mobile mockup). */
export function TopBrandsRow({ brands }: { brands: Brand[] }) {
  return (
    <ul className="grid grid-cols-6 gap-1.5 lg:grid-cols-10 lg:gap-3">
      {brands.slice(0, 10).map((b, i) => (
        <li key={b.id} className={i >= 6 ? "hidden lg:block" : undefined}>
          <Link href={`/brand/${b.slug}`} aria-label={b.name} className="flex aspect-[11/10] items-center justify-center overflow-hidden rounded-lg bg-surface px-1 transition-shadow duration-300 hover:shadow-soft lg:aspect-[2/1] lg:rounded-md shadow-[0_2px_8px_-4px_rgba(23,23,23,0.2)] ring-1 ring-ink/[0.04]">
            {b.logo ? (
              <span className="relative h-7 w-full">
                <SmartImage src={b.logo.src} alt="" fill sizes="16vw" className="object-contain" />
              </span>
            ) : (
              <BrandWordmark brand={b} compact className={b.name.length > 5 ? "text-[min(2.5vw,11px)] lg:text-[13px]" : "text-[min(3.4vw,15px)] lg:text-[20px]"} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
