import type { Product } from '@/types';
export const APPAREL_SIZES=['S','M','L','XL','2XL','3XL','Over Size'] as const;
export type ApparelSize=typeof APPAREL_SIZES[number];
export function canonicalSize(value:string):ApparelSize|undefined {
 const normalized=value.trim().toLowerCase().replace(/[-_\s]+/g,' ');
 return ({s:'S',m:'M',l:'L',xl:'XL',xxl:'2XL','2xl':'2XL',xxxl:'3XL','3xl':'3XL','over size':'Over Size',oversize:'Over Size',oversized:'Over Size'} as Record<string,ApparelSize>)[normalized];
}
export const SHIRT_CLASSIFICATIONS=[
 ['pattern','solid','Solid'],['pattern','striped','Striped'],['pattern','checked','Checked / Plaid'],['pattern','printed','Printed'],
 ['occasion','formal','Formal'],['occasion','casual','Casual'],
 ['fabric','denim','Denim'],['fabric','oxford','Oxford'],['fabric','flannel','Flannel'],['fabric','linen','Linen'],
 ['design','overshirt','Overshirt'],['design','cuban-collar','Cuban Collar'],
 ['sleeve','short-sleeve','Short Sleeve'],['sleeve','long-sleeve','Long Sleeve'],
] as const;
export type ShirtDimension=typeof SHIRT_CLASSIFICATIONS[number][0];
export type ShirtClassification=typeof SHIRT_CLASSIFICATIONS[number][1];
export function publishedAvailable(p:Product){return p.status==='published'&&p.variants.some(v=>v.stock>0);}
export function availableApparelSizes(p:Product):ApparelSize[]{
 if(!p.apparelSizing)return [];
 return APPAREL_SIZES.filter(size=>p.variants.some(v=>v.stock>0&&canonicalSize(v.size)===size));
}
export function availableShirtTypes(products:Product[]){return SHIRT_CLASSIFICATIONS.filter(([dimension,value])=>products.some(p=>publishedAvailable(p)&&p.shirtAttributes?.[dimension]?.includes(value)));}
export function sameSizeRecommendations(product:Product,candidates:Product[],selectedSize?:string,limit=6){
 const target=selectedSize?canonicalSize(selectedSize):availableApparelSizes(product).length===1?availableApparelSizes(product)[0]:undefined;
 if(!target||!product.apparelSizing)return [];
 const seen=new Set([product.id]);
 return candidates.filter(p=>{if(seen.has(p.id)||!publishedAvailable(p)||!availableApparelSizes(p).includes(target))return false;seen.add(p.id);return true;})
 .sort((a,b)=>Number(b.categoryId===product.categoryId)-Number(a.categoryId===product.categoryId)).slice(0,limit);
}
