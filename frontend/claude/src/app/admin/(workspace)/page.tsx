import Link from "next/link";
import { catalogueSnapshot } from "@/lib/admin/access";
export default async function AdminOverview() {
  const { snapshot } = await catalogueSnapshot();
  return (
    <main id="main" className="aa-main">
      <p className="aa-eyebrow">Your store, clearly</p>
      <h1>Store overview</h1>
      <p>Live development catalogue data. No sample business metrics.</p>
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
          <section className="aa-panel">
            <h2>Prepare your collection</h2>
            <p>
              {snapshot.pending_sizes} imported shirts await actual size
              verification. Physical intake quantities are separate from active
              purchasable SKUs.
            </p>
            <Link className="aa-button" href="/admin/products">
              Manage product drafts
            </Link>
          </section>
        </>
      ) : (
        <section className="aa-panel">
          <h2>Catalogue access unavailable</h2>
          <p>Your assigned staff role does not include catalogue permission.</p>
        </section>
      )}
      <section className="aa-panel">
        <h2>Sales & payments</h2>
        <p>
          Unavailable: the real order and payment system is not connected. Order
          counts, charts, payment queues and recognized revenue cannot be
          reported yet.
        </p>
      </section>
    </main>
  );
}
