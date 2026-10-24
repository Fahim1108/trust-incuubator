/** Storefront / appearance configuration contracts. */

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  selected: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: {
    /** CSS font-family stack for editorial headings. */
    serif: string;
    /** CSS font-family stack for UI text. */
    sans: string;
    headingWeight: 400 | 500 | 600 | 700;
    headingUppercaseHero: boolean;
  };
  radius: { card: string; control: string };
}

export interface LogoSettings {
  /** Logo for light backgrounds (header). */
  primary: string;
  /** Logo for dark/maroon backgrounds (footer). */
  inverse: string;
  /** Square badge (favicon, social). */
  badge: string;
  alt: string;
  /** Rendered height in px on desktop / mobile. */
  heightDesktop: number;
  heightMobile: number;
  showWordmarkText: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  highlight?: boolean;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface Banner {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: CtaLink;
  image: { src: string; alt: string };
  /** Where the text block sits over the image. */
  align: "left" | "center" | "right";
  /** Visual tone controls text colour over the image. */
  tone: "light" | "dark";
  /** Optional overlay strength 0–80. */
  overlay?: number;
  /** Second title line rendered in the primary colour (mobile editorial layout). */
  titleAccent?: string;
  /** Letter-spaced line under the title, e.g. "Premium Fashion · Thrift Shopping". Use "|" for a line break. */
  tagline?: string;
  /** Decorative handwritten note. Use "|" for line breaks. */
  script?: string;
  /** When set, phones show the light editorial layout with this image on the right. */
  mobileImage?: { src: string; alt: string };
  /** Wider image for the light editorial layout on tablet/desktop (falls back to `mobileImage`). */
  desktopImage?: { src: string; alt: string };
  /** Show the brand logo above the title in the mobile editorial layout. */
  showLogo?: boolean;
}

export type HomepageSectionType =
  | "hero"
  | "value-props"
  | "categories"
  | "brands"
  | "new-arrivals"
  | "featured"
  | "best-sellers"
  | "promo-banners"
  | "newsletter";

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  /** Label used in the Appearance Editor. */
  adminLabel: string;
  enabled: boolean;
  title?: string;
  /** Optional shorter title used on phones (e.g. "Top Brands"). */
  mobileTitle?: string;
  subtitle?: string;
  cta?: CtaLink;
  /** Max items for product rails / grids. */
  limit?: number;
}

export interface HeroSettings {
  /** Side tiles beside the main slider on desktop (mockup: "New Arrivals", "Essential Footwear"). */
  side: Banner[];
  /** Auto-rotate slides in ms; 0 disables. */
  autoplayMs: number;
  slides: Banner[];
  badges: string[];
}

export interface ValueProp {
  icon: "shield-check" | "truck" | "rotate-ccw" | "lock" | "sparkles" | "banknote" | "gem" | "headphones";
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: CtaLink[];
}

export interface SocialLink {
  network: "facebook" | "instagram" | "youtube" | "tiktok" | "whatsapp";
  href: string;
}

export interface HeaderSettings {
  /** Desktop: `left` · centre `items` · `promo` (right). Phones show nothing (approved mobile mockup). */
  announcement: { enabled: boolean; left?: string; items: string[]; promo?: string; rightLinks: CtaLink[] };
  navigation: NavItem[];
  searchPlaceholder: string;
  sticky: boolean;
}

export interface FooterSettings {
  tagline: string;
  columns: FooterColumn[];
  contact: { phone: string; email: string; address: string; hours: string };
  social: SocialLink[];
  paymentBadges: string[];
  copyright: string;
  newsletter: { enabled: boolean; title: string; description: string };
}

export interface ProductCardSettings {
  imageAspect: "portrait" | "square" | "landscape";
  showBrand: boolean;
  showRating: boolean;
  showColorSwatches: boolean;
  showQuickAdd: boolean;
  showWishlist: boolean;
  showDiscountBadge: boolean;
  /** Full-width "Add to Cart" button under the price (opens size picker when needed). */
  showAddToCart: boolean;
  imageBackground: string;
}

export interface CommerceSettings {
  currencySymbol: string;
  currencyCode: string;
  locale: string;
  deliveryCharges: { insideDhaka: number; outsideDhaka: number };
  freeDeliveryThreshold: number;
  returnWindowDays: number;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  /** Sample coupons accepted by the local cart demo. */
  demoCoupons: { code: string; type: "percent" | "fixed" | "free-shipping"; value: number; description: string; minSubtotal?: number }[];
}

export interface DemoSettings {
  /** Show "demonstration" notices in reviews, checkout, account. */
  showNotices: boolean;
  /** Pre-fill the cart with sample items on first visit. */
  seedCart: boolean;
}

export interface StorefrontSettings {
  siteName: string;
  siteUrl: string;
  description: string;
  theme: ThemeSettings;
  logo: LogoSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  hero: HeroSettings;
  promoBanners: Banner[];
  valueProps: ValueProp[];
  homepage: HomepageSection[];
  productCard: ProductCardSettings;
  commerce: CommerceSettings;
  demo: DemoSettings;
}
