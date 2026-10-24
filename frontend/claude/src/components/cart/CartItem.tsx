"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { SmartImage } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { CartItem as CartItemType } from "@/types";

export function CartItem({ item, compact = false, onNavigate }: { item: CartItemType; compact?: boolean; onNavigate?: () => void }) {
  const { updateQuantity, removeItem } = useCart();
  return (
    <div className={cn("flex gap-3 sm:gap-4", compact ? "py-4" : "py-5")}>
      <Link href={`/product/${item.productSlug}`} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden rounded bg-[#F4F2F0]", compact ? "h-[88px] w-[72px]" : "h-28 w-[90px] sm:h-32 sm:w-[104px]")}>
        <SmartImage src={item.image.src} alt={item.image.alt} fill sizes="104px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/product/${item.productSlug}`} onClick={onNavigate} className="line-clamp-2 text-sm text-ink hover:text-primary">
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-muted">
              {item.colorName} · {item.size}
            </p>
          </div>
          <button type="button" onClick={() => removeItem(item.id)} className="-mr-1.5 -mt-1 rounded-full p-1.5 text-primary/80 hover:bg-selected hover:text-primary" aria-label={`Remove ${item.name} from cart`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <QuantitySelector size="sm" value={item.quantity} max={item.maxQuantity} onChange={(q) => updateQuantity(item.id, q)} label={`Quantity for ${item.name}`} />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{formatPrice(item.unitPrice * item.quantity)}</p>
            {item.quantity > 1 && <p className="text-[11px] text-ink-muted">{formatPrice(item.unitPrice)} each</p>}
          </div>
        </div>
        {item.quantity >= item.maxQuantity && <p className="mt-1.5 text-[11px] text-warning">Only {item.maxQuantity} available</p>}
      </div>
    </div>
  );
}
