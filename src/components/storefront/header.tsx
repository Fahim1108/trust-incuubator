"use client";
import Link from "next/link";
import {
  Menu,
  Search,
  UserRound,
  X,
  Heart,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";
export function SearchForm({
  initialQuery = "",
  id = "header-search",
}: {
  initialQuery?: string;
  id?: string;
}) {
  return (
    <form action="/#arrivals" className="store-search" role="search">
      <label className="sr-only" htmlFor={id}>
        Search the catalogue
      </label>
      <button aria-label="Search products" type="submit">
        <Search size={17} />
      </button>
      <input
        id={id}
        name="q"
        defaultValue={initialQuery}
        placeholder="Search for shirts, pants, sneakers..."
        maxLength={100}
      />
    </form>
  );
}
const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/#arrivals" },
  { label: "Categories", href: "/#categories" },
  { label: "Brands", href: "/#brands" },
  { label: "New Arrivals", href: "/#arrivals" },
  { label: "Our Story", href: "/#about" },
];
export function StoreHeader({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="store-announcement">
        <span>
          <Truck size={13} /> Style elevated, everyday <i /> A fashion
          destination for Bangladesh
        </span>
        <a href="mailto:attiresarena664@gmail.com">Help</a>
      </div>
      <header className="store-header">
        <div className="header-main">
          <button
            className="menu-toggle icon-control"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                aria-current={label === "Home" ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="brand-name" aria-label="Attires Arena home">
            <strong>ATTIRES</strong>
            <span>ARENA</span>
          </Link>
          <div className="header-controls">
            <div className="desktop-search">
              <SearchForm initialQuery={query} />
            </div>
            <Link
              href="/account"
              className="icon-control account-link"
              aria-label="Your account"
            >
              <UserRound size={21} />
            </Link>
            <button
              className="icon-control unavailable-control"
              disabled
              title="Wishlist is not available yet"
              aria-label="Wishlist unavailable"
            >
              <Heart size={21} />
            </button>
            <button
              className="icon-control unavailable-control"
              disabled
              title="Shopping bag is not available yet"
              aria-label="Shopping bag unavailable"
            >
              <ShoppingBag size={22} />
            </button>
          </div>
        </div>
        <div className="mobile-search">
          <SearchForm initialQuery={query} id="mobile-search" />
        </div>
        {open && (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                document
                  .querySelector<HTMLButtonElement>(".menu-toggle")
                  ?.focus();
              }
            }}
          >
            {links.map(({ href, label }) => (
              <Link key={label} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
