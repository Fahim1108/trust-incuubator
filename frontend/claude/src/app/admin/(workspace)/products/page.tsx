import Link from "next/link";
import {z} from "zod";
import {matchesProductFilter} from "@/lib/admin/product-review";
import { catalogueSnapshot } from "@/lib/admin/access";
import { IntakeEditor } from "@/components/admin/access/IntakeEditor";
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; filter?:string|string[]; review?:string|string[] }>;
}) {
  const { session, snapshot } = await catalogueSnapshot();
  const params=await searchParams;
  const { q: rawQuery } = params;
  const filter=typeof params.filter==='string'?params.filter:'';
  const review=typeof params.review==='string'?params.review:'';
  const canManage=session.roles.some(r=>r==='owner'||r==='product_manager');
  const extra= snapshot?await session.client.from('products').select('id,name,status').order('created_at',{ascending:false}).limit(100):null;
  if(extra?.error)throw new Error('Unable to read product drafts.');
  const basic=z.array(z.object({id:z.uuid(),name:z.string(),status:z.string()})).parse(extra?.data||[]).filter(p=>!snapshot?.items.some(i=>i.id===p.id));
  const q = typeof rawQuery === "string" ? rawQuery.slice(0, 200) : "";
  const search = q.toLowerCase();
  const items =
    snapshot?.items.filter((p) =>
      `${p.name} ${p.source_id}`.toLowerCase().includes(search)&&matchesProductFilter(p,filter)&&(!review||p.source_id===review),
    ) || [];
  return (
    <main id="main" className="aa-main">
      <p className="aa-eyebrow">Catalogue / Physical intake</p>
      <h1>Product drafts</h1>
      <p>
        Original photographs, real recorded prices and physical quantities.
        Draft sizes remain unverified.
      </p>
      {canManage&&<Link className="aa-button" href="/admin/products/new">Add product draft</Link>}
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
        <label className="sr-only" htmlFor="product-filter">Product status filter</label><select id="product-filter" name="filter" defaultValue={filter}><option value="">All imported products</option><option value="missing-size">Sizes awaiting verification</option><option value="missing-measurement">Missing measurements</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option><option value="sold-out">Sold out</option></select><button>Search</button>
      </form>
      {!snapshot ? (
        <p role="alert">Your role has no catalogue access.</p>
      ) : items.length ? (
        items.map((item) => (
          <section key={item.id}>
          <nav aria-label={`Review ${item.source_id}`} className="aa-editor-actions">
          {snapshot?.items[snapshot.items.findIndex(i=>i.id===item.id)-1]&&<Link href={'/admin/products?review='+snapshot.items[snapshot.items.findIndex(i=>i.id===item.id)-1]!.source_id}>Previous</Link>}
          {snapshot?.items[snapshot.items.findIndex(i=>i.id===item.id)+1]&&<Link href={'/admin/products?review='+snapshot.items[snapshot.items.findIndex(i=>i.id===item.id)+1]!.source_id}>Next Product</Link>}
          </nav>
          <IntakeEditor
            key={item.id}
            initiallyOpen={Boolean(review)}
            item={item}
            editable={session.roles.some(
              (r) => r === "owner" || r === "product_manager",
            )}
          />
          </section>
        ))
      ) : (
        <div className="aa-panel">No matching product drafts.</div>
      )}
      {basic.length>0&&<section className="aa-panel"><h2>Basic product drafts</h2><p>These real records are not yet in the garment intake workflow. Image, price and measurement setup is still required before publication.</p>{basic.filter(p=>p.name.toLowerCase().includes(search)).map(p=><article key={p.id}><strong>{p.name}</strong><p>{p.status} · Details not configured</p></article>)}</section>}
    </main>
  );
}
