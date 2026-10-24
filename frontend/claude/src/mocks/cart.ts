/**
 * Sample cart lines used to pre-fill the cart on a first visit
 * (controlled by `demo.seedCart` in src/config/commerce.ts).
 * References products by id/variant so prices always come from the catalogue.
 */
export const mockCartSeed: { productId: string; colorId: string; size: string; quantity: number }[] = [
  { productId: "p001", colorId: "maroon", size: "M", quantity: 1 },
  { productId: "p101", colorId: "beige", size: "32", quantity: 1 },
  { productId: "p201", colorId: "white", size: "42", quantity: 1 },
];
