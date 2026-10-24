import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <div className="container py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mb-6 mt-4 font-serif text-4xl text-ink sm:text-5xl">Your Cart</h1>
      <CartView />
    </div>
  );
}
