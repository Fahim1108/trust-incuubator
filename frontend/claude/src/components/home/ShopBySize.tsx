import Link from 'next/link';
import {Reveal} from '@/components/ui/Reveal';
import {APPAREL_SIZES,availableApparelSizes,publishedAvailable} from '@/lib/catalogue-dimensions';
import type {Product} from '@/types';

export function ShopBySize({products}:{products:Product[]}) {
 const verified = products.filter(p=>!p.reviewOnly && publishedAvailable(p));
 const available = new Set(verified.flatMap(availableApparelSizes));
 const style='flex min-h-11 items-center justify-center rounded-lg border bg-white px-2 text-sm font-semibold';
 return <section className="container" aria-label="Shop by Size">
  <Reveal><h2 className="mb-3 font-display text-[22px] font-semibold sm:text-[26px]">Shop by Size</h2></Reveal>
  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">{APPAREL_SIZES.map(size=><li key={size}>
   {available.has(size)
    ? <Link href={`/shop?sizes=${encodeURIComponent(size)}&available=1`} className={`${style} aa-press border-line transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}>{size}</Link>
    : <span aria-disabled="true" aria-label={`${size}, no confirmed sizes in stock`} title="No confirmed sizes in stock" className={`${style} border-line text-ink-muted opacity-40`}>{size}</span>}
  </li>)}</ul>
 </section>;
}
