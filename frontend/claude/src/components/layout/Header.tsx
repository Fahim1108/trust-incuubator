"use client";

import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartBadge } from "@/components/motion/CartBadge";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { IconButton, Modal } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useStorefront } from "@/context/StorefrontContext";
import { useWishlist } from "@/context/WishlistContext";
import { usesCompactHeader } from "@/lib/header-routes";
import { cn } from "@/lib/cn";
import { AnnouncementBar } from "./AnnouncementBar";
import { CustomerMenu } from "./CustomerMenu";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { header } = useStorefront();
  const pathname = usePathname();
  const compact = usesCompactHeader(pathname);
  const { itemCount, openDrawer, hydrated } = useCart();
  const wishlist = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Links carrying a query (e.g. "/shop?sort=newest") are shortcuts and never shown as the active section.
  const isActive = (href: string) =>
    !href.includes("?") &&
    (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "z-40 border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90",
          styles.header,
          header.sticky && "sticky top-0",
          scrolled
            ? "border-line shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            : "border-transparent",
        )}
      >
        <div className="container">
          <div
            className={`grid h-[80px] grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[96px] lg:gap-6 ${styles.row} ${compact ? styles.compactRow : ""}`}
          >
            {/* Left: mobile menu / desktop search */}
            <div className="flex items-center">
              <IconButton
                label="Open menu"
                className="-ml-2.5 text-primary lg:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-7 w-7" strokeWidth={1.8} />
              </IconButton>
              <nav
                aria-label="Main"
                className={`hidden lg:block ${styles.navigation}`}
              >
                <ul className="flex h-12 items-center justify-center gap-8 xl:gap-11">
                  {header.navigation.map((item) => (
                    <li key={item.label} className="group relative">
                      <Link
                        href={item.href}
                        className={cn(
                          // Underline draws left → right on hover / keyboard focus (250ms); stays drawn for the active page.
                          "aa-nav-link aa-press relative inline-flex items-center gap-1 rounded-sm py-2 text-[13px] tracking-wide transition-colors duration-200 hover:text-primary focus-visible:text-primary",
                          "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-primary after:transition-transform after:duration-[250ms] after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100",
                          isActive(item.href)
                            ? "text-primary after:scale-x-100"
                            : cn(
                                "after:scale-x-0",
                                item.highlight ? "text-primary" : "text-ink",
                              ),
                        )}
                        aria-haspopup={item.children ? "true" : undefined}
                      >
                        {item.label}
                        {item.children && (
                          <ChevronDown
                            className="h-3 w-3 opacity-60 transition-transform group-hover:rotate-180"
                            aria-hidden
                          />
                        )}
                      </Link>
                      {item.children && (
                        <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                          <ul className="origin-top translate-y-1 scale-[0.98] rounded-card border border-line bg-surface p-2 shadow-lift transition-transform duration-200 ease-out group-focus-within:translate-y-0 group-focus-within:scale-100 group-hover:translate-y-0 group-hover:scale-100">
                            {item.children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className="block rounded px-3 py-2 text-sm text-ink transition-colors duration-200 hover:bg-selected hover:text-primary"
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Center: logo */}
            <Logo priority />

            {/* Right: icons (labelled on desktop, as in the mockup) */}
            <div
              className={`flex items-center justify-end gap-0.5 sm:gap-1 lg:gap-7 ${styles.controls}`}
            >
              {!compact && <SearchBar
                variant="boxed"
                className={`hidden lg:block ${styles.search}`}
              />}
              {!compact && <IconButton
                label="Search"
                className="hidden sm:inline-flex lg:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" strokeWidth={1.6} />
              </IconButton>}
              <CustomerMenu />
              <Link
                href="/wishlist"
                aria-label={`Wishlist${wishlist.ids.length ? ` (${wishlist.ids.length})` : ""}`}
                className="aa-press relative hidden h-11 w-11 flex-col items-center justify-center rounded-full text-ink transition-colors hover:text-primary sm:inline-flex lg:h-auto lg:w-auto lg:gap-1 lg:rounded-none"
              >
                <Heart
                  className="h-5 w-5 lg:h-[22px] lg:w-[22px]"
                  strokeWidth={1.5}
                />
                <span className="hidden text-[11px] lg:block">Wishlist</span>
                {wishlist.hydrated && wishlist.ids.length > 0 && (
                  <span
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary lg:-right-1 lg:top-0"
                    aria-hidden
                  />
                )}
              </Link>
              <button
                type="button"
                onClick={openDrawer}
                aria-label={`Open cart${hydrated && itemCount ? ` (${itemCount})` : ""}`}
                className="aa-press relative hidden h-11 w-11 flex-col items-center justify-center rounded-full text-ink transition-colors hover:text-primary sm:inline-flex lg:h-auto lg:w-auto lg:gap-1 lg:rounded-none"
              >
                <ShoppingCart
                  className="h-5 w-5 lg:h-[22px] lg:w-[22px]"
                  strokeWidth={1.5}
                />
                <span className="hidden text-[11px] lg:block">Cart</span>
                <CartBadge count={itemCount} ready={hydrated} className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white lg:-right-2.5 lg:-top-2" />
              </button>
              {/* Phones: account bubble (cart lives in the bottom navigation) */}
              <Link
                href="/account"
                aria-label="Account"
                className="aa-press flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm sm:hidden"
              >
                <User className="h-5 w-5 fill-current" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
          {/* Mobile search row */}
          {!compact && <div className="pb-3 lg:hidden">
            <SearchBar variant="boxed" />
          </div>}
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer />
      {!compact && <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search"
        className="sm:max-w-xl"
      >
        <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
        <p className="mt-3 text-xs text-ink-muted">
          Try “linen”, “sneakers” or “maroon”.
        </p>
      </Modal>}
    </>
  );
}
