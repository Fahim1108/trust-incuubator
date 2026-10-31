"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {LayoutDashboard,Package,Plus,Tags,Menu,ArrowUpRight,ShieldCheck,ClipboardList,ImageIcon,History,Search} from 'lucide-react';
import { signOutStaff } from "@/lib/admin/actions";
export function AdminShell({
  children,
  roles,
  stagingTools=false,
  taxonomyTools=false,
}: {
  children: React.ReactNode;
  roles: string[];
  stagingTools?:boolean;
  taxonomyTools?:boolean;
}) {
  const path = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const canRead=roles.some(r=>['owner','product_manager','order_manager','analyst'].includes(r));
  const canManage=roles.some(r=>r==='owner'||r==='product_manager');
  const groups=[
    {title:'Main',links:[['/admin','Dashboard']]},
    ...(canRead?[{title:'Catalog',links:[...(stagingTools?[['/admin/products/library','All products']]:[]),...(canManage?[['/admin/products/new','Add product']]:[]),['/admin/products','Garment intake'],...(stagingTools&&taxonomyTools?[['/admin/taxonomy','Categories & discovery']]:[])]}]:[]),
    ...(canManage?[{title:'System',links:[['/admin/audit','Activity log'],...(stagingTools?[['/admin/media','Private media']]:[])]}]:[]),
  ];
  const current=(href:string)=>path===href||(href==='/admin/products/library'&&/^\/admin\/products\/[0-9a-f-]{36}$/.test(path));
  const navIcon=(href:string)=>href==='/admin'?LayoutDashboard:href.endsWith('/new')?Plus:href.endsWith('/taxonomy')?Tags:href.endsWith('/audit')?History:href.endsWith('/media')?ImageIcon:href==='/admin/products'?ClipboardList:Package;
  const navigation = (
    <>
      <nav aria-label="Admin navigation">
        {groups.map(group=><details className="aa-nav-group" key={group.title} open>
          <summary>{group.title}</summary>
          {group.links.map(([href,label])=>{const Icon=navIcon(href!);return <Link key={href} href={href!} aria-current={current(href!)?'page':undefined} onClick={()=>drawer.current?.close()}><Icon size={16} strokeWidth={1.6} aria-hidden="true"/>{label}</Link>;})}
        </details>)}
      </nav>
      <details className="aa-unavailable">
        <summary>Service availability</summary>
        <p>Orders, payment verification and business reporting are not connected yet. No estimated sales or revenue are shown.</p>
      </details>
      <Link className="aa-visit-store" href="/">Visit store <ArrowUpRight size={15} aria-hidden="true"/></Link>
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
            src={stagingTools?'/brand/logo-white.png':'/brand/logo-maroon.png'}
            alt="Attires Arena"
            width={90}
            height={86}
            style={{objectFit:'contain'}}
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
          <Image className="aa-mobile-brand" src={stagingTools?'/brand/logo-white.png':'/brand/logo-maroon.png'} alt="Attires Arena" width={46} height={44}/>
          {canRead&&stagingTools?<form className="aa-global-search" action="/admin/products/library"><Search size={16} strokeWidth={1.6} aria-hidden="true"/><input name="q" type="search" aria-label="Search products" placeholder="Search products…" maxLength={120}/></form>:<span className="aa-admin-title">Administration</span>}
          <span className="aa-environment"><ShieldCheck size={14} aria-hidden="true"/>{stagingTools?'Staging workspace':'Store management'}</span>
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
        {stagingTools&&<nav className="aa-admin-bottom" aria-label="Mobile admin navigation">
          <Link href="/admin" aria-current={path==='/admin'?'page':undefined}><LayoutDashboard size={20} aria-hidden="true"/>Home</Link>
          {canRead&&<Link href="/admin/products/library" aria-current={current('/admin/products/library')?'page':undefined}><Package size={20} aria-hidden="true"/>Products</Link>}
          {canManage&&<Link href="/admin/products/new" aria-current={path==='/admin/products/new'?'page':undefined}><Plus size={20} aria-hidden="true"/>Add</Link>}
          {canRead&&taxonomyTools&&<Link href="/admin/taxonomy" aria-current={path==='/admin/taxonomy'?'page':undefined}><Tags size={20} aria-hidden="true"/>Categories</Link>}
          <button type="button" onClick={()=>drawer.current?.showModal()} aria-haspopup="dialog"><Menu size={20} aria-hidden="true"/>More</button>
        </nav>}
      </div>
    </div>
  );
}
