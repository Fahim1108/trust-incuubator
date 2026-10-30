import Link from 'next/link';
import {notFound} from 'next/navigation';
import {randomUUID} from 'node:crypto';
import {librarySession} from '@/lib/admin/product-library';
import {libraryFilters,literalSearch,type LibraryParams} from '@/lib/admin/library-validation';
import {termKind,termRecord} from '@/lib/admin/taxonomy-validation';
import {TaxonomyForm} from '@/components/admin/access/TaxonomyForms';
export default async function Taxonomy({searchParams}:{searchParams:Promise<LibraryParams>}){
 if(process.env.STAGING_CATALOGUE_TAXONOMY!=='1')notFound();
 const s=await librarySession();const params=await searchParams;const kind=termKind.catch('category').parse(params.kind);const filters=libraryFilters(params);
 let query=kind==='category'?s.client.from('categories').select('id,name,slug,published,updated_at',{count:'exact'}):s.client.from('catalogue_terms').select('id,name,slug,published,updated_at',{count:'exact'}).eq('kind',kind);
 if(filters.q)query=query.ilike('name',literalSearch(filters.q));
 const result=await query.order('name').order('id').range((filters.page-1)*24,filters.page*24-1);if(result.error)throw new Error('Catalogue records could not be read.');
 const records=termRecord.array().parse(result.data);const canManage=s.roles.some(r=>r==='owner'||r==='product_manager');
 const href=(page:number)=>'/admin/taxonomy?'+new URLSearchParams({kind,q:filters.q,page:String(page)});
 return <main id="main" className="aa-main"><h1>Catalogue taxonomy</h1><nav className="aa-editor-actions" aria-label="Catalogue record types">{termKind.options.map(k=><Link href={'/admin/taxonomy?kind='+k} key={k} aria-current={k===kind?'page':undefined}>{k==='category'?'Categories':k==='brand'?'Brands':k==='collection'?'Collections':'Tags'}</Link>)}</nav>
 <form className="aa-search" action="/admin/taxonomy"><input type="hidden" name="kind" value={kind}/><label>Search names<input name="q" maxLength={120} defaultValue={filters.q}/></label><button>Search catalogue records</button></form>
 {canManage&&<details className="aa-panel"><summary>Create {kind}</summary><TaxonomyForm kind={kind} id={randomUUID()}/></details>}
 <p>{result.count||0} matching records · Page {filters.page}</p>
 {records.map(record=><article className="aa-panel" key={record.id}><h2>{record.name}</h2><p>{record.slug} · {record.published?'Published':'Unpublished'}</p>{canManage&&<details><summary>Edit {kind}</summary><TaxonomyForm kind={kind} id={record.id} record={record}/></details>}</article>)}
 {!records.length&&<p className="aa-panel">No matching catalogue records.</p>}<nav className="aa-editor-actions" aria-label="Catalogue record pages">{filters.page>1&&<Link href={href(filters.page-1)}>Previous</Link>}{filters.page*24<(result.count||0)&&<Link href={href(filters.page+1)}>Next</Link>}</nav></main>;
}
