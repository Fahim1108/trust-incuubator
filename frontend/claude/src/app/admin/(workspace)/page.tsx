import Link from 'next/link';
import {Package,CheckCircle2,FolderClock,Boxes,PackageX,Ruler,Plus,ArrowUpRight} from 'lucide-react';
import {catalogueSnapshot} from '@/lib/admin/access';
import {isProductionStorefront} from '@/lib/storefront-policy';
export default async function AdminOverview(){
 const {snapshot,session}=await catalogueSnapshot();
 const canManage=session.roles.some(r=>r==='owner'||r==='product_manager');
 const productsHref=isProductionStorefront()?'/admin/products':'/admin/products/library';
 const metrics=snapshot?[
  {label:'Total products',value:snapshot.products,Icon:Package},
  {label:'Published products',value:snapshot.published,Icon:CheckCircle2},
  {label:'Draft products',value:snapshot.drafts,Icon:FolderClock},
  {label:'Available SKUs',value:snapshot.available,Icon:Boxes},
  {label:'Sold-out SKUs',value:snapshot.sold_out,Icon:PackageX},
  {label:'Sizes awaiting verification',value:snapshot.pending_sizes,Icon:Ruler},
 ]:[];
 return <main id="main" className="aa-main"><header className="aa-page-heading"><div><p className="aa-eyebrow">Administration</p><h1>Store overview</h1><p>Your collection, priorities and daily operations in one place.</p></div><span className="aa-date-label">{new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium'}).format(new Date())} · Dhaka</span></header>
 {snapshot?<><div className="aa-metrics">{metrics.map(({label,value,Icon})=><article className="aa-panel" key={label}><div className="aa-section-heading"><span>{label}</span><Icon size={18} strokeWidth={1.5} aria-hidden="true"/></div><strong>{value}</strong></article>)}</div>
 <div className="aa-dashboard-columns"><section className="aa-panel"><p className="aa-eyebrow">Your collection</p><h2>One workspace per product</h2><p>Manage details, images, organization, variants and stock without a long page of unrelated forms.</p><div className="aa-editor-actions"><Link className="aa-button" href={productsHref}>Manage products <ArrowUpRight size={15} aria-hidden="true"/></Link>{canManage&&<Link className="aa-row-action" href="/admin/products/new"><Plus size={15} aria-hidden="true"/> Add product</Link>}</div></section>
 <section className="aa-panel"><p className="aa-eyebrow">Needs attention</p><h2>Collection checklist</h2><ul className="aa-task-list"><li><strong>{snapshot.pending_sizes}</strong> sizes awaiting physical verification</li><li><strong>{snapshot.drafts}</strong> product drafts to prepare</li><li><strong>{snapshot.sold_out}</strong> sold-out SKUs</li></ul><Link className="aa-row-action" href="/admin/products?filter=missing-size">Review garment intake <ArrowUpRight size={15} aria-hidden="true"/></Link></section></div>
 <section className="aa-panel"><div className="aa-section-heading"><h2>Recent garment intake</h2><Link className="aa-row-action" href="/admin/products">View intake <ArrowUpRight size={15} aria-hidden="true"/></Link></div>{snapshot.items.length?<div className="aa-intake-list">{snapshot.items.slice(0,4).map(item=><Link href={productsHref==='/admin/products'?'/admin/products?q='+encodeURIComponent(item.source_id):'/admin/products/'+item.id} key={item.id}><span><strong>{item.name}</strong><small>{item.source_id} · {item.actual_size||'Size not recorded'}</small></span><span className="aa-status">{item.status}</span></Link>)}</div>:<div className="aa-empty-state"><Package size={24} strokeWidth={1.4} aria-hidden="true"/><h3>No garment intake yet</h3><p>Only saved products and verified physical facts appear here.</p></div>}</section>
 </>:<section className="aa-panel"><h2>Catalogue access unavailable</h2><p>Your assigned staff role does not include catalogue permission.</p></section>}
 <aside className="aa-workspace-note"><strong>Connected data only</strong><p>Orders, revenue, customer analytics and payment verification are not connected yet. No sample metrics or estimated profit are displayed.</p></aside></main>;
}
