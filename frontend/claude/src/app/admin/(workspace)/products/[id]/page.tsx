import Link from 'next/link';
import {randomUUID} from 'node:crypto';
import {BasicDraftEditor} from '@/components/admin/access/BasicDraftEditor';
import {PrivateProductGallery} from '@/components/admin/access/PrivateProductGallery';
import {VariantEditor,StockEditor} from '@/components/admin/access/VariantEditor';
import {PrivateProductTaxonomy} from '@/components/admin/access/PrivateProductTaxonomy';
import {ProductWorkspace} from '@/components/admin/access/ProductWorkspace';
import {readProductRecord} from '@/lib/admin/product-library';
import {minorPrice} from '@/lib/admin/library-validation';
export default async function ProductRecord({params}:{params:Promise<{id:string}>}){
 const {product,variants,inventory,intake,hasMoreVariants,canManage}=await readProductRecord((await params).id);
 const editable=canManage&&product.status==='draft';
 const sections=[{id:'details',label:'Details',content:<>
  {!intake&&editable&&process.env.STAGING_GENERIC_DRAFT_EDITOR==='1'&&<BasicDraftEditor product={product}/>}
  <section className="aa-panel"><h2>Product information</h2><p style={{whiteSpace:'pre-wrap'}}>{product.description||'Add a description to introduce this product.'}</p>
  <details className="aa-record-reference"><summary>Record reference</summary><dl><dt>Product ID</dt><dd>{product.id}</dd><dt>URL slug</dt><dd>{product.slug}</dd><dt>Category reference</dt><dd>{product.category_id||'Not assigned'}</dd></dl></details></section>
  {intake&&<section className="aa-panel"><h2>Garment verification</h2><dl className="aa-fact-grid"><div><dt>Size</dt><dd>{intake.actual_size||'Awaiting measurement'}</dd></div><div><dt>Color</dt><dd>{intake.actual_color||'Not recorded'}</dd></div><div><dt>Price</dt><dd>{minorPrice(intake.price_minor)}</dd></div><div><dt>Physical quantity</dt><dd>{intake.stock_quantity}</dd></div><div><dt>Size verified</dt><dd>{intake.size_verified?'Yes':'No'}</dd></div><div><dt>Details verified</dt><dd>{intake.details_verified?'Yes':'No'}</dd></div></dl><Link className="aa-button" href={'/admin/products?review='+encodeURIComponent(intake.source_id)}>{canManage?'Edit garment draft':'View garment draft'}</Link></section>}
 </>}];
 if(editable&&process.env.STAGING_PRODUCT_GALLERY==='1')sections.push({id:'images',label:'Images',content:<PrivateProductGallery id={product.id} updated_at={product.updated_at}/>});
 if(editable&&process.env.STAGING_CATALOGUE_TAXONOMY==='1')sections.push({id:'organization',label:'Organization',content:<PrivateProductTaxonomy product={product}/>});
 sections.push({id:'variants',label:'Variants',content:<>
  <section className="aa-panel"><div className="aa-section-heading"><div><h2>Variants and pricing</h2><p>Each actual size and color has its own SKU and price.</p></div><span className="aa-status">{variants.length}{hasMoreVariants?'+':''} SKUs</span></div>
  {variants.length?<div className="aa-variant-cards">{variants.map(v=><article className="aa-variant-card" key={v.id}><div className="aa-section-heading"><h3>{v.sku}</h3><span className="aa-status">{v.active?'Active':'Inactive'}</span></div><p>{v.size} · {v.color}</p><p>Regular: {minorPrice(v.price_minor)}{v.sale_price_minor!==null&&<> · Sale: {minorPrice(v.sale_price_minor)}</>}</p>
   {!intake&&editable&&process.env.STAGING_VARIANT_MANAGEMENT==='1'&&<details><summary>Edit variant</summary><VariantEditor target={product} variant={v}/></details>}
  </article>)}</div>:<div className="aa-empty-state"><h3>No variants yet</h3><p>Add the actual sizes and colors you sell. New SKUs start at zero stock.</p></div>}
  {hasMoreVariants&&<p>Showing the first 100 variants.</p>}</section>
  {!intake&&editable&&process.env.STAGING_VARIANT_MANAGEMENT==='1'&&<details className="aa-panel aa-add-variant"><summary>Add SKU variant</summary><VariantEditor target={product} newId={randomUUID()}/></details>}
 </>});
 sections.push({id:'stock',label:'Stock',content:<section className="aa-panel"><h2>Inventory</h2><p>Record physical changes with a reason. Reserved units cannot be removed from stock.</p>
  {variants.length?variants.map(v=>{const stock=inventory.find(i=>i.variant_id===v.id);return <article className="aa-variant-card" key={v.id}><h3>{v.sku}</h3><p>{v.size} · {v.color}</p>{stock?<><div className="aa-stock-counts"><div><span>On hand</span><strong>{stock.on_hand}</strong></div><div><span>Reserved</span><strong>{stock.reserved}</strong></div><div><span>Available</span><strong>{stock.available}</strong></div></div><p className="aa-stock-sentence">On hand: {stock.on_hand} · Reserved: {stock.reserved} · Available: {stock.available}</p></>:<p>No inventory record</p>}
   {canManage&&process.env.STAGING_VARIANT_MANAGEMENT==='1'&&<details><summary>Adjust stock: {v.sku}</summary><StockEditor target={product} variantId={v.id}/></details>}
  </article>;}):<div className="aa-empty-state"><h3>Set up a SKU first</h3><p>Stock is tracked per variant, never as an unrelated parent-product quantity.</p></div>}
 </section>});
 return <main id="main" className="aa-main aa-product-page"><Link className="aa-back-link" href="/admin/products/library">← All products</Link><header className="aa-page-heading"><div><p className="aa-eyebrow">Catalog / {intake?'Physical garment':'Product'}</p><h1>{product.name}</h1></div><span className={'aa-status aa-status-'+product.status}>{product.status}</span></header>
 <ProductWorkspace sections={sections}/>
 <aside className="aa-workspace-note"><strong>Storefront visibility</strong><p>{product.status==='draft'?'This product is a draft. Editing or uploading images does not publish it.':product.status==='archived'?'This product is archived.':'Published visibility is controlled by the existing catalogue checks.'}</p>{canManage&&<Link href="/admin/audit">View activity log →</Link>}</aside></main>;
}
