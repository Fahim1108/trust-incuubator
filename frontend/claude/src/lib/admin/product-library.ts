import 'server-only';
import {notFound} from 'next/navigation';
import {staffSession} from './access';
import {isProductionStorefront,reviewInventoryEnabled} from '../storefront-policy';
import {productRecordSchema,variantRecordSchema,inventoryRecordSchema,libraryFilters,literalSearch,type LibraryParams} from './library-validation';
import {libraryVariant,summarizeVariants} from './product-summary';
import {garmentReadiness,standardReadiness,missingLabels} from './product-readiness';
import {z} from 'zod';
export async function librarySession(){
 if(isProductionStorefront())notFound();
 const session=await staffSession();
 if(!session.roles.some(r=>['owner','product_manager','order_manager','analyst'].includes(r)))notFound();
 return session;
}
const price=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const inches=z.number().positive().max(100).nullable();
/** Physical thrift intake facts. Existing imported garments keep these as their source of truth. */
export const garmentSchema=z.object({
 source_id:z.string(),image_path:z.string().regex(/^\/inventory\/thrift-shirts\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/),actual_size:z.string().nullable(),actual_color:z.string().nullable(),
 chest_inches:inches,length_inches:inches,condition:z.string().nullable(),
 price_minor:price,stock_quantity:z.number().int().min(0).max(1),size_verified:z.boolean(),details_verified:z.boolean(),
});
const garmentDetailSchema=garmentSchema.extend({attributes:z.array(z.string()),seo_title:z.string().nullable(),seo_description:z.string().nullable()});
/** PostgREST returns a one-to-one embed as an object; tolerate an array shape as well. */
const toOne=<T extends z.ZodType>(schema:T)=>z.union([schema,z.array(schema).max(1)]).nullable().optional().transform(v=>(Array.isArray(v)?v[0]??null:v??null) as z.infer<T>|null);
const garmentColumns='source_id,image_path,actual_size,actual_color,chest_inches,length_inches,condition,price_minor,stock_quantity,size_verified,details_verified';
const searchLimit=100;
/** Match product names, imported garment IDs and SKUs using parameterised literal searches. */
async function searchScope(client:Awaited<ReturnType<typeof staffSession>>['client'],q:string){
 const pattern=literalSearch(q);
 const [byName,bySource,bySku]=await Promise.all([
  client.from('products').select('id').ilike('name',pattern).limit(searchLimit),
  client.from('thrift_intake').select('product_id').ilike('source_id',pattern).limit(searchLimit),
  client.from('product_variants').select('product_id').ilike('sku',pattern).limit(searchLimit),
 ]);
 if(byName.error||bySource.error||bySku.error)throw new Error('Product search could not be completed. No changes were made.');
 const id=z.object({id:z.uuid()}),productId=z.object({product_id:z.uuid()});
 const ids=new Set([...id.array().parse(byName.data).map(r=>r.id),...productId.array().parse(bySource.data).map(r=>r.product_id),...productId.array().parse(bySku.data).map(r=>r.product_id)]);
 const narrowed=[byName.data,bySource.data,bySku.data].some(rows=>rows.length>=searchLimit);
 return {ids:[...ids].slice(0,150),narrowed:narrowed||ids.size>150};
}
export async function readProductLibrary(params:LibraryParams){
 const session=await librarySession();const filters=libraryFilters(params);
 const imagesEnabled=process.env.STAGING_PRODUCT_GALLERY==='1';
 const scope=filters.q?await searchScope(session.client,filters.q):null;
 const canManage=session.roles.some(r=>r==='owner'||r==='product_manager');
 const empty={items:[],count:0,filters,narrowed:scope?.narrowed||false,canManage};
 if(scope&&!scope.ids.length)return empty;
 const garmentEmbed=(filters.type==='garment'||filters.type==='attention'?'thrift_intake!inner':'thrift_intake')+'('+garmentColumns+')';
 let query=session.client.from('products').select('id,name,slug,description,status,category_id,created_at,updated_at,categories(name),'+garmentEmbed+',product_variants(sku,size,active,price_minor,sale_price_minor,inventory(available))'+(imagesEnabled?',product_media(storage_path,alt_text,position)':''),{count:'exact'}).limit(101,{referencedTable:'product_variants'});
 if(imagesEnabled)query=query.order('position',{referencedTable:'product_media'}).limit(1,{referencedTable:'product_media'});
 if(scope)query=query.in('id',scope.ids);
 if(filters.status)query=query.eq('status',filters.status);
 if(filters.type==='standard')query=query.is('thrift_intake',null);
 // Garments still missing facts that staff can record (verification has no staff workflow yet).
 if(filters.type==='attention')query=query.or('actual_size.is.null,actual_color.is.null,chest_inches.is.null,length_inches.is.null,condition.is.null,price_minor.eq.0',{referencedTable:'thrift_intake'});
 const field=filters.sort==='name'?'name':filters.sort==='newest'?'created_at':'updated_at';
 const result=await query.order(field,{ascending:filters.sort==='name'}).order('id',{ascending:true}).range((filters.page-1)*24,filters.page*24-1);
 if(result.error)throw new Error('Product library could not be read. No changes were made.');
 const rows=productRecordSchema.extend({
  categories:toOne(z.object({name:z.string()})),
  thrift_intake:toOne(garmentSchema),
  product_variants:libraryVariant.extend({sku:z.string(),size:z.string(),active:z.boolean()}).array(),
  product_media:z.array(z.object({storage_path:z.string(),alt_text:z.string(),position:z.number().int()})).optional(),
 }).array().parse(result.data);
 // Draft previews render only for verified Owner/Product Manager sessions, so do not offer them to read-only roles.
 const preview=canManage&&reviewInventoryEnabled();
 const items=await Promise.all(rows.map(async row=>{
  const media=row.product_media?.[0];let coverUrl:string|null=null;
  if(media){const signed=await session.client.storage.from('attires-product-drafts').createSignedUrl(media.storage_path,120);if(!signed.error)coverUrl=signed.data.signedUrl;}
  const garment=row.thrift_intake;
  const summary=summarizeVariants(row.product_variants);
  const variants=row.product_variants.slice(0,100);
  const sizes=[...new Set(variants.map(v=>v.size))];
  const checks=garment?garmentReadiness(row,garment):standardReadiness(row,{description:row.description,categoryAssigned:Boolean(row.category_id),imageCount:imagesEnabled?(row.product_media?.length??0):null,variants,available:summary.available});
  return {
   id:row.id,name:row.name,slug:row.slug,status:row.status,updated_at:row.updated_at,
   kind:garment?'garment' as const:'standard' as const,
   reference:garment?garment.source_id:variants[0]?variants[0].sku+(variants.length>1?' +'+(variants.length-1):''):null,
   category:row.categories?.name??null,
   size:garment?garment.actual_size:sizes.length?sizes.slice(0,4).join(', ')+(sizes.length>4?' +'+(sizes.length-4):''):null,
   priceMin:garment?garment.price_minor:summary.priceMin,priceMax:garment?garment.price_minor:summary.priceMax,
   stock:garment?garment.stock_quantity:summary.available,skuCount:summary.skuCount,truncated:summary.truncated,
   missing:missingLabels(checks).filter(label=>label!=='Verification'),
   // Original intake photographs are existing public storefront assets; gallery covers are short-lived signed URLs.
   coverUrl:coverUrl??garment?.image_path??null,coverAlt:media?.alt_text||row.name,
   previewHref:garment&&(row.status==='published'||(preview&&row.status==='draft'))?'/product/'+encodeURIComponent(row.slug):null,
  };
 }));
 return {...empty,items,count:result.count||0};
}
export async function readProductRecord(id:string){
 const session=await librarySession();
 if(!productRecordSchema.shape.id.safeParse(id).success)notFound();
 const product=await session.client.from('products').select('id,name,slug,description,status,category_id,created_at,updated_at,categories(name)').eq('id',id).maybeSingle();
 if(product.error)throw new Error('Product details could not be read.');
 if(!product.data)notFound();
 const variants=await session.client.from('product_variants').select('id,sku,size,color,price_minor,sale_price_minor,active').eq('product_id',id).order('created_at').limit(101);
 if(variants.error)throw new Error('Product variants could not be read.');
 const parsed=variantRecordSchema.array().parse(variants.data);
 const rows=parsed.slice(0,100);
 const inventory=rows.length?await session.client.from('inventory').select('variant_id,on_hand,reserved,available').in('variant_id',rows.map(v=>v.id)):null;
 if(inventory?.error)throw new Error('Product inventory could not be read.');
 const intake=await session.client.from('thrift_intake').select(garmentColumns+',attributes,seo_title,seo_description').eq('product_id',id).maybeSingle();
 if(intake.error)throw new Error('Product intake could not be read.');
 const record=productRecordSchema.extend({categories:toOne(z.object({name:z.string()}))}).parse(product.data);
 const {categories,...base}=record;
 return {product:base,categoryName:categories?.name??null,variants:rows,hasMoreVariants:parsed.length>100,inventory:inventoryRecordSchema.array().parse(inventory?.data||[]),intake:garmentDetailSchema.nullable().parse(intake.data),canManage:session.roles.some(r=>r==='owner'||r==='product_manager')};
}
export type GarmentRecord=z.infer<typeof garmentDetailSchema>;
/** Read-only taxonomy names for staff who cannot (or may not yet) edit assignments. */
export async function readProductTerms(id:string){
 const session=await librarySession();
 if(process.env.STAGING_CATALOGUE_TAXONOMY!=='1')return null;
 const result=await session.client.from('product_catalogue_terms').select('catalogue_terms(name,kind)').eq('product_id',id).limit(41);
 if(result.error)throw new Error('Product taxonomy could not be read.');
 return z.array(z.object({catalogue_terms:toOne(z.object({name:z.string(),kind:z.enum(['brand','collection','tag'])}))})).parse(result.data).flatMap(r=>r.catalogue_terms?[r.catalogue_terms]:[]);
}
/** Count only; private gallery paths and signed URLs are not exposed here. */
export async function countProductImages(id:string){
 if(process.env.STAGING_PRODUCT_GALLERY!=='1')return null;
 const session=await librarySession();
 const result=await session.client.from('product_media').select('id',{count:'exact',head:true}).eq('product_id',id);
 if(result.error)throw new Error('Product gallery could not be read.');
 return result.count??0;
}
