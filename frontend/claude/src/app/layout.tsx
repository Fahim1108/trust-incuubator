import type { Metadata, Viewport } from "next";
import { motionVariables } from "@/config/motion";

import { ThemeStyle } from "@/components/theme/ThemeStyle";
import { CartProvider } from "@/context/CartContext";
import { StorefrontProvider } from "@/context/StorefrontContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { getInitialCart, getStorefrontSettings, getProducts } from "@/services";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource/allura/latin-400.css";
import "./globals.css";
import "./motion.css";

// Approved catalogue/cart IDs must be read at request time, not frozen into an empty build snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStorefrontSettings();
  return {
    metadataBase: new URL(s.siteUrl),
    robots: { index: false, follow: false },
    title: { default: `${s.siteName} — Thrift Shirts in Bangladesh`, template: `%s | ${s.siteName}` },
    description: s.description,
    icons: { icon: "/brand/icon.png", apple: "/brand/apple-icon.png" },
    openGraph: { siteName: s.siteName, type: "website", images: [{ url: s.logo.badge }] },
  };
}

export const viewport: Viewport = {
  themeColor: "#6B0202",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, initialCart, catalogue] = await Promise.all([getStorefrontSettings(), getInitialCart(), getProducts({pageSize:500})]);
  return (
    <html lang="en" >
      <head>
        <ThemeStyle theme={settings.theme} />
        <style>{motionVariables}</style>
      </head>
      <body>
        <aside className="design-preview-notice" aria-label="Design preview notice">Our collection is being prepared. Ordering is not yet available.</aside>
        <StorefrontProvider settings={settings}>
          <ToastProvider>
            <WishlistProvider approvedProductIds={catalogue.items.map(p=>p.id)}>
              <CartProvider approvedProducts={catalogue.items} initialItems={initialCart} approvedVariantIds={catalogue.items.flatMap(p=>p.variants.filter(v=>v.stock>0).map(v=>v.id))}>
                <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
                  Skip to content
                </a>
                {children}
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </StorefrontProvider>
      </body>
    </html>
  );
}
