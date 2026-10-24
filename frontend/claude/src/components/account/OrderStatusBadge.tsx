import { Badge } from "@/components/ui";
import type { OrderStatus } from "@/types";

const map: Record<OrderStatus, { label: string; tone: "soft" | "success" | "warning" | "neutral" | "dark" }> = {
  pending: { label: "Pending", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "soft" },
  packed: { label: "Packed", tone: "soft" },
  shipped: { label: "Shipped", tone: "soft" },
  "out-for-delivery": { label: "Out for delivery", tone: "soft" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  returned: { label: "Returned", tone: "neutral" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = map[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
