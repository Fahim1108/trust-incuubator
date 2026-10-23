// Amounts are integer BDT minor units (100 poisha = 1 taka).
export function assertMoney(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("Invalid minor-unit amount");
}
export function lineTotal(unitPrice: number, quantity: number): number {
  assertMoney(unitPrice);
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new RangeError("Invalid quantity");
  const total = unitPrice * quantity;
  assertMoney(total);
  return total;
}
export function effectivePrice(regular: number, sale: number | null): number {
  assertMoney(regular);
  if (sale === null) return regular;
  assertMoney(sale);
  if (sale > regular) throw new RangeError("Sale price exceeds regular price");
  return sale;
}
export function percentageDiscount(subtotal: number, basisPoints: number): number {
  assertMoney(subtotal);
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000) throw new RangeError("Invalid percentage");
  return Number(BigInt(subtotal) * BigInt(basisPoints) / 10000n);
}
