"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { signOutStaff } from "@/lib/admin/actions";
export function AdminShell({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const path = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const links = [
    ["/admin", "Overview"],
    ["/admin/products", "Products & intake"],
    ...(roles.some((r) => r === "owner" || r === "product_manager")
      ? [["/admin/audit", "Audit log"]]
      : []),
  ];
  const navigation = (
    <>
      <nav aria-label="Admin navigation">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href!}
            aria-current={path === href ? "page" : undefined}
            onClick={() => drawer.current?.close()}
          >
            {label}
          </Link>
        ))}
      </nav>
      <details className="aa-unavailable">
        <summary>Upcoming modules</summary>
        <p>
          Categories, media, reviews, orders, payments, coupons, CMS and
          marketing are not connected in this increment.
        </p>
      </details>
      <Link href="/">View storefront</Link>
      <p className="aa-role">
        {roles.map((r) => r.replaceAll("_", " ")).join(", ")} · MFA verified
      </p>
      <form action={signOutStaff}>
        <button className="aa-secondary">Sign out</button>
      </form>
    </>
  );
  return (
    <div className="aa-shell">
      <aside className="aa-sidebar">
        <Link href="/admin" aria-label="Attires Arena administration">
          <Image
            src="/brand/logo-maroon.png"
            alt="Attires Arena"
            width={90}
            height={86}
          />
        </Link>
        <p className="aa-eyebrow">Administration</p>
        {navigation}
      </aside>
      <div className="aa-content">
        <header className="aa-top">
          <button
            className="aa-mobile-toggle aa-secondary"
            onClick={() => drawer.current?.showModal()}
            aria-haspopup="dialog"
          >
            Menu
          </button>
          <span>Attires Arena / Admin</span>
          <span>Development · Preview</span>
        </header>
        <dialog
          ref={drawer}
          className="aa-drawer"
          aria-label="Administration menu"
        >
          <button
            className="aa-secondary"
            onClick={() => drawer.current?.close()}
          >
            Close menu
          </button>
          {navigation}
        </dialog>
        {children}
      </div>
    </div>
  );
}
