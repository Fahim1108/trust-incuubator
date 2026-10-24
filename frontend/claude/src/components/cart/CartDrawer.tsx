"use client";

import { ShoppingBag, Truck } from "lucide-react";
import { ButtonLink, Drawer, EmptyState } from "@/components/ui";
import { commerce } from "@/config";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, getSummary, itemCount } = useCart();
  const summary = getSummary();
  const remaining = commerce.freeDeliveryThreshold - summary.subtotal;
  const progress = Math.min(100, (summary.subtotal / commerce.freeDeliveryThreshold) * 100);

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      title={`Your Cart (${itemCount})`}
      footer={
        items.length ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-muted">Subtotal</span>
              <span className="text-lg font-semibold text-ink">{formatPrice(summary.subtotal)}</span>
            </div>
            <p className="text-xs text-ink-muted">Delivery and discounts are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/cart" variant="outline" onClick={closeDrawer}>
                View Cart
              </ButtonLink>
              <ButtonLink href="/checkout" onClick={closeDrawer}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length ? (
        <div className="px-5">
          <div className="mt-4 rounded-control border border-line bg-white p-3">
            <p className="flex items-center gap-2 text-xs text-ink">
              <Truck className="h-4 w-4 text-primary" aria-hidden />
              {remaining > 0 ? (
                <span>
                  Add <strong>{formatPrice(remaining)}</strong> more for free delivery
                </span>
              ) : (
                <span>You&apos;ve unlocked free delivery</span>
              )}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="divide-y divide-line">
            {items.map((item) => (
              <CartItem key={item.id} item={item} compact onNavigate={closeDrawer} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="Your cart is empty"
          description="Discover new arrivals and timeless essentials."
          action={
            <ButtonLink href="/shop" onClick={closeDrawer}>
              Start Shopping
            </ButtonLink>
          }
        />
      )}
    </Drawer>
  );
}
