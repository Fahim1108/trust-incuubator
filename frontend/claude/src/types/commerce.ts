import type { ID, Money, ProductImage } from "./catalog";

export interface CartItem {
  /** Unique line id = `${productId}:${variantId}` */
  id: string;
  productId: ID;
  productSlug: string;
  variantId: ID;
  name: string;
  brandName: string;
  image: ProductImage;
  colorName: string;
  size: string;
  unitPrice: Money;
  compareAtPrice?: Money;
  quantity: number;
  maxQuantity: number;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "fixed" | "free-shipping";
  value: number;
  minSubtotal?: Money;
}

export interface OrderSummary {
  itemCount: number;
  subtotal: Money;
  discount: Money;
  deliveryCharge: Money;
  total: Money;
  coupon?: Coupon;
}

export type PaymentMethod = "cod" | "online";

export type DeliveryZone = "inside-dhaka" | "outside-dhaka";

export interface CheckoutPayload {
  customer: { fullName: string; phone: string; email?: string };
  address: Omit<Address, "id" | "isDefault" | "label">;
  paymentMethod: PaymentMethod;
  items: { productId: ID; variantId: ID; quantity: number }[];
  couponCode?: string;
  note?: string;
  saveAddress: boolean;
}

export interface Address {
  id: ID;
  label: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
}

export interface Customer {
  id: ID;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  memberSince: string;
  addresses: Address[];
}

export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "out-for-delivery" | "delivered" | "cancelled" | "returned";

export interface OrderLine {
  productId: ID;
  productSlug: string;
  name: string;
  image: ProductImage;
  colorName: string;
  size: string;
  quantity: number;
  unitPrice: Money;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  at?: string;
  description?: string;
}

export interface Order {
  id: ID;
  orderNumber: string;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid" | "refunded";
  lines: OrderLine[];
  summary: OrderSummary;
  shippingAddress: Omit<Address, "id" | "isDefault">;
  timeline: OrderTimelineEvent[];
  courier?: { name: string; trackingCode: string };
}

/**
 * Result shape returned by any action that requires a backend.
 * The mock adapter always returns `{ ok: false, reason: "not_connected" }`
 * so the UI never claims a successful order, payment, or sign-in.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; reason: "not_connected" | "validation" | "error"; message: string };
