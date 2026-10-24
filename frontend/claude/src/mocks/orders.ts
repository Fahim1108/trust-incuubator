import type { Order } from "@/types";

/**
 * SAMPLE ORDERS for the order-history and tracking UI. These are fixtures,
 * not real orders. Order numbers use the DEMO- prefix so they cannot be
 * mistaken for live orders.
 */
export const mockOrders: Order[] = [
  {
    id: "ord_demo_1",
    orderNumber: "DEMO-10241",
    placedAt: "2026-10-18T11:20:00+06:00",
    status: "shipped",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    lines: [
      { productId: "p001", productSlug: "premium-cotton-shirt", name: "Premium Cotton Shirt", image: { src: "/images/products/shirt-classic-maroon-front.svg", alt: "Premium Cotton Shirt" }, colorName: "Maroon", size: "M", quantity: 1, unitPrice: 1890 },
      { productId: "p101", productSlug: "relaxed-fit-pants", name: "Relaxed Fit Pants", image: { src: "/images/products/pants-relaxed-beige-front.svg", alt: "Relaxed Fit Pants" }, colorName: "Beige", size: "32", quantity: 1, unitPrice: 2490 },
    ],
    summary: { itemCount: 2, subtotal: 4380, discount: 0, deliveryCharge: 0, total: 4380 },
    shippingAddress: { label: "Home", fullName: "Demo Customer", phone: "01700000000", division: "Dhaka", district: "Dhaka", area: "Dhanmondi", addressLine: "House 00, Road 00 (sample address)" },
    courier: { name: "Sample Courier", trackingCode: "SC-000000" },
    timeline: [
      { status: "pending", label: "Order placed", at: "2026-10-18T11:20:00+06:00" },
      { status: "confirmed", label: "Order confirmed", at: "2026-10-18T13:05:00+06:00", description: "Confirmed by phone call." },
      { status: "packed", label: "Packed", at: "2026-10-19T10:40:00+06:00" },
      { status: "shipped", label: "Handed to courier", at: "2026-10-19T17:10:00+06:00" },
      { status: "out-for-delivery", label: "Out for delivery" },
      { status: "delivered", label: "Delivered" },
    ],
  },
  {
    id: "ord_demo_2",
    orderNumber: "DEMO-10198",
    placedAt: "2026-09-27T19:02:00+06:00",
    status: "delivered",
    paymentMethod: "cod",
    paymentStatus: "paid",
    lines: [
      { productId: "p201", productSlug: "classic-white-sneakers", name: "Classic White Sneakers", image: { src: "/images/products/sneaker-classic-white-front.svg", alt: "Classic White Sneakers" }, colorName: "White", size: "42", quantity: 1, unitPrice: 3990 },
    ],
    summary: { itemCount: 1, subtotal: 3990, discount: 0, deliveryCharge: 0, total: 3990 },
    shippingAddress: { label: "Office", fullName: "Demo Customer", phone: "01700000000", division: "Dhaka", district: "Dhaka", area: "Gulshan", addressLine: "Level 0, Sample Tower (sample address)" },
    courier: { name: "Sample Courier", trackingCode: "SC-000001" },
    timeline: [
      { status: "pending", label: "Order placed", at: "2026-09-27T19:02:00+06:00" },
      { status: "confirmed", label: "Order confirmed", at: "2026-09-28T10:00:00+06:00" },
      { status: "packed", label: "Packed", at: "2026-09-28T15:30:00+06:00" },
      { status: "shipped", label: "Handed to courier", at: "2026-09-29T09:00:00+06:00" },
      { status: "out-for-delivery", label: "Out for delivery", at: "2026-09-30T09:30:00+06:00" },
      { status: "delivered", label: "Delivered", at: "2026-09-30T14:15:00+06:00" },
    ],
  },
  {
    id: "ord_demo_3",
    orderNumber: "DEMO-10077",
    placedAt: "2026-08-14T12:45:00+06:00",
    status: "cancelled",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    lines: [
      { productId: "p402", productSlug: "leather-card-holder", name: "Leather Card Holder", image: { src: "/images/products/wallet-cardholder-maroon-front.svg", alt: "Leather Card Holder" }, colorName: "Maroon", size: "One Size", quantity: 2, unitPrice: 990 },
    ],
    summary: { itemCount: 2, subtotal: 1980, discount: 0, deliveryCharge: 80, total: 2060 },
    shippingAddress: { label: "Home", fullName: "Demo Customer", phone: "01700000000", division: "Dhaka", district: "Dhaka", area: "Dhanmondi", addressLine: "House 00, Road 00 (sample address)" },
    timeline: [
      { status: "pending", label: "Order placed", at: "2026-08-14T12:45:00+06:00" },
      { status: "cancelled", label: "Cancelled by customer", at: "2026-08-14T15:00:00+06:00" },
    ],
  },
];
