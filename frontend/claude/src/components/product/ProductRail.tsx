import type { Brand, Product } from "@/types";
import { ProductCard } from "./ProductCard";

/** Horizontal scroll on phones, grid on larger screens. */
export function ProductRail({ products, brands = [], columns = 6 }: { products: Product[]; brands?: Brand[]; columns?: 4 | 6 }) {
  return (
    <ul className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 ${columns === 6 ? "lg:grid-cols-4 xl:grid-cols-6" : "lg:grid-cols-4"}`}>
      {products.map((p) => (
        <li key={p.id} className="w-[44vw] max-w-[220px] shrink-0 snap-start sm:w-auto sm:max-w-none">
          <ProductCard product={p} brandName={brands.find((b) => b.id === p.brandId)?.name} sizes="(min-width:1280px) 16vw, (min-width:640px) 33vw, 44vw" />
        </li>
      ))}
    </ul>
  );
}
