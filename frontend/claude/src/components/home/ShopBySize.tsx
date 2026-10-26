import Link from 'next/link';
import { APPAREL_SIZES,availableApparelSizes,publishedAvailable } from '@/lib/catalogue-dimensions';
import type {Product} from '@/types';
export function ShopBySize({products}:{products:Product[]}){
 const sizes=APPAREL_SIZES.filter(size=>products.some(p=>publishedAvailable(p)&&availableApparelSizes(p).includes(size)));
 return <section className="container" aria-label="Shop by Size"><h2 className="mb-3 font-display text-[22px] font-semibold sm:text-[26px]">Shop by Size</h2>
 {sizes.length?<ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">{sizes.map(size=><li key={size}><Link href={`/shop?sizes=${encodeURIComponent(size)}&available=1`} className="aa-press flex min-h-14 items-center justify-center rounded-lg border border-line bg-white px-2 text-sm font-semibold transition-colors hover:border-primary hover:bg-selected hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{size}</Link></li>)}</ul>:<p className="text-sm text-ink-muted">Sizes will appear when clothing is available.</p>}</section>;
}
