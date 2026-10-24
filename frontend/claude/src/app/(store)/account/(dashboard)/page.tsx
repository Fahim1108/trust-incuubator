import { Heart, MapPin, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/account/ProfileForm";
import { formatDate } from "@/lib/format";
import { getCurrentCustomer, getOrders } from "@/services";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const [customer, orders] = await Promise.all([getCurrentCustomer(), getOrders()]);
  if (!customer) return null;
  const stats = [
    { label: "Orders", value: orders.length, href: "/account/orders", Icon: Package },
    { label: "Addresses", value: customer.addresses.length, href: "/account/addresses", Icon: MapPin },
    { label: "Wishlist", value: "View", href: "/wishlist", Icon: Heart },
  ];
  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, href, Icon }) => (
          <li key={label}>
            <Link href={href} className="flex flex-col gap-2 rounded-card border border-line p-4 transition-colors hover:border-primary/40 sm:p-5">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} aria-hidden />
              <span className="font-serif text-2xl text-ink sm:text-3xl">{value}</span>
              <span className="text-xs text-ink-muted">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="rounded-card border border-line p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-3xl text-ink">Profile</h2>
          <p className="text-xs text-ink-muted">Member since {formatDate(customer.memberSince, { month: "long", year: "numeric" })}</p>
        </div>
        <ProfileForm customer={customer} />
      </section>
    </div>
  );
}
