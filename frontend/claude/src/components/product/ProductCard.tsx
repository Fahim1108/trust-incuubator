"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Price, Rating, SmartImage } from "@/components/ui";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/cn";
import { discountPercent } from "@/lib/format";
import { findVariant, firstAvailableSize, imagesForColor, toCartLine, totalStock } from "@/lib/product";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import { useRouter } from "next/navigation";
import { ProductSizeBadge } from "./ProductSizeBadge";
import { WishlistButton } from "./WishlistButton";

export interface ProductCardProps {
  product: Product;
  brandName?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProductCard({ product, brandName, priority, sizes = "(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw", className }: ProductCardProps) {
  const { productCard: cfg } = useStorefront();
  const [colorId] = useState(product.colors[0]?.id);
  const router = useRouter();
  const { addItem, openDrawer } = useCart();

  /** One-size items go straight to the cart; sized items open their product details for variant selection. */
  const addToCart = () => {
    // Prefer the shown colour, then any in-stock colour (one-size items only).
    const colors = [colorId, ...product.colors.map((c) => c.id)].filter((c): c is string => Boolean(c));
    const color = product.sizes.length === 1 ? colors.find((c) => firstAvailableSize(product, c)) : undefined;
    const size = color ? firstAvailableSize(product, color) : undefined;
    const variant = color && size ? findVariant(product, color, size) : undefined;
    if (variant && variant.stock > 0) {
      addItem(toCartLine(product, variant, brandName));
      openDrawer();
    } else {
      router.push(href);
    }
  };
  const images = imagesForColor(product, colorId);
  const main = images[0];
  const hover = images[1];
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = totalStock(product) === 0;
  const href = `/product/${product.slug}${colorId && colorId !== product.colors[0]?.id ? `?color=${colorId}` : ""}`;

  return (
    <article className={cn("aa-product-card group relative", className)}>
      <div className={cn("relative overflow-hidden rounded-card", cfg.imageAspect === "portrait" ? "aspect-[4/5]" : cfg.imageAspect === "landscape" ? "aspect-[4/3]" : "aspect-square")} style={{ backgroundColor: cfg.imageBackground }}>
        <Link href={href} aria-label={product.name} className="aa-press absolute inset-0">
          {/* Hover (pointer devices only): gentle 1.05 zoom + cross-fade to the secondary image. */}
          <span className="aa-product-photo absolute inset-0">
            {main && <SmartImage src={main.src} alt={main.alt} fill priority={priority} sizes={sizes} className={cn("aa-product-secondary object-cover", hover && "[@media(hover:hover)]:group-hover:opacity-0")} />}
            {hover && <SmartImage src={hover.src} alt="" fill sizes={sizes} className="aa-product-secondary object-cover opacity-0 [@media(hover:hover)]:group-hover:opacity-100" />}
          </span>
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          <ProductSizeBadge product={product} />
          {soldOut ? (
            <Badge tone="dark">Sold out</Badge>
          ) : (
            <>
              {cfg.showDiscountBadge && off > 0 && <Badge>{off}% off</Badge>}
              {product.badges.includes("new") && <Badge tone="outline">New</Badge>}
              {product.badges.includes("limited") && <Badge tone="dark">Limited</Badge>}
            </>
          )}
        </div>
        {cfg.showWishlist && <WishlistButton productId={product.id} productName={product.name} className="absolute right-2.5 top-2.5" />}

      </div>
      <div className="mt-3 space-y-1.5 px-0.5">
        {cfg.showBrand && brandName && <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">{brandName}</p>}
        <h3 className="line-clamp-1 text-sm text-ink sm:text-[15px]">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAtPrice} accent={cfg.showAddToCart} />
        {cfg.showRating && product.rating.count > 0 && <Rating value={product.rating.average} count={product.rating.count} />}
        {cfg.showAddToCart && (
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className="aa-press group/btn mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-control bg-primary text-xs font-medium text-white transition-colors duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden /> {soldOut ? "Sold Out" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}
