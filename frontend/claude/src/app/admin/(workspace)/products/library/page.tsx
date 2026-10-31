import Link from 'next/link';
import {Plus,Search,Package,ArrowUpRight} from 'lucide-react';
import {ProductThumbnail} from '@/components/admin/access/ProductThumbnail';
import {minorPrice} from '@/lib/admin/library-validation';
import {readProductLibrary} from '@/lib/admin/product-library';
import {libraryLink,type LibraryParams} from '@/lib/admin/library-validation';
export default async function ProductLibrary({searchParams}:{searchParams:Promise<LibraryParams>}){
 const {items,count,filters,canManage}=await readProductLibrary(await searchParams);
 const pricing=(p:typeof items[number])=>p.summary.priceMin===null?'Not configured':minorPrice(p.summary.priceMin)+(p.summary.priceMax!==p.summary.priceMin?' – '+minorPrice(p.summary.priceMax!):'');
 const stock=(p:typeof items[number])=>p.summary.available===null?'Not recorded':String(p.summary.available);
 const date=(value:string)=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium'}).format(new Date(value));
 return <main id="main" className="aa-main"><header className="aa-page-heading"><div><p className="aa-eyebrow">Catalog</p><h1>Products</h1><p>Manage your collection, product details and inventory.</p></div>{canManage&&<Link className="aa-button" href="/admin/products/new"><Plus size={16} aria-hidden="true"/> Add product</Link>}</header>
 <form action="/admin/products/library" className="aa-product-filters">
 <div className="aa-search-field"><Search size={16} aria-hidden="true"/><input aria-label="Product name" id="library-search" name="q" placeholder="Search products…" maxLength={120} defaultValue={filters.q}/></div>
 <div><label htmlFor="library-status">Status</label><select id="library-status" name="status" defaultValue={filters.status}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
 <div><label htmlFor="library-sort">Sort products</label><select id="library-sort" name="sort" defaultValue={filters.sort}><option value="updated">Recently updated</option><option value="newest">Newest first</option><option value="name">Name A–Z</option></select></div><button>Apply filters</button></form>
 <div className="aa-section-heading"><p>{count} matching products</p><span>Page {filters.page}</span></div>
 {items.length?<>
 <div className="aa-product-table"><table><caption className="aa-sr-only">Products matching your filters</caption><thead><tr><th scope="col">Product</th><th scope="col">SKU price</th><th scope="col">Unreserved units</th><th scope="col">Status</th><th scope="col">Last updated · Dhaka</th><th scope="col">Action</th></tr></thead><tbody>{items.map(p=><tr key={p.id}><th scope="row"><div className="aa-product-identity"><ProductThumbnail url={p.coverUrl} alt={p.coverAlt}/><div><Link href={'/admin/products/'+p.id}>{p.name}</Link><small>{p.summary.skuCount}{p.summary.truncated?'+':''} SKUs · /{p.slug}</small></div></div></th><td>{pricing(p)}</td><td>{stock(p)}<small>All SKUs</small></td><td><span className={'aa-status aa-status-'+p.status}>{p.status}</span></td><td><time dateTime={p.updated_at}>{date(p.updated_at)}</time></td><td><Link className="aa-row-action" href={'/admin/products/'+p.id}>Manage <ArrowUpRight size={14} aria-hidden="true"/></Link></td></tr>)}</tbody></table></div>
 <div className="aa-mobile-products">{items.map(p=><article key={p.id} className="aa-mobile-product"><div className="aa-section-heading"><ProductThumbnail url={p.coverUrl} alt={p.coverAlt}/><span className={'aa-status aa-status-'+p.status}>{p.status}</span></div><h2><Link href={'/admin/products/'+p.id}>{p.name}</Link></h2><div className="aa-mobile-product-facts"><strong>{pricing(p)}</strong><span>{stock(p)} unreserved · {p.summary.skuCount}{p.summary.truncated?'+':''} SKUs</span></div><p>Updated {date(p.updated_at)}</p><Link className="aa-row-action" href={'/admin/products/'+p.id}>Manage product <ArrowUpRight size={15} aria-hidden="true"/></Link></article>)}</div>
 </>:<section className="aa-empty-state aa-panel"><Package size={28} strokeWidth={1.4} aria-hidden="true"/><h2>No products found</h2><p>{filters.q||filters.status?'Try another search or status.':'Start your collection with a product draft.'}</p>{canManage&&<Link href="/admin/products/new">Add your first product →</Link>}</section>}
 <nav className="aa-pagination" aria-label="Product library pages">{filters.page>1&&<Link href={libraryLink(filters,filters.page-1)}>Previous page</Link>}<span>Page {filters.page}</span>{filters.page*24<count&&<Link href={libraryLink(filters,filters.page+1)}>Next page</Link>}</nav>
 </main>;
}
