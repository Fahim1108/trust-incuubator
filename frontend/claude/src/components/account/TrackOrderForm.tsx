"use client";

import { PackageSearch } from "lucide-react";
import { useState, useTransition } from "react";
import { Button, DemoNotice, EmptyState, Input } from "@/components/ui";
import { getOrderByNumberAction } from "@/services/actions";
import type { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-6">
      <form
        noValidate
        className="grid gap-4 rounded-card border border-line p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!orderNumber.trim()) return setError("Enter your order number");
          setError(undefined);
          start(async () => setOrder(await getOrderByNumberAction(orderNumber, phone)));
        }}
      >
        <Input label="Order Number" placeholder="e.g. DEMO-10241" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} error={error} />
        <Input label="Phone Number (optional)" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" size="lg" loading={pending}>
          Track
        </Button>
      </form>
      <DemoNotice>Tracking uses sample orders. Try <strong>DEMO-10241</strong> or <strong>DEMO-10198</strong>.</DemoNotice>
      {order === null && <EmptyState icon={<PackageSearch className="h-7 w-7" />} title="Order not found" description="Check the order number from your confirmation SMS and try again." />}
      {order && (
        <section className="rounded-card border border-line p-5 sm:p-6" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-2xl text-ink">{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <OrderTimeline events={order.timeline} />
        </section>
      )}
    </div>
  );
}
