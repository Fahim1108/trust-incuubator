import Link from "next/link";
import { catalogueSnapshot } from "@/lib/admin/access";
export default async function AdminOverview() {
  const { snapshot, session } = await catalogueSnapshot();
  return (
    <main id="main" className="aa-main">
      <p className="aa-eyebrow">Your store, clearly</p>
      <h1>Store overview</h1>
      <p>Your collection, priorities and daily operations in one place.</p>
      {snapshot ? (
        <>
          <div className="aa-metrics">
            {[
              ["Total products", snapshot.products],
              ["Published products", snapshot.published],
              ["Draft products", snapshot.drafts],
              ["Available SKUs", snapshot.available],
              ["Sold-out SKUs", snapshot.sold_out],
              ["Sizes awaiting verification", snapshot.pending_sizes],
            ].map(([label, value]) => (
              <article className="aa-panel" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <div className="aa-dashboard-columns">
          <section className="aa-panel">
            <p className="aa-eyebrow">Next steps</p><h2>Prepare your collection</h2>
            <p>{snapshot.pending_sizes} imported shirts need actual size verification before publication.</p>
            <Link className="aa-button" href="/admin/products">Review Draft Products</Link>
            <p className="aa-help">Enter measured sizes in the draft editor. Publishing and image uploads are the next product-management milestone.</p>
          </section>
          <section className="aa-panel">
            <p className="aa-eyebrow">Needs attention</p><h2>Collection checklist</h2>
            <ul className="aa-task-list"><li><strong>{snapshot.pending_sizes}</strong> sizes awaiting physical verification</li><li><strong>{snapshot.drafts}</strong> product drafts to prepare</li><li><strong>{snapshot.published}</strong> products currently published</li></ul>
            {session.roles.some(r=>r==='owner'||r==='product_manager')&&<Link href="/admin/audit">View catalogue change history →</Link>}
          </section>
          </div>
          <section className="aa-panel"><h2>Recent intake</h2><div className="aa-intake-list">{snapshot.items.slice(0,4).map(item=><Link href={'/admin/products?q='+encodeURIComponent(item.source_id)} key={item.id}><span><strong>{item.name}</strong><small>{item.source_id} · {item.actual_size||'Size not recorded'}</small></span><span className="aa-status">{item.status}</span></Link>)}</div></section>
        </>
      ) : (
        <section className="aa-panel">
          <h2>Catalogue access unavailable</h2>
          <p>Your assigned staff role does not include catalogue permission.</p>
        </section>
      )}
      <section className="aa-panel aa-service-status"><h2>Business services</h2><p>Unavailable services are shown here without estimated numbers or inactive action buttons.</p><div className="aa-service-grid">{[['Orders & revenue','Order totals, status breakdowns and recognized revenue require the transactional order backend.'],['Payment verification','No connected submission or verification queue. No payment can be confirmed here.'],['Add Shirt & publishing','New product creation, uploads and verified publication follow in Milestone 2.'],['Homepage management','Content publishing is not connected. Storefront settings remain unchanged.']].map(([title,description])=><article key={title}><span className="aa-status">Not connected</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    </main>
  );
}
