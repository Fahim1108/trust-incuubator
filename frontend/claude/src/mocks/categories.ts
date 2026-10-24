import type { Category } from "@/types";

export const mockCategories: Category[] = [
  { id: "cat-shirts", slug: "shirts", name: "Shirts", description: "Oxford, linen, check and overshirts cut for Bangladesh's climate.", image: { src: "/images/categories/shirts.svg", alt: "Navy shirt" }, thumbnail: { src: "/images/mockup/category-shirts.jpg", alt: "Folded check and plain shirts" }, sortOrder: 1 },
  { id: "cat-pants", slug: "pants", name: "Pants", description: "Chinos, relaxed trousers, denim and cargos for every day.", image: { src: "/images/categories/pants.svg", alt: "Khaki chinos" }, thumbnail: { src: "/images/mockup/category-pants.jpg", alt: "Folded chinos and trousers" }, sortOrder: 2 },
  { id: "cat-sneakers", slug: "sneakers", name: "Sneakers", description: "Clean, versatile sneakers that go with everything.", image: { src: "/images/categories/sneakers.svg", alt: "White sneaker" }, thumbnail: { src: "/images/mockup/category-sneakers.jpg", alt: "High-top sneakers" }, sortOrder: 3 },
  { id: "cat-belts", slug: "belts", name: "Belt", description: "Leather, reversible and woven belts to finish the look.", image: { src: "/images/categories/belts.svg", alt: "Brown leather belt" }, thumbnail: { src: "/images/mockup/category-belts.jpg", alt: "Brown leather belt" }, sortOrder: 4 },
  { id: "cat-wallets", slug: "wallets", name: "Wallet", description: "Slim wallets and card holders in full-grain leather.", image: { src: "/images/categories/wallets.svg", alt: "Brown bifold wallet" }, thumbnail: { src: "/images/mockup/category-wallets.jpg", alt: "Leather wallets" }, sortOrder: 5 },
  { id: "cat-watches", slug: "watches", name: "Watches", description: "Minimal and chronograph watches for work and weekend.", image: { src: "/images/categories/watches.svg", alt: "Chronograph watch" }, thumbnail: { src: "/images/mockup/category-watches.jpg", alt: "Steel and leather watches" }, sortOrder: 6 },
];
