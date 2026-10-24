import type { Review } from "@/types";

/**
 * SAMPLE REVIEWS for UI demonstration only. They are not real customer reviews
 * and must be replaced by data from the reviews table before launch.
 */
const templates: Omit<Review, "id" | "productId">[] = [
  { author: "Sample Customer A", location: "Dhaka", rating: 5, title: "Great fit and fabric", body: "Fabric feels premium and the fit is true to size. Delivery was quick inside Dhaka.", createdAt: "2026-10-02", verifiedPurchase: true, size: "M" },
  { author: "Sample Customer B", location: "Chattogram", rating: 4, title: "Looks better in person", body: "Colour is rich and stitching is neat. I would size down if you prefer a slim look.", createdAt: "2026-09-21", verifiedPurchase: true, size: "L" },
  { author: "Sample Customer C", location: "Sylhet", rating: 5, title: "Worth the price", body: "Comfortable for long office days. Washed twice and it still looks new.", createdAt: "2026-09-10", verifiedPurchase: false },
  { author: "Sample Customer D", location: "Rajshahi", rating: 4, title: "Nice quality", body: "Good quality for everyday wear. Packaging was neat. COD made it easy.", createdAt: "2026-08-28", verifiedPurchase: true },
];

export function mockReviewsFor(productId: string): Review[] {
  return templates.map((t, i) => ({ ...t, id: `${productId}-r${i + 1}`, productId }));
}
