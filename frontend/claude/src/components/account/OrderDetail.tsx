import Link from "next/link";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { SmartImage } from "@/components/ui";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

export function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-ink">Order {order.orderNumber}</h2>
          <p className="text-xs text-ink-muted">Placed {formatDateTime(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-card border border-line p-5" aria-label="Tracking">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-ink-muted">Tracking</h3>
          <OrderTimeline events={order.timeline} />
          {order.courier && (
            <p className="mt-6 rounded-control bg-[#F9F8F7] p-3 text-xs text-ink-muted">
              Courier: <span className="text-ink">{order.courier.name}</span> · Tracking code <span className="text-ink">{order.courier.trackingCode}</span>
            </p>
          )}
        </section>
        <div className="space-y-6">
          <section className="rounded-card border border-line p-5" aria-label="Delivery address">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-muted">Deliver to</h3>
            <p className="text-sm leading-relaxed text-ink">
              {order.shippingAddress.fullName} · {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.district}
            </p>
            <p className="mt-3 text-xs text-ink-muted">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"} ({order.paymentStatus})</p>
          </section>
          <section className="rounded-card border border-line p-5">
            <OrderSummary summary={order.summary} title={null} />
          </section>
        </div>
      </div>
      <section className="rounded-card border border-line p-5" aria-label="Items">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-muted">Items</h3>
        <ul className="divide-y divide-line">
          {order.lines.map((l) => (
            <li key={l.productId + l.size} className="flex items-center gap-4 py-3">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-[#F4F2F0]">
                <SmartImage src={l.image.src} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <Link href={`/product/${l.productSlug}`} className="block truncate text-sm text-ink hover:text-primary">
                  {l.name}
                </Link>
                <span className="text-xs text-ink-muted">
                  {l.colorName} · {l.size} · Qty {l.quantity}
                </span>
              </span>
              <span className="text-sm font-medium">{formatPrice(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
