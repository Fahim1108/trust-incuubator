import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { OrderSummary as OrderSummaryType } from "@/types";

export function OrderSummary({ summary, className, children, deliveryNote, title = "Order Summary" }: { summary: OrderSummaryType; className?: string; children?: ReactNode; deliveryNote?: string; title?: string | null }) {
  return (
    <section aria-label={title ?? "Order summary"} className={cn("space-y-3 text-sm", className)}>
      {title && <h2 className="font-serif text-2xl text-ink">{title}</h2>}
      <dl className="space-y-2.5">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Subtotal ({summary.itemCount} items)</dt>
          <dd className="text-ink">{formatPrice(summary.subtotal)}</dd>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-muted">Discount {summary.coupon && <span className="text-xs">({summary.coupon.code})</span>}</dt>
            <dd className="text-success">−{formatPrice(summary.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-muted">Delivery Charge</dt>
          <dd className="text-ink">{summary.deliveryCharge === 0 && summary.itemCount > 0 ? <span className="text-success">Free</span> : formatPrice(summary.deliveryCharge)}</dd>
        </div>
        {deliveryNote && <p className="text-xs text-ink-muted">{deliveryNote}</p>}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="text-base font-semibold text-ink">Total</dt>
          <dd className="text-xl font-semibold text-primary">{formatPrice(summary.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
