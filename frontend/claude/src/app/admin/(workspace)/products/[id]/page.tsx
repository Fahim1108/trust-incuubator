import Link from 'next/link';
import {randomUUID} from 'node:crypto';
import {CheckCircle2,CircleAlert,CircleHelp,ArrowUpRight} from 'lucide-react';
import {BasicDraftEditor} from '@/components/admin/access/BasicDraftEditor';
import {PrivateProductGallery} from '@/components/admin/access/PrivateProductGallery';
import {VariantEditor,StockEditor} from '@/components/admin/access/VariantEditor';
import {PrivateProductTaxonomy} from '@/components/admin/access/PrivateProductTaxonomy';
import {ProductWorkspace} from '@/components/admin/access/ProductWorkspace';
import {GarmentWorkspace} from '@/components/admin/access/GarmentWorkspace';
import {readProductRecord,readProductTerms,countProductImages} from '@/lib/admin/product-library';
import {minorPrice} from '@/lib/admin/library-validation';
import {garmentReadiness,standardReadiness,publicationBackendGaps,type ReadinessCheck} from '@/lib/admin/product-readiness';
import {reviewInventoryEnabled} from '@/lib/storefront-policy';
const flag=(name:string)=>process.env[name]==='1';
function Readiness({checks}:{checks:ReadinessCheck[]}){
 return <ul className="aa-readiness">{checks.map(c=><li key={c.key} data-state={c.ok===null?'unknown':c.ok?'ok':'missing'}>
  {c.ok===null?<CircleHelp size={18} aria-hidden="true"/>:c.ok?<CheckCircle2 size={18} aria-hidden="true"/>:<CircleAlert size={18} aria-hidden="true"/>}
  <div><strong>{c.label}</strong><span className="aa-sr-only">{c.ok===null?' — not readable here':c.ok?' — complete':' — missing'}</span>{c.ok!==true&&<small>{c.ok===null?'Cannot be checked in this environment.':c.hint}</small>}</div></li>)}</ul>;
}
function Unavailable({title,children}:{title:string;children:React.ReactNode}){return <section className="aa-panel aa-unavailable-panel"><h2>{title}</h2><p>{children}</p></section>;}
export default async function ProductRecord({params}:{params:Promise<{id:string}>}){
 const id=(await params).id;
 const {product,categoryName,variants,inventory,intake,hasMoreVariants,canManage}=await readProductRecord(id);
 const [terms,imageCount]=await Promise.all([readProductTerms(product.id),countProductImages(product.id)]);
 const draft=product.status==='draft';
 const editable=canManage&&draft;
 const stockOf=(variantId:string)=>inventory.find(i=>i.variant_id===variantId);
 const why=!canManage?'Your role can view products but not edit them.':!draft?'Only draft products can be edited. Published and archived products are locked until a publication workflow exists.':'This step is not activated in this environment.';
 // Shared steps backed by existing RPCs: private gallery, taxonomy assignments, stock adjustments.
 const media=editable&&flag('STAGING_PRODUCT_GALLERY')?<PrivateProductGallery id={product.id} updated_at={product.updated_at}/>:<Unavailable title="Private gallery">{why}</Unavailable>;
 const taxonomy=editable&&flag('STAGING_CATALOGUE_TAXONOMY')?<PrivateProductTaxonomy product={product}/>:<section className="aa-panel"><h2>Category &amp; taxonomy</h2><dl className="aa-fact-grid"><div><dt>Category</dt><dd>{categoryName||'Not assigned'}</dd></div>
  {(['brand','collection','tag'] as const).map(kind=><div key={kind}><dt>{kind==='brand'?'Brand':kind==='collection'?'Collections':'Tags'}</dt><dd>{terms===null?'Not readable here':terms.filter(t=>t.kind===kind).map(t=>t.name).join(', ')||'None'}</dd></div>)}</dl><p>{why}</p></section>;
 const stockCards=variants.map(v=>{const stock=stockOf(v.id);return <article className="aa-variant-card" key={v.id}><div className="aa-section-heading"><h3>{v.sku}</h3><span className="aa-status">{v.active?'Active':'Inactive'}</span></div><p>{v.size} · {v.color} · {minorPrice(v.sale_price_minor??v.price_minor)}{v.sale_price_minor!==null&&<> (regular {minorPrice(v.price_minor)})</>}</p>
  {stock?<div className="aa-stock-counts"><div><span>On hand</span><strong>{stock.on_hand}</strong></div><div><span>Reserved</span><strong>{stock.reserved}</strong></div><div><span>Available</span><strong>{stock.available}</strong></div></div>:<p>No inventory record</p>}
  {!intake&&editable&&flag('STAGING_VARIANT_MANAGEMENT')&&<details><summary>Edit SKU, size, colour or price</summary><VariantEditor target={product} variant={v}/></details>}
  {canManage&&flag('STAGING_VARIANT_MANAGEMENT')&&<details><summary>Adjust stock: {v.sku}</summary><StockEditor target={product} variantId={v.id}/></details>}
 </article>;});
 const checks=intake?garmentReadiness(product,intake):standardReadiness(product,{description:product.description,categoryAssigned:Boolean(product.category_id),imageCount,variants,available:variants.length&&!hasMoreVariants&&variants.every(v=>stockOf(v.id))?variants.reduce((sum,v)=>sum+(stockOf(v.id)?.available??0),0):null});
 const previewHref=intake&&(product.status==='published'||(draft&&canManage&&reviewInventoryEnabled()))?'/product/'+encodeURIComponent(product.slug):null;
 const review=<>
  <section className="aa-panel"><div className="aa-section-heading"><h2>Readiness</h2><span className="aa-status">{checks.filter(c=>c.ok===true).length}/{checks.length} complete</span></div><Readiness checks={checks}/></section>
  <section className="aa-panel"><h2>Preview</h2>{previewHref?<><p>{draft?'Opens the saved draft as it would appear in the store. Only your verified staff session can see it; customers cannot buy it.':'Opens the public product page.'}</p><Link className="aa-button aa-secondary" href={previewHref} target="_blank" rel="noopener noreferrer" prefetch={false}>Preview saved product <ArrowUpRight size={15} aria-hidden="true"/></Link></>:<p>{intake?'Draft preview is available only in review-enabled Preview environments for Owners and Product Managers.':'The storefront does not yet read non-garment products, so no preview exists for this product.'}</p>}</section>
  <section className="aa-panel"><h2>Publication</h2><p><span className={'aa-status aa-status-'+product.status}>{product.status}</span> {draft?'This product stays a draft. Saving, uploading images or adjusting stock never publishes it, and drafts cannot be purchased.':product.status==='archived'?'This product is archived.':'This product is published through the existing verified catalogue checks.'}</p>
   <details><summary>Why there is no Publish button yet</summary><ol className="aa-gap-list">{publicationBackendGaps.map(g=><li key={g}>{g}</li>)}</ol></details></section>
 </>;
 const reference=<details className="aa-record-reference"><summary>Record reference</summary><dl><dt>Product ID</dt><dd>{product.id}</dd><dt>URL slug</dt><dd>{product.slug}</dd><dt>Last updated</dt><dd><time dateTime={product.updated_at}>{new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'}).format(new Date(product.updated_at))}</time> (Dhaka)</dd></dl></details>;
 let body;
 if(intake){
  const skuBacked=variants.length>0;
  body=<GarmentWorkspace product={product} garment={intake} editable={editable&&!skuBacked} slots={{
   // Extra private photos are optional for garments; the original photograph is always shown.
   media:editable&&flag('STAGING_PRODUCT_GALLERY')?media:null,
   taxonomy,
   inventory:skuBacked?<section className="aa-panel"><h2>Linked SKU inventory</h2><p>This garment already has a SKU, so its draft facts are locked here and stock is recorded through the inventory ledger. The database refuses more than one unit for a physical garment.</p>{stockCards}</section>:<section className="aa-panel"><h2>Variants</h2><p>Single garments never get extra size or colour variants. The actual size above is the only size.</p></section>,
   review:<>{review}{reference}</>,
  }}/>;
 }else{
  const sizes=[...new Set(variants.map(v=>v.size))];
  const sections=[
   {id:'basics',label:'1. Basics',content:<>{editable&&flag('STAGING_GENERIC_DRAFT_EDITOR')?<BasicDraftEditor product={product}/>:<section className="aa-panel"><h2>Basic information</h2><p style={{whiteSpace:'pre-wrap'}}>{product.description||'No description yet.'}</p><p>{why}</p></section>}{reference}</>},
   {id:'media',label:'2. Media',content:media},
   {id:'taxonomy',label:'3. Category',content:taxonomy},
   {id:'size',label:'4. Sizes',content:<section className="aa-panel"><h2>Sizes</h2><p>Each size is recorded on its own SKU in Variants &amp; inventory, so sizes always match real stock.</p><dl className="aa-fact-grid"><div><dt>Sizes on SKUs</dt><dd>{sizes.join(', ')||'No SKUs yet'}</dd></div></dl></section>},
   {id:'variants',label:'5. Variants & stock',content:<>
    <section className="aa-panel"><div className="aa-section-heading"><div><h2>Variants &amp; inventory</h2><p>Each actual size and colour has its own SKU, price and stock. New SKUs start at zero; reserved units cannot be removed.</p></div><span className="aa-status">{variants.length}{hasMoreVariants?'+':''} SKUs</span></div>
    {variants.length?stockCards:<div className="aa-empty-state"><h3>No SKUs yet</h3><p>Add the actual sizes and colours you sell.</p></div>}
    {hasMoreVariants&&<p>Showing the first 100 SKUs.</p>}</section>
    {editable&&flag('STAGING_VARIANT_MANAGEMENT')&&<details className="aa-panel aa-add-variant"><summary>Add SKU variant</summary><VariantEditor target={product} newId={randomUUID()}/></details>}
   </>},
   {id:'attributes',label:'6. Attributes & SEO',content:<Unavailable title="Attributes & SEO">Standard products have no attribute or SEO storage in the database yet. Use Category &amp; taxonomy for brand, collections and tags. The URL slug is {product.slug}.</Unavailable>},
   {id:'review',label:'7. Review',content:review},
  ];
  body=<ProductWorkspace sections={sections}/>;
 }
 return <main id="main" className="aa-main aa-product-page"><Link className="aa-back-link" href="/admin/products/library">← All products</Link>
 <header className="aa-page-heading"><div><p className="aa-eyebrow">Catalog / {intake?'Physical garment '+intake.source_id:'Product'}</p><h1>{product.name}</h1></div><div className="aa-heading-actions"><span className={'aa-status aa-status-'+product.status}>{product.status}</span>{previewHref&&<Link className="aa-row-action" href={previewHref} target="_blank" rel="noopener noreferrer" prefetch={false}>Preview <ArrowUpRight size={14} aria-hidden="true"/></Link>}</div></header>
 {body}
 {canManage&&<aside className="aa-workspace-note"><Link href="/admin/audit">View activity log →</Link></aside>}</main>;
}
