import {z} from 'zod';
export const libraryVariant=z.object({price_minor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),sale_price_minor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),inventory:z.object({available:z.number().int().nonnegative()}).nullable()});
export function summarizeVariants(variants:z.infer<typeof libraryVariant>[]){
 const truncated=variants.length>100;
 const prices=variants.map(v=>v.sale_price_minor??v.price_minor);
 const total=variants.reduce((sum,v)=>sum+(v.inventory?.available??0),0);
 return {skuCount:Math.min(variants.length,100),truncated,
  priceMin:!truncated&&prices.length?Math.min(...prices):null,
  priceMax:!truncated&&prices.length?Math.max(...prices):null,
  available:!truncated&&variants.length&&variants.every(v=>v.inventory!==null)&&Number.isSafeInteger(total)?total:null};
}
