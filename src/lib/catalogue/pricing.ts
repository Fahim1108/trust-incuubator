import { assertMoney, effectivePrice } from "@/lib/commerce/money";
export type PublicPriceVariant = {
  price_minor: number;
  sale_price_minor: number | null;
  active: boolean;
};
export function formatBdt(minor: number): string {
  assertMoney(minor);
  const amount = BigInt(minor);
  const poisha = amount % 100n;
  return `৳ ${new Intl.NumberFormat("en-BD").format(amount / 100n)}${poisha ? `.${poisha.toString().padStart(2, "0")}` : ""}`;
}
export function getProductPrice(variants: PublicPriceVariant[]) {
  const active = variants.filter((variant) => variant.active);
  if (!active.length) return null;
  const prices = active.map((variant) =>
    effectivePrice(variant.price_minor, variant.sale_price_minor),
  );
  const priceMinor = prices.reduce((lowest, price) => Math.min(lowest, price));
  // A crossed-out price must refer to a single variant, not a different variant's price.
  const regularMinor =
    active.length === 1 && priceMinor < active[0].price_minor
      ? active[0].price_minor
      : null;
  return { priceMinor, regularMinor, from: active.length > 1 };
}
