import { commerce } from "@/config";

const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Formats whole-taka amounts as "৳1,890". Uses South Asian digit grouping (1,00,000). */
export function formatPrice(amount: number): string {
  return `${commerce.currencySymbol}${numberFormatter.format(Math.round(amount))}`;
}

export function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", ...opts }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
