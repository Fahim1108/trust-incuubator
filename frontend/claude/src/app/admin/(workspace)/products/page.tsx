import { catalogueSnapshot } from "@/lib/admin/access";
import { IntakeEditor } from "@/components/admin/access/IntakeEditor";
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { session, snapshot } = await catalogueSnapshot();
  const { q = "" } = await searchParams;
  const search = q.slice(0, 200).toLowerCase();
  const items =
    snapshot?.items.filter((p) =>
      `${p.name} ${p.source_id}`.toLowerCase().includes(search),
    ) || [];
  return (
    <main id="main" className="aa-main">
      <p className="aa-eyebrow">Catalogue / Physical intake</p>
      <h1>Product drafts</h1>
      <p>
        Original photographs, real recorded prices and physical quantities.
        Draft sizes remain unverified.
      </p>
      <form className="aa-search" action="/admin/products">
        <label className="sr-only" htmlFor="product-search">
          Find products
        </label>
        <input
          id="product-search"
          name="q"
          defaultValue={q}
          placeholder="Search name or shirt ID"
          maxLength={200}
        />
        <button>Search</button>
      </form>
      {!snapshot ? (
        <p role="alert">Your role has no catalogue access.</p>
      ) : items.length ? (
        items.map((item) => (
          <IntakeEditor
            key={item.id}
            item={item}
            editable={session.roles.some(
              (r) => r === "owner" || r === "product_manager",
            )}
          />
        ))
      ) : (
        <div className="aa-panel">No matching product drafts.</div>
      )}
    </main>
  );
}
