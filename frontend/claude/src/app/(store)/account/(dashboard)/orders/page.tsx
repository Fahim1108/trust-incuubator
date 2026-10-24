import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { ButtonLink, EmptyState, SmartImage } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrders } from "@/services";

export const metadata: Metadata = { title: "Order History" };

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <section>
      <h2 className="mb-5 font-serif text-3xl text-ink">Order History</h2>
      {orders.length ? (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.orderNumber}`} className="group block rounded-card border border-line p-4 transition-colors hover:border-primary/40 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{o.orderNumber}</p>
                    <p className="text-xs text-ink-muted">Placed {formatDate(o.placedAt)} · {o.summary.itemCount} items</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex -space-x-2">
                    {o.lines.slice(0, 4).map((l) => (
                      <span key={l.productId + l.size} className="relative h-14 w-11 overflow-hidden rounded border-2 border-surface bg-[#F4F2F0]">
                        <SmartImage src={l.image.src} alt={l.name} fill sizes="44px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {formatPrice(o.summary.total)} <ChevronRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={<Package className="h-7 w-7" />} title="No orders yet" description="When you place an order, it will appear here." action={<ButtonLink href="/shop">Start Shopping</ButtonLink>} />
      )}
    </section>
  );
}
