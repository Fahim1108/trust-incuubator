import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-6 mt-4 font-serif text-4xl text-ink sm:text-5xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
