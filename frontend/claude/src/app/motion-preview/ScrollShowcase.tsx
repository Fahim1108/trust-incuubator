import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import {Reveal} from '@/components/ui/Reveal';
import styles from './ScrollShowcase.module.css';
export interface ShowcaseProduct {id:string;name:string;image:string;priceMinor:number}
function Photo({product,priority=false}:{product:ShowcaseProduct;priority?:boolean}){return <Image src={product.image} alt={product.name} fill sizes="(min-width: 1000px) 280px, 45vw" priority={priority} className={styles.productPhoto}/>;}
/** Quiet preview: photos/cards always static; only selected offscreen headings fade once. */
export function ScrollShowcase({products}:{products:ShowcaseProduct[]}){
 return <div className={styles.page}>
  <header className={styles.header}><Link href="/" aria-label="Back to Attires Arena storefront"><Image src="/brand/logo-maroon.png" alt="Attires Arena" width={72} height={70} priority className={styles.logo}/></Link><span className={styles.eyebrow}>The quiet edit</span><Link href="/" className={styles.back}>Back to store <ArrowUpRight size={15} aria-hidden/></Link></header>
  <main id="main" className={styles.main}>
   <div className={styles.intro}><p className={styles.eyebrow}>Attires Arena / Motion refinement</p><h1>Quiet by design.</h1><p>Typography, whitespace, original photography. Products stay in place; selected headings fade gently, once.</p><a href="#collection" className={styles.scroll}>Explore the collection</a></div>
   <section id="collection" className={styles.scene} aria-labelledby="collection-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>01 / Always accessible</p><Reveal><h2 id="collection-title">A collection that stays still.</h2></Reveal><p className={styles.muted}>No stagger, slide, fade-up or zoom. Every product is available as you scroll.</p></div></div>
    <div className={styles.products}>{products.map((product,index)=><article key={product.id} className={styles.card}><Link href={`/product/${product.id.toLowerCase()}`}><div className={styles.cardPhoto}><Photo product={product} priority={index<4}/></div><h3>{product.name}</h3><p className={styles.price}>৳{product.priceMinor/100}</p></Link></article>)}</div>
   </section>
   <section className={styles.scene} aria-labelledby="photo-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>02 / Original photographs</p><Reveal><h2 id="photo-title">Details without distraction.</h2></Reveal><p className={styles.muted}>The photographs and their proportions remain unchanged.</p></div></div><div className={styles.imagePair}>{products.slice(4,6).map(product=><figure key={product.id}><div className={styles.scaleFrame}><Photo product={product}/></div><figcaption>{product.name}</figcaption></figure>)}</div></section>
   <section className={styles.scene} aria-labelledby="heading-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>03 / A quieter rhythm</p><Reveal><h2 id="heading-title">Words with room to breathe.</h2></Reveal><p className={styles.muted}>A 350ms opacity fade for selected headings below the first screen. No movement, no replay while scrolling back.</p></div></div><div className={styles.headingStudies}>{['Style, elevated.','Less noise. More character.','Find your next favourite.'].map(heading=><Reveal key={heading}><h3>{heading}</h3></Reveal>)}</div></section>
   <footer className={styles.footer}><p>Products remain immediately accessible. Only selected headings fade once.</p><p>Reduced motion and JavaScript-free reading are supported.</p><div><Link href="/">View the refined storefront</Link><Link href="/motion-preview?lab=components">Earlier component lab</Link></div></footer>
  </main>
 </div>;
}
