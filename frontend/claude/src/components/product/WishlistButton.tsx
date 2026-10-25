"use client";

import { Heart } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/cn";

export function WishlistButton({ productId, productName, className, variant = "floating" }: { productId: string; productName: string; className?: string; variant?: "floating" | "inline" }) {
  const { has, toggle, hydrated } = useWishlist();
  const toast = useToast();
  const active = hydrated && has(productId);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        toast({ tone: "success", title: added ? "Saved to wishlist" : "Removed from wishlist", description: productName });
      }}
      className={cn(
        "aa-press inline-flex items-center justify-center transition-colors",
        variant === "floating" ? "h-9 w-9 rounded-full bg-surface/90 shadow-sm backdrop-blur transition-colors duration-200 hover:bg-surface" : "h-11 w-11 rounded-full border border-line hover:border-primary/40",
        className,
      )}
    >
      <Heart
        className={cn("h-[18px] w-[18px] transition-[fill,color] duration-300 ease-out", active ? "fill-primary text-primary" : "fill-transparent text-ink")}
        strokeWidth={1.7}
      />
    </button>
  );
}
