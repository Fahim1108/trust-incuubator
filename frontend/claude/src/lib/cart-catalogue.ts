import type { CartItem, Product } from '@/types';
/** Persist identifiers/quantity only in spirit: rebuild every display field from the public catalogue. */
export function reconcileCartLines(stored: unknown, products: Product[]): CartItem[] {
 if(!Array.isArray(stored))return [];
 const result:CartItem[]=[];
 for(const value of stored){
  if(!value||typeof value!=='object'||!('variantId' in value)||!('quantity' in value)||
    typeof value.variantId!=='string'||typeof value.quantity!=='number'||!Number.isSafeInteger(value.quantity)||value.quantity<1)continue;
  const product=products.find(p=>p.variants.some(v=>v.id===value.variantId&&v.stock>0));
  const variant=product?.variants.find(v=>v.id===value.variantId&&v.stock>0);
  if(!product||!variant||result.some(i=>i.variantId===variant.id))continue;
  const image=product.imagesByColor[variant.colorId]?.[0]??product.defaultImages[0];
  if(!image)continue;
  result.push({id:`${product.id}:${variant.id}`,productId:product.id,productSlug:product.slug,
   variantId:variant.id,name:product.name,brandName:'',image,colorName:product.colors.find(c=>c.id===variant.colorId)?.name??'',
   size:variant.size,unitPrice:variant.price??product.price,compareAtPrice:product.compareAtPrice,
   quantity:Math.min(value.quantity,variant.stock),maxQuantity:variant.stock});
 }return result;
}
