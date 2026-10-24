import type { FooterSettings } from "@/types";

export const footer: FooterSettings = {
  tagline: "Timeless menswear and accessories, curated for everyday confidence.",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Men", href: "/shop" },
        { label: "New Arrivals", href: "/shop?sort=newest" },
        { label: "Brands", href: "/brands" },
        { label: "Deals", href: "/shop?offers=1" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Track Order", href: "/track-order" },
        { label: "Returns & Refunds", href: "/return-policy" },
        { label: "Shipping", href: "/shipping-policy" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "About Us",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
  // Placeholder contact details — replace before launch.
  contact: {
    phone: "+880 1XXX-XXXXXX",
    email: "support@attiresarena.com",
    address: "Dhaka, Bangladesh",
    hours: "Sat – Thu, 10:00 AM – 8:00 PM",
  },
  social: [
    { network: "facebook", href: "#" },
    { network: "instagram", href: "#" },
    { network: "youtube", href: "#" },
    { network: "tiktok", href: "#" },
  ],
  paymentBadges: ["Cash on Delivery", "bKash", "Nagad", "Visa", "Mastercard"],
  copyright: "© {year} Attires Arena. All rights reserved.",
  newsletter: {
    enabled: true,
    title: "Join Our Newsletter",
    description: "Get exclusive offers, new arrivals and style inspiration.",
  },
};
