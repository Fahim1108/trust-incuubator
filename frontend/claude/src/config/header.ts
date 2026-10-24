import type { HeaderSettings } from "@/types";

export const header: HeaderSettings = {
  announcement: {
    enabled: true,
    left: "Free Shipping on Orders Over BDT 2,000",
    items: ["Authentic Brands", "Premium Quality", "Easy Returns"],
    promo: "Get 10% Off on Your First Order",
    rightLinks: [],
  },
  searchPlaceholder: "Search for fashion, brands, styles...",
  sticky: true,
  navigation: [
    { label: "Home", href: "/" },
    {
      label: "Men",
      href: "/shop",
      children: [
        { label: "Shirts", href: "/category/shirts" },
        { label: "Pants", href: "/category/pants" },
        { label: "Sneakers", href: "/category/sneakers" },
        { label: "Belt", href: "/category/belts" },
        { label: "Wallet", href: "/category/wallets" },
        { label: "Watches", href: "/category/watches" },
      ],
    },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    {
      label: "Brands",
      href: "/brands",
      children: [
        { label: "Gucci", href: "/brand/gucci" },
        { label: "Zara", href: "/brand/zara" },
        { label: "Lacoste", href: "/brand/lacoste" },
        { label: "Nike", href: "/brand/nike" },
        { label: "Adidas", href: "/brand/adidas" },
        { label: "All Brands", href: "/brands" },
      ],
    },
    { label: "Deals", href: "/shop?offers=1" },
    {
      label: "About",
      href: "/about",
      children: [
        { label: "Our Story", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ],
};
