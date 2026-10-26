import Link from "next/link";
import { canDisplayConfirmedOrder, formatPaymentAmount } from "@/lib/manual-payment";
import type { VerifiedAdvanceOrder } from "@/types/manual-payment";
import styles from "./AdvanceOrderConfirmation.module.css";

/** Awaiting an authorized server receipt; no query-string or localStorage path. */
export function AdvanceOrderConfirmation({ order }: { order: VerifiedAdvanceOrder | null }) {
  if (!canDisplayConfirmedOrder(order) || !order) return null;
  return <section className="mx-auto max-w-xl space-y-4 bg-white px-5 py-10 text-center" aria-label="Confirmed order">
    <svg className={styles.check} viewBox="0 0 80 80" fill="none" aria-hidden><circle cx="40" cy="40" r="36" /><path d="m23 40 11 11 23-24" /></svg>
    <h1 className="font-serif text-3xl">Your Order Is Confirmed!</h1><p>Thanks for your Order</p>
    <dl className="space-y-3 rounded-lg border border-[#EAEAEA] p-5 text-left text-sm">
      {[['Order number', order.orderReference], ['Order date', new Date(order.createdAt).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })], ['Payment method', order.provider === 'bkash' ? 'bKash advance + COD' : 'Nagad advance + COD'], ['Payment status', 'Advance verified'], ['Total amount', formatPaymentAmount(order.totalMinor)], ['Advance paid', formatPaymentAmount(order.advanceMinor)], ['Remaining on delivery', formatPaymentAmount(order.remainingMinor)]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="break-all text-right font-medium">{value}</dd></div>)}
    </dl>
    {order.items && <section aria-label="Purchased items" className="rounded-lg border border-[#EAEAEA] p-5 text-left">
      <h2 className="font-serif text-xl">Order summary</h2>
      <ul className="mt-3 divide-y divide-[#EAEAEA] text-sm">
        {order.items.map((item,index)=><li key={index} className="flex justify-between gap-4 py-3">
          <div className="min-w-0"><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-[#74706C]">Qty {item.quantity} · {formatPaymentAmount(item.unitPriceMinor)} each</p>{(item.size || item.color) && <p className="mt-1 text-xs text-[#74706C]">{[item.size,item.color].filter(Boolean).join(' · ')}</p>}</div>
          <p className="shrink-0 font-medium">{formatPaymentAmount(item.lineTotalMinor)}</p>
        </li>)}
      </ul>
      {(order.subtotalMinor !== undefined || order.deliveryMinor !== undefined || order.discountMinor !== undefined) && <dl className="space-y-2 border-t border-[#EAEAEA] pt-3 text-sm">
        {order.subtotalMinor !== undefined && <div className="flex justify-between gap-3"><dt>Product subtotal</dt><dd>{formatPaymentAmount(order.subtotalMinor)}</dd></div>}
        {order.deliveryMinor !== undefined && <div className="flex justify-between gap-3"><dt>Delivery cost</dt><dd>{formatPaymentAmount(order.deliveryMinor)}</dd></div>}
        {order.discountMinor !== undefined && <div className="flex justify-between gap-3"><dt>Discount</dt><dd>{formatPaymentAmount(order.discountMinor)}</dd></div>}
      </dl>}
    </section>}
    {order.delivery && <section aria-label="Delivery information" className="rounded-lg border border-[#EAEAEA] p-5 text-left text-sm">
      <h2 className="font-serif text-xl">Delivery information</h2>
      <address className="mt-3 space-y-1 not-italic"><p className="font-medium">{order.delivery.recipientName}</p>{order.delivery.addressLines.map((line,index)=><p key={index}>{line}</p>)}{(order.delivery.district || order.delivery.division) && <p>{[order.delivery.district,order.delivery.division].filter(Boolean).join(', ')}</p>}</address>
      {order.delivery.zoneLabel && <p className="mt-3 text-[#74706C]">Delivery zone: {order.delivery.zoneLabel}</p>}
      {order.delivery.estimatedDelivery && <p className="mt-1 text-[#74706C]">Estimated delivery: {order.delivery.estimatedDelivery}</p>}
    </section>}
    <div className="flex flex-wrap justify-center gap-4 text-sm text-primary underline"><Link href={`/account/orders/${encodeURIComponent(order.orderReference)}`}>View Order</Link><Link href="/shop">Continue Shopping</Link></div>
  </section>;
}
