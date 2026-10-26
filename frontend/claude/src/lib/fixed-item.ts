import type {Product} from '@/types';
/** Publish one explicit physical SKU; never guess an actual size/color on ambiguous live data. */
export function fixedCustomerItem(product:Product):Product|null{
 const variant=product.fixedVariantId?product.variants.find(v=>v.id===product.fixedVariantId):product.variants.length===1?product.variants[0]:undefined;
 if(!variant)return null;
 const color=product.colors.find(c=>c.id===variant.colorId);if(!color)return null;
 return {...product,fixedVariantId:variant.id,sizeOptions:product.sizes,sizes:[variant.size],colors:[color],variants:[variant],price:variant.price??product.price};
}
