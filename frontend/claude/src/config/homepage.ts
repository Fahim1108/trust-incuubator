import type { Banner, HeroSettings, HomepageSection, ValueProp } from "@/types";

export const hero: HeroSettings = {
  autoplayMs: 6000,
  badges: ["Premium Quality", "Curated Collections", "Designed for Everyday"],
  slides: [
    {
      id: "hero-style-elevated",
      eyebrow: "New Season",
      title: "Style Elevated",
      subtitle: "Timeless fashion for the modern you.",
      cta: { label: "Shop Now", href: "/shop" },
      image: { src: "/images/banners/hero-style-elevated.svg", alt: "Maroon overshirt styled with beige trousers" },
      // Phone layout from the approved mobile mockup.
      titleAccent: "Elevated",
      tagline: "Premium Fashion|Thrift Shopping",
      script: "Quality|Styles|Better|Choices",
      mobileImage: { src: "/images/mockup/hero-rack.jpg", alt: "Clothing rack with shirts and an Attires Arena cap" },
      desktopImage: { src: "/images/mockup/hero-rack-wide.jpg", alt: "Clothing rack with shirts and an Attires Arena cap" },
      showLogo: true,
      align: "left",
      tone: "light",
      overlay: 35,
    },
    {
      id: "hero-tonal",
      eyebrow: "The Neutrals Edit",
      title: "Quiet Luxury",
      subtitle: "Soft tones, clean lines, everyday ease.",
      cta: { label: "Explore Shirts", href: "/category/shirts" },
      image: { src: "/images/banners/hero-quiet-luxury.svg", alt: "Neutral shirts and trousers flat lay" },
      align: "left",
      tone: "light",
      overlay: 30,
    },
    {
      id: "hero-footwear",
      eyebrow: "Step Forward",
      title: "Clean Kicks",
      subtitle: "Minimal sneakers built for long city days.",
      cta: { label: "Shop Sneakers", href: "/category/sneakers" },
      image: { src: "/images/banners/hero-clean-kicks.svg", alt: "White leather sneakers" },
      align: "left",
      tone: "light",
      overlay: 30,
    },
  ],
  // Side tiles are not in the approved desktop mockup; add Banners here to show them beside the slider.
  side: [] as Banner[],
};

export const promoBanners: Banner[] = [
  {
    id: "promo-tonal",
    title: "Tonal Essentials",
    subtitle: "Minimal collection for maximum style.",
    cta: { label: "Discover", href: "/shop?colors=beige,stone,olive" },
    image: { src: "/images/banners/promo-tonal.svg", alt: "Stack of folded neutral shirts" },
    align: "left",
    tone: "dark",
  },
  {
    id: "promo-comfort",
    title: "Everyday Comfort",
    subtitle: "Elevated style for daily moments.",
    cta: { label: "Shop Now", href: "/category/pants" },
    image: { src: "/images/banners/promo-comfort.svg", alt: "Relaxed trousers and loafers" },
    align: "left",
    tone: "dark",
  },
];

export const valueProps: ValueProp[] = [
  { icon: "gem", title: "Premium Quality", description: "Carefully curated products" },
  { icon: "truck", title: "Fast & Reliable Shipping", description: "Across Bangladesh" },
  { icon: "shield-check", title: "Easy Returns", description: "Hassle-free shopping" },
  { icon: "headphones", title: "Dedicated Support", description: "We're here to help" },
];

/**
 * Homepage section order and visibility. Re-order the array to re-order the page.
 * Toggle `enabled` to hide a section without deleting its settings.
 */
export const homepageSections: HomepageSection[] = [
  { id: "hero", type: "hero", adminLabel: "Hero banner", enabled: true },
  { id: "categories", type: "categories", adminLabel: "Categories / Brands tabs", enabled: true, title: "Shop by Category", cta: { label: "View All", href: "/categories" } },
  { id: "brands", type: "brands", adminLabel: "Top Brands", enabled: true, title: "Top Brands", cta: { label: "See All Brands", href: "/brands" } },
  { id: "featured", type: "featured", adminLabel: "Featured Products", enabled: true, title: "Featured Products", cta: { label: "View All Products", href: "/shop" }, limit: 6 },
  { id: "value-props", type: "value-props", adminLabel: "Value propositions", enabled: true },
  // Not in the approved mockups — kept ready; switch on in the Appearance Editor.
  { id: "new-arrivals", type: "new-arrivals", adminLabel: "New Arrivals", enabled: false, title: "New Arrivals", cta: { label: "View All", href: "/shop?sort=newest" }, limit: 6 },
  { id: "promo-banners", type: "promo-banners", adminLabel: "Promotional banners", enabled: false },
  { id: "best-sellers", type: "best-sellers", adminLabel: "Best Sellers", enabled: false, title: "Best Sellers", cta: { label: "View All", href: "/shop?sort=rating" }, limit: 6 },
  { id: "newsletter", type: "newsletter", adminLabel: "Newsletter", enabled: false },
];
