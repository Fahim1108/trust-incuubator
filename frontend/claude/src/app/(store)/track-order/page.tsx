import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/account/TrackOrderForm";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Track Order" };

export default function TrackOrderPage() {
  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Track your order</h1>
      <p className="mb-8 mt-2 text-sm text-ink-muted">Enter the order number from your confirmation message.</p>
      <TrackOrderForm />
    </div>
  );
}
