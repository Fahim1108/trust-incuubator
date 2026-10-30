import {z} from 'zod';
export const productRecordSchema=z.object({id:z.uuid(),name:z.string(),slug:z.string(),description:z.string(),status:z.enum(['draft','published','archived']),category_id:z.uuid().nullable(),created_at:z.iso.datetime({offset:true}),updated_at:z.iso.datetime({offset:true})});
export const variantRecordSchema=z.object({id:z.uuid(),sku:z.string(),size:z.string(),color:z.string(),price_minor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),sale_price_minor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),active:z.boolean()});
export const inventoryRecordSchema=z.object({variant_id:z.uuid(),on_hand:z.number().int().nonnegative(),reserved:z.number().int().nonnegative(),available:z.number().int().nonnegative()});
export type LibraryParams=Record<string,string|string[]|undefined>;
export function libraryFilters(params:LibraryParams){
 const text=(key:string)=>typeof params[key]==='string'?params[key]:'';
 const status=text('status');const sort=text('sort');const page=text('page');
 return {q:text('q').trim().slice(0,120),status:['draft','published','archived'].includes(status)?status:'',sort:['name','newest'].includes(sort)?sort:'updated',page:/^[1-9]\d{0,3}$/.test(page)?Number(page):1};
}
export function literalSearch(text:string){return '%'+text.replace(/[\\%_]/g,'\\$&')+'%';}
export function libraryLink(filters:ReturnType<typeof libraryFilters>,page=filters.page){
 const params=new URLSearchParams({q:filters.q,status:filters.status,sort:filters.sort,page:String(page)});
 return '/admin/products/library?'+params;
}
export function minorPrice(value:number){
 if(!Number.isSafeInteger(value)||value<0)throw new RangeError('Invalid price');
 const amount=BigInt(value);return '৳'+new Intl.NumberFormat('en-BD').format(amount/BigInt(100))+'.'+String(amount%BigInt(100)).padStart(2,'0');
}
