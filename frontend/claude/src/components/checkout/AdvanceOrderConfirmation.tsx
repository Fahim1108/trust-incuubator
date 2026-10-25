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
      {[['Order ID', order.orderId], ['Order date', new Date(order.createdAt).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })], ['Payment method', order.provider === 'bkash' ? 'bKash advance + COD' : 'Nagad advance + COD'], ['Payment status', 'Advance verified'], ['Total amount', formatPaymentAmount(order.totalMinor)], ['Advance paid', formatPaymentAmount(order.advanceMinor)], ['Remaining on delivery', formatPaymentAmount(order.remainingMinor)]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="break-all text-right font-medium">{value}</dd></div>)}
    </dl>
    <div className="flex flex-wrap justify-center gap-4 text-sm text-primary underline"><Link href={`/account/orders/${encodeURIComponent(order.orderReference)}`}>View Order</Link><Link href="/shop">Continue Shopping</Link></div>
  </section>;
}
