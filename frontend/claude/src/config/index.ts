import type { StorefrontSettings } from "@/types";
import { logo, site } from "./brand";
import { commerce, demo } from "./commerce";
import { footer } from "./footer";
import { header } from "./header";
import { hero, homepageSections, promoBanners, valueProps } from "./homepage";
import { productCard } from "./product-card";
import { theme } from "./theme";

/**
 * The full default storefront configuration. This is the single object the
 * Appearance Editor edits and that `getStorefrontSettings()` returns.
 */
export const defaultStorefrontSettings: StorefrontSettings = {
  siteName: site.name,
  siteUrl: site.url,
  description: site.description,
  theme,
  logo,
  header,
  footer,
  hero,
  promoBanners,
  valueProps,
  homepage: homepageSections,
  productCard,
  commerce,
  demo,
};

export { site, theme, logo, header, footer, hero, promoBanners, valueProps, homepageSections, productCard, commerce, demo };
