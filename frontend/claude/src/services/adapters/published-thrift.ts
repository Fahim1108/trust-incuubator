import "server-only";
import { publicSupabaseConfiguration as config } from "@/lib/supabase-public";
import intake from "@/data/inventory/thrift-shirts.json";
import type {Product,Review} from '@/types';
async function read(path:string,method='GET'){const c=config();if(!c)return [];try{const r=await fetch(c.url+path,{method,headers:{apikey:c.key,...(c.key.startsWith('eyJ')?{Authorization:`Bearer ${c.key}`} : {}),'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)return [];const result:unknown=await r.json();return Array.isArray(result)?result:[];}catch{return [];}}
export async function publishedShirts():Promise<Product[]>{
 const rows=await read('/rest/v1/rpc/published_thrift_catalogue','POST');const result:Product[]=[];
 for(const row of rows){if(!row||typeof row!=='object')continue;const r:Record<string,unknown>=row;
 if(typeof r.id!=='string'||typeof r.variant_id!=='string'||typeof r.slug!=='string'||typeof r.name!=='string'||typeof r.size!=='string'||!r.size.trim()||r.size.toUpperCase()==='N/A'||typeof r.color!=='string'||typeof r.image_path!=='string'||!/^\/inventory\/thrift-shirts\/AA-SHIRT-\d{3}-front\.jpg$/.test(r.image_path)||typeof r.price_minor!=='number'||!Number.isSafeInteger(r.price_minor)||r.price_minor<0||typeof r.in_stock!=='boolean'||typeof r.created_at!=='string')continue;
 // Until generic media/publication management is verified, only the supplied
 // physical intake identities may be sold. QA/new arbitrary records fail closed.
 const source=intake.find(item=>item.source_id.toLowerCase()===r.slug);
 if(!source||source.image_path!==r.image_path||r.reviewOnly===true||r.is_test===true||
   (r.status!==undefined&&r.status!=='published')||
   !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id)||
   !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.variant_id)||
   !Number.isFinite(Date.parse(r.created_at))||['NA','UNKNOWN'].includes(r.size.trim().toUpperCase())||!r.color.trim())continue;
 const image={src:r.image_path,alt:r.name};const variant={id:r.variant_id,sku:typeof r.sku==='string'?r.sku:r.variant_id,size:r.size,colorId:'fixed',stock:r.in_stock?1:0};
 result.push({id:r.id,slug:r.slug,name:r.name,status:'published',apparelSizing:true,fixedVariantId:r.variant_id,categoryId:'cat-shirts',brandId:'',price:r.price_minor/100,colors:[{id:'fixed',name:r.color,hex:'#6B0202'}],sizes:[r.size],variants:[variant],imagesByColor:{fixed:[image]},defaultImages:[image],description:typeof r.description==='string'?r.description:'',shortDescription:'',details:[],badges:[],isNewArrival:false,isFeatured:false,isBestSeller:false,rating:{average:0,count:0},createdAt:r.created_at,tags:[],sizeGuideId:'tops'});
 }return result;
}
export async function approvedReviews(productId:string):Promise<Review[]>{
 const rows=await read('/rest/v1/product_reviews?select=id,rating,title,body,author_display_name,created_at&status=eq.approved&product_id=eq.'+encodeURIComponent(productId));
 return rows.flatMap(row=>{if(!row||typeof row!=='object')return [];const r:Record<string,unknown>=row;if(typeof r.id!=='string'||typeof r.rating!=='number'||r.rating<1||r.rating>5||typeof r.body!=='string'||typeof r.author_display_name!=='string'||typeof r.created_at!=='string')return [];return [{id:r.id,productId,author:r.author_display_name,rating:r.rating,title:typeof r.title==='string'?r.title:'',body:r.body,createdAt:r.created_at,verifiedPurchase:false}];});
}
