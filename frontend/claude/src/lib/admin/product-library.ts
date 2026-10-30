import 'server-only';
import {notFound} from 'next/navigation';
import {staffSession} from './access';
import {isProductionStorefront} from '../storefront-policy';
import {productRecordSchema,variantRecordSchema,inventoryRecordSchema,libraryFilters,literalSearch,type LibraryParams} from './library-validation';
export async function librarySession(){
 if(isProductionStorefront())notFound();
 const session=await staffSession();
 if(!session.roles.some(r=>['owner','product_manager','order_manager','analyst'].includes(r)))notFound();
 return session;
}
export async function readProductLibrary(params:LibraryParams){
 const session=await librarySession();const filters=libraryFilters(params);
 let query=session.client.from('products').select('id,name,slug,description,status,category_id,created_at,updated_at',{count:'exact'});
 if(filters.q)query=query.ilike('name',literalSearch(filters.q));
 if(filters.status)query=query.eq('status',filters.status);
 const field=filters.sort==='name'?'name':filters.sort==='newest'?'created_at':'updated_at';
 const result=await query.order(field,{ascending:filters.sort==='name'}).order('id',{ascending:true}).range((filters.page-1)*24,filters.page*24-1);
 if(result.error)throw new Error('Product library could not be read. No changes were made.');
 return {items:productRecordSchema.array().parse(result.data),count:result.count||0,filters,canManage:session.roles.some(r=>r==='owner'||r==='product_manager')};
}
export async function readProductRecord(id:string){
 const session=await librarySession();
 if(!productRecordSchema.shape.id.safeParse(id).success)notFound();
 const product=await session.client.from('products').select('id,name,slug,description,status,category_id,created_at,updated_at').eq('id',id).maybeSingle();
 if(product.error)throw new Error('Product details could not be read.');
 if(!product.data)notFound();
 const variants=await session.client.from('product_variants').select('id,sku,size,color,price_minor,sale_price_minor,active').eq('product_id',id).order('created_at').limit(101);
 if(variants.error)throw new Error('Product variants could not be read.');
 const parsed=variantRecordSchema.array().parse(variants.data);
 const rows=parsed.slice(0,100);
 const inventory=rows.length?await session.client.from('inventory').select('variant_id,on_hand,reserved,available').in('variant_id',rows.map(v=>v.id)):null;
 if(inventory?.error)throw new Error('Product inventory could not be read.');
 const intake=await session.client.from('thrift_intake').select('source_id,actual_size,actual_color,size_verified,details_verified,price_minor,stock_quantity').eq('product_id',id).maybeSingle();
 if(intake.error)throw new Error('Product intake could not be read.');
 const {z}=await import('zod');
 const facts=z.object({source_id:z.string(),actual_size:z.string().nullable(),actual_color:z.string().nullable(),size_verified:z.boolean(),details_verified:z.boolean(),price_minor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),stock_quantity:z.number().int().nonnegative()}).nullable().parse(intake.data);
 return {product:productRecordSchema.parse(product.data),variants:rows,hasMoreVariants:parsed.length>100,inventory:inventoryRecordSchema.array().parse(inventory?.data||[]),intake:facts,canManage:session.roles.some(r=>r==='owner'||r==='product_manager')};
}
