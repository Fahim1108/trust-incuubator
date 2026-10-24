"use client";

import { Banknote, CheckCircle2, CircleAlert, RotateCcw, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Price, Rating } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import { findVariant, firstAvailableSize, isSizeAvailable, toCartLine } from "@/lib/product";
import type { Product, SizeGuide } from "@/types";
import { QuantitySelector } from "./QuantitySelector";
import { SizeGuideModal } from "./SizeGuideModal";
import { ColorSelector, SizeSelector } from "./VariantSelector";
import { WishlistButton } from "./WishlistButton";

interface Props {
  product: Product;
  brandName?: string;
  colorId: string;
  onColorChange: (id: string) => void;
  sizeGuide?: SizeGuide | null;
  compact?: boolean;
  onAdded?: () => void;
  headingLevel?: "h1" | "h2";
}

export function ProductPurchasePanel({ product, brandName, colorId, onColorChange, sizeGuide, compact, onAdded, headingLevel = "h1" }: Props) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | undefined>(oneSize ? product.sizes[0] : undefined);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState<string>();
  const [guideOpen, setGuideOpen] = useState(false);

  const variant = size ? findVariant(product, colorId, size) : undefined;
  const stock = variant?.stock ?? 0;
  const colorHasStock = useMemo(() => Boolean(firstAvailableSize(product, colorId)), [product, colorId]);

  const changeColor = (id: string) => {
    onColorChange(id);
    if (size && !isSizeAvailable(product, id, size)) setSize(oneSize ? product.sizes[0] : undefined);
    setQty(1);
  };

  const add = (buyNow: boolean) => {
    if (!size || !variant) {
      setSizeError("Please select a size");
      return;
    }
    if (variant.stock < 1) return;
    addItem(toCartLine(product, variant, brandName), qty);
    onAdded?.();
    if (buyNow) {
      router.push("/checkout");
    } else {
      // The opening drawer is the confirmation (a toast would overlap it on phones).
      openDrawer();
    }
  };

  const Title = headingLevel;

  return (
    <div className={cn("space-y-6", compact && "space-y-5")}>
      <div className="space-y-2.5">
        {brandName && <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">{brandName}</p>}
        <Title className={cn("font-serif leading-tight text-ink", compact ? "text-2xl" : "text-3xl sm:text-[40px]")}>{product.name}</Title>
        <a href="#reviews" className={cn("inline-block", compact && "pointer-events-none")}>
          <Rating value={product.rating.average} count={product.rating.count} />
        </a>
        <Price price={product.price} compareAt={product.compareAtPrice} size="lg" showBadge />
        {!compact && <p className="text-sm leading-relaxed text-ink-muted">{product.shortDescription}</p>}
      </div>

      <ColorSelector colors={product.colors} value={colorId} onChange={changeColor} />

      <SizeSelector
        sizes={product.sizes}
        value={size}
        onChange={(s) => {
          setSize(s);
          setSizeError(undefined);
          setQty(1);
        }}
        isAvailable={(s) => isSizeAvailable(product, colorId, s)}
        onSizeGuide={sizeGuide && !compact ? () => setGuideOpen(true) : undefined}
        error={sizeError}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, stock || 10)} />
        </div>
        <StockStatus inStock={colorHasStock} stock={variant ? stock : undefined} />
      </div>

      <div className="space-y-2.5">
        <div className="flex gap-2.5">
          <Button size="lg" fullWidth onClick={() => add(false)} disabled={!colorHasStock || (variant && stock < 1)} leftIcon={<ShoppingBag className="h-4 w-4" />}>
            {colorHasStock ? "Add to Cart" : "Sold Out"}
          </Button>
          {!compact && <WishlistButton productId={product.id} productName={product.name} variant="inline" className="h-12 w-12 shrink-0" />}
        </div>
        <Button size="lg" variant="secondary" fullWidth onClick={() => add(true)} disabled={!colorHasStock || (variant && stock < 1)} leftIcon={<Zap className="h-4 w-4" />}>
          Buy Now
        </Button>
        {compact && (
          <Link href={`/product/${product.slug}`} className="block pt-1 text-center text-xs text-primary underline underline-offset-4">
            View full details
          </Link>
        )}
      </div>

      {!compact && (
        <ul className="grid grid-cols-3 gap-2 border-y border-line py-4 text-center">
          {[
            { Icon: Banknote, title: "Cash on Delivery", sub: "Across Bangladesh" },
            { Icon: RotateCcw, title: "Easy Returns", sub: "7 days" },
            { Icon: ShieldCheck, title: "Secure Shopping", sub: "Your data is safe" },
          ].map(({ Icon, title, sub }) => (
            <li key={title} className="flex flex-col items-center gap-1.5">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} aria-hidden />
              <span className="text-[11px] font-medium leading-tight text-ink">{title}</span>
              <span className="text-[10px] leading-tight text-ink-muted">{sub}</span>
            </li>
          ))}
        </ul>
      )}

      {sizeGuide && <SizeGuideModal guide={sizeGuide} open={guideOpen} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

function StockStatus({ inStock, stock }: { inStock: boolean; stock?: number }) {
  if (!inStock || stock === 0)
    return (
      <span className="flex items-center gap-1.5 text-xs text-danger">
        <CircleAlert className="h-4 w-4" aria-hidden /> Out of stock
      </span>
    );
  if (stock !== undefined && stock <= 3)
    return (
      <span className="flex items-center gap-1.5 text-xs text-warning">
        <CircleAlert className="h-4 w-4" aria-hidden /> Only {stock} left
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-success">
      <CheckCircle2 className="h-4 w-4" aria-hidden /> In Stock
    </span>
  );
}
