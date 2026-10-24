"use client";

import { Heart, LogOut, MapPin, Package, Truck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/account", label: "Profile", Icon: User },
  { href: "/account/orders", label: "Orders", Icon: Package },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin },
  { href: "/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/track-order", label: "Track Order", Icon: Truck },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/account" ? pathname === "/account" : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex items-center gap-2.5 whitespace-nowrap rounded-control px-3.5 py-2.5 text-sm transition-colors", active ? "bg-selected text-primary" : "border border-line text-ink hover:bg-ink/5 lg:border-transparent")}
              >
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-3 lg:border-t lg:border-line lg:pt-3">
          <Link href="/account/login" className="flex items-center gap-2.5 whitespace-nowrap rounded-control border border-line px-3.5 py-2.5 text-sm text-ink-muted hover:text-primary lg:border-transparent">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </Link>
        </li>
      </ul>
    </nav>
  );
}
