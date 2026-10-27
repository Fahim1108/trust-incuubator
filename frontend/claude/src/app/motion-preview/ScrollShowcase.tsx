'use client';

import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight,RotateCcw} from 'lucide-react';
import styles from './ScrollShowcase.module.css';

export interface ShowcaseProduct {id:string;name:string;image:string;priceMinor:number}
type Option='A'|'B'|'C';
type Kind='heading'|'section'|'image';
const options=[
 {id:'A',name:'Soft Editorial',description:'Minimal heading fades and soft editorial transitions. The product grid stays static.'},
 {id:'B',name:'Luxury Motion',description:'A refined editorial entrance and a very subtle photograph reveal. No staggered cards.'},
 {id:'C',name:'Ultra Minimal',description:'An almost static layout. Only the controls respond to hover and press.'},
] as const;

/** Preview-local enhancement. Never imported by storefront UI or global styles. */
function PreviewReveal({option,kind,revision,children,className=''}:{option:Option;kind:Kind;revision:number;children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let animation:Animation|undefined;let canceled=false;
  const visible=()=>{canceled=true;observer?.disconnect();animation?.cancel();el.dataset.previewState='static';};
  el.dataset.previewState='static';
  if(option==='C'||media.matches||(kind==='image'&&option!=='B')||!el.animate||!('IntersectionObserver' in window))return;
  if(revision===0&&el.getBoundingClientRect().top<innerHeight)return;
  el.dataset.previewState='waiting';
  const observer=new IntersectionObserver(entries=>{
   if(canceled||!entries.some(entry=>entry.isIntersecting))return;
   observer?.disconnect();
   if(media.matches||el.contains(document.activeElement)){visible();return;}
   const duration=option==='A'?(kind==='heading'?350:450):(kind==='heading'?420:500);
   const opacity=kind==='image'?.82:kind==='heading'?.55:.78;
   const distance=option==='B'&&kind!=='image'?(kind==='heading'?2:4):0;
   animation=el.animate([{opacity,transform:`translateY(${distance}px)`},{opacity:1,transform:'none'}],{duration,easing:'cubic-bezier(.22,1,.36,1)'});
   el.dataset.previewState='animating';
   animation.onfinish=()=>{el.dataset.previewState='complete';};
  },{threshold:.08});
  observer.observe(el);
  const reduce=()=>{if(media.matches)visible();};
  media.addEventListener('change',reduce);el.addEventListener('focusin',visible);
  return()=>{visible();media.removeEventListener('change',reduce);el.removeEventListener('focusin',visible);};
 },[option,kind,revision]);
 return <div ref={ref} className={className} data-showcase-kind={kind} data-showcase-option={option} data-preview-state="ready">{children}</div>;
}

function Photo({product,priority=false}:{product:ShowcaseProduct;priority?:boolean}){return <Image src={product.image} alt={product.name} fill sizes="(min-width: 1000px) 280px, 45vw" priority={priority} className={styles.productPhoto}/>;}
export function ScrollShowcase({products}:{products:ShowcaseProduct[]}){
 const [option,setOption]=useState<Option>('A');const [revision,setRevision]=useState(0);const [message,setMessage]=useState('');
 const selected=options.find(item=>item.id===option)!;const first=products[0];
 if(!first)return <main id="main" className={styles.main}><h1>No collection photos available</h1></main>;
 const reveal=(kind:Kind,children:ReactNode,className='')=><PreviewReveal option={option} kind={kind} revision={revision} className={className}>{children}</PreviewReveal>;
 return <div className={styles.page}>
  <header className={styles.header}><Link href="/" aria-label="Back to Attires Arena storefront"><Image src="/brand/logo-maroon.png" alt="Attires Arena" width={72} height={70} priority className={styles.logo}/></Link><span className={styles.eyebrow}>The motion atelier</span><Link href="/" className={styles.back}>Back to store <ArrowUpRight size={15} aria-hidden/></Link></header>
  <main id="main" className={styles.main}>
   <div className={styles.intro}><p className={styles.eyebrow}>Attires Arena / Isolated style study</p><h1>Find your rhythm.</h1><p>Three quiet directions, one collection. Choose a style, scroll naturally, and replay the visible scenes.</p><a href="#editorial" className={styles.scroll}>Explore the study</a></div>
   <div className={styles.controls} aria-label="Showcase controls"><div className={styles.switch} role="group" aria-label="Choose animation option">{options.map(item=><button type="button" key={item.id} aria-label={`Option ${item.id} — ${item.name}`} aria-pressed={option===item.id} onClick={()=>{setOption(item.id);setRevision(v=>v+1);setMessage(`Option ${item.id}, ${item.name}, selected. Scroll to compare.`);}}><span>{item.id}</span> {item.name}</button>)}</div><button type="button" className={styles.replay} onClick={()=>{setRevision(v=>v+1);setMessage(option==='C'?'Ultra Minimal stays static. Controls remain interactive.':'Visible scenes replayed. Scroll to reveal the others.');}}><RotateCcw size={15} aria-hidden/> Replay</button></div>
   <p role="status" className={styles.status}>{message}</p><p className={styles.styleNote}>{selected.description}</p>
   <section id="editorial" className={styles.scene} aria-labelledby="editorial-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>01 / Editorial moment</p>{reveal('heading',<h2 id="editorial-title">Considered pieces. Effortless presence.</h2>)}<p className={styles.muted}>The motion here belongs only to this preview.</p></div></div>
    <div className={styles.editorial}>{reveal('section',<div className={styles.editorialCopy}><p className={styles.eyebrow}>One piece. Its own character.</p><h3>Style, elevated.</h3><p>Original thrift shirts from the Attires Arena collection. Whitespace and photography set the pace.</p><Link href="/category/shirts" className={styles.textLink}>Explore the shirts <ArrowUpRight size={16} aria-hidden/></Link></div>)}{reveal('image',<Photo product={first} priority/>,styles.editorialImage)}</div>
   </section>
   <section id="collection" className={styles.scene} aria-labelledby="collection-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>02 / Always accessible</p>{reveal('heading',<h2 id="collection-title">The collection, without the stagger.</h2>)}<p className={styles.muted}>Product cards remain static in A, B and C.</p></div></div><div className={styles.products} data-showcase-grid>{products.map((product,index)=><article key={product.id} className={styles.card} data-showcase-product><Link href={`/product/${product.id.toLowerCase()}`}><div className={styles.cardPhoto}><Photo product={product} priority={index<4}/></div><h3>{product.name}</h3><p className={styles.price}>৳{product.priceMinor/100}</p></Link></article>)}</div></section>
   <section id="details" className={styles.scene} aria-labelledby="details-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>03 / Photography first</p>{reveal('heading',<h2 id="details-title">Details with room to breathe.</h2>)}<p className={styles.muted}>Only B adds a restrained opacity reveal to these photographs. A and C keep them still.</p></div></div><div className={styles.imagePair}>{products.slice(4,6).map(product=><figure key={product.id}><PreviewReveal option={option} kind="image" revision={revision} className={styles.scaleFrame}><Photo product={product}/></PreviewReveal><figcaption>{product.name}</figcaption></figure>)}</div></section>
   <section id="type-study" className={styles.scene} aria-labelledby="type-title"><div className={styles.sectionTop}><div><p className={styles.eyebrow}>04 / Typography</p>{reveal('heading',<h2 id="type-title">A quieter point of view.</h2>)}</div></div><div className={styles.headingStudies}>{['Less noise. More character.','Find your next favourite.'].map(text=><PreviewReveal key={text} option={option} kind="heading" revision={revision}><h3>{text}</h3></PreviewReveal>)}</div></section>
   <footer className={styles.footer}><p>Showcase only. Main storefront motion has been restored and is independent of these options.</p><p>Reduced motion is respected. Content stays readable without JavaScript.</p><div><Link href="/">Back to storefront</Link><Link href="/motion-preview?lab=components">Earlier component lab</Link></div></footer>
  </main>
 </div>;
}
