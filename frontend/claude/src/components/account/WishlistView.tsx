"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink, EmptyState, ProductGridSkeleton } from "@/components/ui";
import { useWishlist } from "@/context/WishlistContext";
import { getProductsByIdsAction } from "@/services/actions";
import type { Product } from "@/types";

export function WishlistView() {
  const { ids, hydrated } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    getProductsByIdsAction(ids).then((p) => !cancelled && setProducts(p));
    return () => {
      cancelled = true;
    };
  }, [ids, hydrated]);

  if (!hydrated || products === null) return <ProductGridSkeleton count={4} />;
  const visible = products.filter((p) => ids.includes(p.id));
  if (!visible.length)
    return <EmptyState icon={<Heart className="h-7 w-7" />} title="Your wishlist is empty" description="Tap the heart on any product to save it for later." action={<ButtonLink href="/shop">Discover Products</ButtonLink>} />;
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {visible.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
