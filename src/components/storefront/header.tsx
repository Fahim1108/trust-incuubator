"use client";
import Link from "next/link";
import { Menu, Search, UserRound, X, ArrowUpRight } from "lucide-react";
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
      <Search size={18} aria-hidden="true" />
      <input
        id={id}
        name="q"
        defaultValue={initialQuery}
        placeholder="Search your next everyday favourite"
        maxLength={100}
      />
      <button aria-label="Search products" type="submit">
        <ArrowUpRight size={19} />
      </button>
    </form>
  );
}
const links = [
  { label: "Home", href: "/" },
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
        <span>ATTIRES ARENA · BANGLADESH</span>
        <span>Considered style. A fresh perspective.</span>
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
          <div className="desktop-search">
            <SearchForm initialQuery={query} />
          </div>
          <Link href="/" className="brand-name" aria-label="Attires Arena home">
            <span>ATTIRES ARENA</span>
            <small>STYLE ELEVATED</small>
          </Link>
          <Link className="account-link" href="/account">
            <UserRound size={21} />
            <span>My account</span>
          </Link>
        </div>
        <div className="mobile-search">
          <SearchForm initialQuery={query} id="mobile-search" />
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
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
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
