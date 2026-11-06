import Link from 'next/link';
import {Plus,Search,Package,ArrowUpRight,Pencil} from 'lucide-react';
import {ProductThumbnail} from '@/components/admin/access/ProductThumbnail';
import {minorPrice} from '@/lib/admin/library-validation';
import {readProductLibrary} from '@/lib/admin/product-library';
import {libraryLink,type LibraryParams} from '@/lib/admin/library-validation';
export default async function ProductLibrary({searchParams}:{searchParams:Promise<LibraryParams>}){
 const {items,count,filters,canManage,narrowed}=await readProductLibrary(await searchParams);
 type Item=typeof items[number];
 const pricing=(p:Item)=>p.priceMin===null?'Not configured':minorPrice(p.priceMin)+(p.priceMax!==null&&p.priceMax!==p.priceMin?' – '+minorPrice(p.priceMax):'');
 const stock=(p:Item)=>p.stock===null?'Not recorded':p.kind==='garment'?(p.stock===1?'1 on hand':'0 · sold or missing'):p.stock+' available';
 const date=(value:string)=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium'}).format(new Date(value));
 const missing=(p:Item)=>p.missing.length?<span className="aa-missing" title={'Missing: '+p.missing.join(', ')}>Missing: {p.missing.join(', ')}</span>:<span className="aa-complete">Details recorded</span>;
 const actions=(p:Item)=><div className="aa-row-actions"><Link className="aa-row-action" href={'/admin/products/'+p.id} aria-label={(canManage&&p.status==='draft'?'Edit ':'View ')+p.name}><Pencil size={14} aria-hidden="true"/>{canManage&&p.status==='draft'?'Edit':'View'}</Link>{p.previewHref&&<Link className="aa-row-action" href={p.previewHref} target="_blank" rel="noopener noreferrer" prefetch={false} aria-label={'Preview '+p.name+' (opens in a new tab)'}>Preview <ArrowUpRight size={14} aria-hidden="true"/></Link>}</div>;
 const filtered=Boolean(filters.q||filters.status||filters.type);
 return <main id="main" className="aa-main"><header className="aa-page-heading"><div><p className="aa-eyebrow">Catalog</p><h1>Products</h1><p>Imported garments and standard products, with their real prices, sizes and stock.</p></div>{canManage&&<Link className="aa-button" href="/admin/products/new"><Plus size={16} aria-hidden="true"/> Add product</Link>}</header>
 <form action="/admin/products/library" className="aa-product-filters aa-product-filters--wide">
 <div className="aa-search-field"><Search size={16} aria-hidden="true"/><input aria-label="Search by name, garment ID or SKU" id="library-search" name="q" placeholder="Name, garment ID or SKU…" maxLength={120} defaultValue={filters.q}/></div>
 <div><label htmlFor="library-type">Type</label><select id="library-type" name="type" defaultValue={filters.type}><option value="">All products</option><option value="garment">Physical garments</option><option value="attention">Garments missing details</option><option value="standard">Standard products</option></select></div>
 <div><label htmlFor="library-status">Status</label><select id="library-status" name="status" defaultValue={filters.status}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
 <div><label htmlFor="library-sort">Sort</label><select id="library-sort" name="sort" defaultValue={filters.sort}><option value="updated">Recently updated</option><option value="newest">Newest first</option><option value="name">Name A–Z</option></select></div><button>Apply</button></form>
 <div className="aa-section-heading"><p role="status">{count} matching products{filtered&&<> · <Link href="/admin/products/library">Clear filters</Link></>}</p><span>Page {filters.page}</span></div>
 {narrowed&&<p className="aa-note">Many records match this search; only the first 150 are listed. Refine the search to narrow results.</p>}
 {items.length?<>
 <div className="aa-product-table"><table><caption className="aa-sr-only">Products matching your filters</caption><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Size</th><th scope="col">Price</th><th scope="col">Stock</th><th scope="col">Status</th><th scope="col">Updated · Dhaka</th><th scope="col"><span className="aa-sr-only">Actions</span></th></tr></thead><tbody>{items.map(p=><tr key={p.id}><th scope="row"><div className="aa-product-identity"><ProductThumbnail url={p.coverUrl} alt={p.coverAlt}/><div><Link href={'/admin/products/'+p.id}>{p.name}</Link><small>{p.reference||'No SKU yet'} · {p.kind==='garment'?'Single garment':p.skuCount+(p.truncated?'+':'')+' SKUs'}</small>{missing(p)}</div></div></th><td>{p.category||<span className="aa-muted">Not assigned</span>}</td><td>{p.size||<span className="aa-muted">Not recorded</span>}</td><td>{pricing(p)}</td><td>{stock(p)}</td><td><span className={'aa-status aa-status-'+p.status}>{p.status}</span></td><td><time dateTime={p.updated_at}>{date(p.updated_at)}</time></td><td>{actions(p)}</td></tr>)}</tbody></table></div>
 <div className="aa-mobile-products">{items.map(p=><article key={p.id} className="aa-mobile-product"><div className="aa-mobile-product-head"><ProductThumbnail url={p.coverUrl} alt={p.coverAlt}/><div><h2><Link href={'/admin/products/'+p.id}>{p.name}</Link></h2><small>{p.reference||'No SKU yet'}</small></div><span className={'aa-status aa-status-'+p.status}>{p.status}</span></div>
  <dl className="aa-mobile-facts"><div><dt>Price</dt><dd>{pricing(p)}</dd></div><div><dt>Size</dt><dd>{p.size||'Not recorded'}</dd></div><div><dt>Stock</dt><dd>{stock(p)}</dd></div><div><dt>Category</dt><dd>{p.category||'Not assigned'}</dd></div></dl>
  <p>{missing(p)}</p><p className="aa-muted">Updated {date(p.updated_at)}</p>{actions(p)}</article>)}</div>
 </>:<section className="aa-empty-state aa-panel"><Package size={28} strokeWidth={1.4} aria-hidden="true"/><h2>No products found</h2><p>{filtered?'Try another search, type or status.':'Start your collection with a product draft.'}</p>{canManage&&!filtered&&<Link href="/admin/products/new">Add your first product →</Link>}</section>}
 <nav className="aa-pagination" aria-label="Product library pages">{filters.page>1&&<Link href={libraryLink(filters,filters.page-1)}>Previous page</Link>}<span>Page {filters.page}</span>{filters.page*24<count&&<Link href={libraryLink(filters,filters.page+1)}>Next page</Link>}</nav>
 </main>;
}
