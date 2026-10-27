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
  const canRead=roles.some(r=>['owner','product_manager','order_manager','analyst'].includes(r));
  const canManage=roles.some(r=>r==='owner'||r==='product_manager');
  const groups=[
    {title:'Overview',links:[['/admin','Dashboard']]},
    ...(canRead?[{title:'Catalog',links:[['/admin/products','Products & intake']]}]:[]),
    ...(canManage?[{title:'Settings',links:[['/admin/audit','Security & audit logs']]}]:[]),
  ];
  const upcoming=[
    ['Overview','Analytics'],['Catalog','Categories · Inventory · Media Library'],
    ['Sales','Orders · Payment Verification · Customers · Coupons · Offers · Reviews'],
    ['Content','Homepage Manager · Hero Banners · Pages · Navigation & Footer · Blog'],
    ['Marketing','SEO · Google Analytics · Meta Pixel & Conversions API · Integrations'],
    ['Settings','Shipping · Payment Numbers · Staff & Roles'],
  ];
  const navigation = (
    <>
      <nav aria-label="Admin navigation">
        {groups.map(group=><section className="aa-nav-group" key={group.title}>
          <h2>{group.title}</h2>
          {group.links.map(([href,label])=><Link key={href} href={href!} aria-current={path===href?'page':undefined} onClick={()=>drawer.current?.close()}>{label}</Link>)}
        </section>)}
      </nav>
      <details className="aa-unavailable">
        <summary>Upcoming modules</summary>
        <p>Not connected yet. These modules cannot change store data.</p>
        {upcoming.map(([title,modules])=><div className="aa-roadmap-group" key={title}><strong>{title}</strong><p>{modules}</p></div>)}
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
          <Image className="aa-mobile-brand" src="/brand/logo-maroon.png" alt="Attires Arena" width={46} height={44}/><span className="aa-admin-title">Store management</span>
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
