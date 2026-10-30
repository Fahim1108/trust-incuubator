import Link from 'next/link';
import {randomUUID} from 'node:crypto';
import {BasicDraftEditor} from '@/components/admin/access/BasicDraftEditor';
import {PrivateProductGallery} from '@/components/admin/access/PrivateProductGallery';
import {VariantEditor,StockEditor} from '@/components/admin/access/VariantEditor';
import {PrivateProductTaxonomy} from '@/components/admin/access/PrivateProductTaxonomy';
import {readProductRecord} from '@/lib/admin/product-library';
import {minorPrice} from '@/lib/admin/library-validation';
export default async function ProductRecord({params}:{params:Promise<{id:string}>}){
 const {product,variants,inventory,intake,hasMoreVariants,canManage}=await readProductRecord((await params).id);
 return <main id="main" className="aa-main"><Link href="/admin/products/library">← Product library</Link><h1>{product.name}</h1><span className="aa-status">{product.status}</span>
 <section className="aa-panel"><h2>Saved product details</h2><dl><dt>Product ID</dt><dd style={{overflowWrap:'anywhere'}}>{product.id}</dd><dt>Slug</dt><dd style={{overflowWrap:'anywhere'}}>{product.slug}</dd><dt>Description</dt><dd style={{whiteSpace:'pre-wrap'}}>{product.description||'Not recorded'}</dd><dt>Category ID</dt><dd style={{overflowWrap:'anywhere'}}>{product.category_id||'Not assigned'}</dd></dl></section>
 {!intake&&canManage&&product.status==='draft'&&(process.env.STAGING_GENERIC_DRAFT_EDITOR==='1'?<BasicDraftEditor key={product.updated_at} product={product}/>:<p>Draft detail editing awaits the approved Staging migration. Saved product details remain readable.</p>)}
 {canManage&&product.status==='draft'&&process.env.STAGING_CATALOGUE_TAXONOMY==='1'&&<PrivateProductTaxonomy product={product}/>}
 {canManage&&product.status==='draft'&&process.env.STAGING_PRODUCT_GALLERY==='1'&&<PrivateProductGallery id={product.id} updated_at={product.updated_at}/>}
 {intake&&<section className="aa-panel"><h2>Physical garment intake</h2><dl><dt>Source</dt><dd>{intake.source_id}</dd><dt>Recorded size</dt><dd>{intake.actual_size||'Awaiting physical measurement'}</dd><dt>Recorded color</dt><dd>{intake.actual_color||'Not recorded'}</dd><dt>Recorded price</dt><dd>{minorPrice(intake.price_minor)}</dd><dt>Physical quantity</dt><dd>{intake.stock_quantity}</dd><dt>Size verified</dt><dd>{intake.size_verified?'Yes':'No'}</dd><dt>Details verified</dt><dd>{intake.details_verified?'Yes':'No'}</dd></dl><Link href={'/admin/products?review='+encodeURIComponent(intake.source_id)}>{canManage?'Edit garment draft':'View garment draft'}</Link></section>}
 <section className="aa-panel"><h2>Variants and inventory</h2>{variants.length?variants.map(v=>{const stock=inventory.find(i=>i.variant_id===v.id);return <article key={v.id}><h3>{v.sku}</h3><p>{v.size} · {v.color} · {v.active?'Active':'Inactive'}</p><p>Regular: {minorPrice(v.price_minor)}{v.sale_price_minor!==null&&<> · Sale: {minorPrice(v.sale_price_minor)}</>}</p>{stock?<p>On hand: {stock.on_hand} · Reserved: {stock.reserved} · Available: {stock.available}</p>:<p>No inventory record</p>}</article>;}):<p>No SKU variants configured. No size, price or sellable inventory has been invented.</p>}{hasMoreVariants&&<p>Showing the first 100 variants.</p>}</section>
 {canManage&&process.env.STAGING_VARIANT_MANAGEMENT==='1'&&<section className="aa-panel"><h2>Manage SKUs and stock</h2>{!intake&&product.status==='draft'&&<><VariantEditor target={product} newId={randomUUID()}/>{variants.map(v=><VariantEditor key={v.id} target={product} variant={v}/>)}</>}{variants.map(v=><section className="aa-panel" key={v.id}><h3>Adjust stock: {v.sku}</h3><StockEditor target={product} variantId={v.id}/></section>)}</section>}
 {!intake&&<p>Verified publication for this draft remains a separate workflow.</p>}
 </main>;
}
