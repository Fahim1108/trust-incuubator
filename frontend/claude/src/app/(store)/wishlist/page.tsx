import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Wishlist</h1>
      <p className="mb-8 mt-2 text-sm text-ink-muted">Saved in this browser. Sign in to sync your wishlist across devices.</p>
      <WishlistView />
    </div>
  );
}
