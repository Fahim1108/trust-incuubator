"use client";

import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";

/** App-style bottom navigation for phones (from the approved mockup). */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, openDrawer, hydrated } = useCart();
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/categories", label: "Categories", Icon: LayoutGrid },
    { href: "#cart", label: "Cart", Icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", Icon: Heart },
    { href: "/account", label: "Account", Icon: User },
  ];
  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return null;
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid h-[68px] grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const content = (
            <>
              <span className="relative">
                <Icon className={cn("h-6 w-6", active && "fill-current")} strokeWidth={active ? 1.8 : 1.5} aria-hidden />
                {href === "#cart" && hydrated && itemCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">{itemCount}</span>
                )}
              </span>
              <span>{label}</span>
            </>
          );
          const cls = cn("flex h-full flex-col items-center justify-center gap-1 text-[11px]", active ? "font-medium text-primary" : "text-ink-muted");
          return (
            <li key={label}>
              {href === "#cart" ? (
                <button type="button" onClick={openDrawer} className={cn(cls, "w-full")} aria-label={`Cart (${itemCount} items)`}>
                  {content}
                </button>
              ) : (
                <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
