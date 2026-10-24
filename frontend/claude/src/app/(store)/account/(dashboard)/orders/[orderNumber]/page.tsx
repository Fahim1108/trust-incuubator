import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/account/OrderDetail";
import { getOrderByNumber } from "@/services";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await getOrderByNumber(decodeURIComponent((await params).orderNumber));
  if (!order) notFound();
  return (
    <div>
      <Link href="/account/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>
      <OrderDetail order={order} />
    </div>
  );
}
