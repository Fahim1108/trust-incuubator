import type { Metadata, Viewport } from "next";
import { motionVariables } from "@/config/motion";

import { ThemeStyle } from "@/components/theme/ThemeStyle";
import { CartProvider } from "@/context/CartContext";
import { StorefrontProvider } from "@/context/StorefrontContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { getInitialCart, getStorefrontSettings } from "@/services";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource/allura/latin-400.css";
import "./globals.css";
import "./motion.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStorefrontSettings();
  return {
    metadataBase: new URL(s.siteUrl),
    robots: { index: false, follow: false },
    title: { default: `${s.siteName} — Premium Menswear in Bangladesh`, template: `%s | ${s.siteName}` },
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
  const [settings, initialCart] = await Promise.all([getStorefrontSettings(), getInitialCart()]);
  return (
    <html lang="en" >
      <head>
        <ThemeStyle theme={settings.theme} />
        <style>{motionVariables}</style>
      </head>
      <body>
        <aside className="design-preview-notice" aria-label="Design preview notice">CLAUDE DESIGN PREVIEW · Sample products, prices, brands, customers and shipping · No live purchases or payments · Do not enter real passwords or personal details.</aside>
        <StorefrontProvider settings={settings}>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider initialItems={initialCart}>
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
