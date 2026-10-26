"use client";

import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ButtonLink, EmptyState, CartSkeleton } from "@/components/ui";
import { commerce } from "@/config";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { CartItem } from "./CartItem";
import { CouponField } from "./CouponField";
import { OrderSummary } from "./OrderSummary";

export function CartView() {
  const { items, hydrated, getSummary, itemCount, clear } = useCart();
  const summary = getSummary();

  if (!hydrated) return <CartSkeleton/>;

  if (!items.length)
    return (
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" />}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Explore our latest arrivals."
        action={<ButtonLink href="/shop">Start Shopping</ButtonLink>}
      />
    );

  const remaining = commerce.freeDeliveryThreshold - summary.subtotal;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12 [&>*]:min-w-0">
      <section aria-label="Cart items">
        <div className="flex items-center justify-between border-b border-line pb-3 text-xs text-ink-muted">
          <span>{itemCount} items</span>
          <button type="button" onClick={clear} className="underline underline-offset-4 hover:text-primary">
            Clear cart
          </button>
        </div>
        <div className="divide-y divide-line">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Continue shopping
        </Link>
      </section>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-5 rounded-card border border-line p-5 sm:p-6">
          <CouponField />
          <OrderSummary summary={summary} deliveryNote={`Inside Dhaka shown. Outside Dhaka: ${formatPrice(commerce.deliveryCharges.outsideDhaka)} — calculated at checkout.`} />
          {remaining > 0 && <p className="rounded-control border border-line bg-white px-3 py-2 text-xs text-primary">Add {formatPrice(remaining)} more for free delivery.</p>}
          <ButtonLink href="/checkout" size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
            Proceed to Checkout
          </ButtonLink>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
            <Lock className="h-3 w-3" aria-hidden /> Cash on Delivery available across Bangladesh
          </p>
        </div>
      </aside>
    </div>
  );
}
