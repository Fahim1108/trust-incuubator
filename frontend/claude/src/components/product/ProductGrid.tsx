import type { Brand, Product } from "@/types";
import { cn } from "@/lib/cn";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, brands = [], columns = 4, className }: { products: Product[]; brands?: Brand[]; columns?: 3 | 4 | 6; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3", columns === 4 && "lg:grid-cols-4", columns === 6 && "lg:grid-cols-6 lg:gap-x-4", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} brandName={brands.find((b) => b.id === p.brandId)?.name} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
