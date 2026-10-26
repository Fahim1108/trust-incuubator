import {availableApparelSizes,canonicalSize} from '@/lib/catalogue-dimensions';
import type {Product} from '@/types';
export function ProductSizeBadge({product,selectedSize}:{product:Product;selectedSize?:string}){
 if(product.reviewOnly && product.displaySizeEstimate) return <span data-product-size-badge title="Layout estimate only; actual size awaits confirmation" aria-label={`${product.displaySizeEstimate}, estimated size; awaiting confirmation`} className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white">{product.displaySizeEstimate}</span>;
 const sizes=availableApparelSizes(product);if(!sizes.length)return null;
 const selected=selectedSize?canonicalSize(selectedSize):undefined;
 const label=selected&&sizes.includes(selected)?selected:sizes.length===1?sizes[0]:`${sizes.length} sizes`;
 return <span data-product-size-badge title={sizes.join(', ')} aria-label={`Available size${sizes.length>1?'s':''}: ${sizes.join(', ')}`} className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-white/50 bg-[#800020] px-2 text-[11px] font-bold text-white shadow-sm sm:min-h-8 sm:min-w-8 sm:px-2.5 sm:text-xs">{label}</span>;
}
