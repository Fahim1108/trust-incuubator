import type { Brand } from "@/types";

/**
 * DEMONSTRATION ENTRIES ONLY. Brand names are used to show the brand-browsing UI.
 * They do not represent confirmed inventory, authorised resale, or partnerships.
 * Wordmarks are rendered as plain text — no third-party logo files are shipped.
 */
export const mockBrands: Brand[] = [
  { id: "brand-gucci", slug: "gucci", name: "Gucci", description: "Demonstration brand entry.", wordmark: { fontFamily: "serif", letterSpacing: "0.28em", weight: 500, uppercase: true }, sortOrder: 1 },
  { id: "brand-zara", slug: "zara", name: "Zara", description: "Demonstration brand entry.", wordmark: { fontFamily: "serif", letterSpacing: "-0.02em", weight: 600, uppercase: true }, sortOrder: 2 },
  { id: "brand-lacoste", slug: "lacoste", name: "Lacoste", description: "Demonstration brand entry.", wordmark: { fontFamily: "sans", letterSpacing: "0.12em", weight: 700, uppercase: true }, sortOrder: 3 },
  { id: "brand-hm", slug: "h-and-m", name: "H&M", description: "Demonstration brand entry.", wordmark: { fontFamily: "script", letterSpacing: "0", weight: 700, italic: true }, sortOrder: 4 },
  { id: "brand-nike", slug: "nike", name: "Nike", description: "Demonstration brand entry.", wordmark: { fontFamily: "condensed", letterSpacing: "0.04em", weight: 800, italic: true, uppercase: true }, sortOrder: 5 },
  { id: "brand-adidas", slug: "adidas", name: "Adidas", description: "Demonstration brand entry.", wordmark: { fontFamily: "sans", letterSpacing: "0", weight: 800 }, sortOrder: 6 },
  { id: "brand-puma", slug: "puma", name: "Puma", description: "Demonstration brand entry.", wordmark: { fontFamily: "condensed", letterSpacing: "0.02em", weight: 900, uppercase: true }, sortOrder: 7 },
  { id: "brand-tommy", slug: "tommy-hilfiger", name: "Tommy Hilfiger", description: "Demonstration brand entry.", wordmark: { fontFamily: "sans", letterSpacing: "0.14em", weight: 500, uppercase: true }, sortOrder: 8 },
  { id: "brand-ck", slug: "calvin-klein", name: "Calvin Klein", description: "Demonstration brand entry.", wordmark: { fontFamily: "sans", letterSpacing: "-0.01em", weight: 400 }, sortOrder: 9 },
  { id: "brand-levis", slug: "levis", name: "Levi's", description: "Demonstration brand entry.", wordmark: { fontFamily: "sans", letterSpacing: "0", weight: 800, italic: true }, sortOrder: 10 },
  { id: "brand-arena", slug: "arena-studio", name: "Arena Studio", description: "Attires Arena's in-house essentials label (sample).", wordmark: { fontFamily: "serif", letterSpacing: "0.18em", weight: 500, uppercase: true }, sortOrder: 11 },
];
