import Link from 'next/link';
import {readProductLibrary} from '@/lib/admin/product-library';
import {libraryLink,type LibraryParams} from '@/lib/admin/library-validation';
export default async function ProductLibrary({searchParams}:{searchParams:Promise<LibraryParams>}){
 const {items,count,filters,canManage}=await readProductLibrary(await searchParams);
 return <main id="main" className="aa-main"><p className="aa-eyebrow">Catalogue / All records</p><h1>Product library</h1>
 <p>Persisted products, including basic drafts and imported garments. Public visibility remains controlled by the existing publication checks.</p>
 <nav className="aa-editor-actions" aria-label="Product tools"><Link href="/admin/products">Garment intake</Link>{canManage&&<><Link className="aa-button" href="/admin/products/new">Add product draft</Link><Link href="/admin/media">Private draft media</Link></>}</nav>
 <form action="/admin/products/library" className="aa-search"><label htmlFor="library-search">Product name</label><input id="library-search" name="q" maxLength={120} defaultValue={filters.q}/>
 <label htmlFor="library-status">Status</label><select id="library-status" name="status" defaultValue={filters.status}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>
 <label htmlFor="library-sort">Sort products</label><select id="library-sort" name="sort" defaultValue={filters.sort}><option value="updated">Recently updated</option><option value="newest">Newest first</option><option value="name">Name A–Z</option></select><button>Apply filters</button></form>
 <p>{count} matching products · Page {filters.page}</p>
 {items.length?items.map(p=><article className="aa-panel" key={p.id}><span className="aa-status">{p.status}</span><h2><Link href={'/admin/products/'+p.id}>{p.name}</Link></h2><p>Updated <time dateTime={p.updated_at}>{new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium'}).format(new Date(p.updated_at))}</time></p><Link href={'/admin/products/'+p.id}>View product details</Link></article>):<p className="aa-panel">No products match these filters.</p>}
 <nav className="aa-editor-actions" aria-label="Product library pages">{filters.page>1&&<Link href={libraryLink(filters,filters.page-1)}>Previous page</Link>}{filters.page*24<count&&<Link href={libraryLink(filters,filters.page+1)}>Next page</Link>}</nav>
 </main>;
}
