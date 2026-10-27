'use client';

import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowDown,ArrowUpRight,RotateCcw} from 'lucide-react';
import styles from './ScrollShowcase.module.css';

type Style='elegant'|'minimal';
type Kind='section'|'card'|'image'|'heading';
export interface ShowcaseProduct {id:string;name:string;image:string;priceMinor:number}
const timing={elegant:{duration:780,distance:24,stagger:85,scale:1.055},minimal:{duration:380,distance:9,stagger:40,scale:1.018}};

/** Progressive enhancement: SSR/CSS never hide content. Motion changes no layout metrics. */
function Reveal({children,mode,kind='section',cycle,index=0,className=''}:{children:ReactNode;mode:Style;kind?:Kind;cycle:string;index?:number;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const node=ref.current;if(!node)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let animation:Animation|undefined,observer:IntersectionObserver|undefined;
  const show=()=>{observer?.disconnect();animation?.cancel();node.dataset.motionState=media.matches?'reduced':'complete';};
  const setup=()=>{
   show();
   if(media.matches||!node.animate||!('IntersectionObserver' in window))return;
   node.dataset.motionState='waiting';
   observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    observer?.disconnect();
    if(media.matches||node.contains(document.activeElement)){show();return;}
    const config=timing[mode];
    const from=kind==='image'?{opacity:.72,transform:`scale(${config.scale})`}:{opacity:0,transform:`translateY(${kind==='heading'?config.distance*.45:config.distance}px)`};
    animation=node.animate([from,{opacity:1,transform:'none'}],{duration:kind==='heading'?config.duration*.8:config.duration,delay:kind==='card'?(index%4)*config.stagger:0,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    node.dataset.motionState='animating';
    animation.onfinish=()=>{node.dataset.motionState='complete';};
   },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
   observer.observe(node);
  };
  setup();media.addEventListener('change',setup);node.addEventListener('focusin',show);
  return()=>{show();media.removeEventListener('change',setup);node.removeEventListener('focusin',show);};
 },[mode,kind,cycle,index]);
 return <div ref={ref} className={className} data-motion-kind={kind} data-motion-style={mode} data-motion-state="ready">{children}</div>;
}

function Scene({id,number,title,description,children,onReplay}:{id:string;number:string;title:string;description:string;children:(cycle:string)=>ReactNode;onReplay:()=>void}){
 const [revision,setRevision]=useState(0);
 return <section id={id} className={styles.scene} aria-labelledby={`${id}-heading`}>
  <div className={styles.sectionTop}><div><p className={styles.eyebrow}>{number} / Motion study</p><h2 id={`${id}-heading`}>{title}</h2><p className={styles.muted}>{description}</p></div><button className={styles.replay} onClick={()=>{setRevision(v=>v+1);onReplay();requestAnimationFrame(()=>document.getElementById(id)?.querySelector('[data-motion-kind]')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));}} aria-label={`Replay ${title}`}><RotateCcw size={15} aria-hidden/> Replay</button></div>
  {children(String(revision))}
 </section>;
}

function ProductPhoto({product,priority=false}:{product:ShowcaseProduct;priority?:boolean}){
 return <Image src={product.image} alt={product.name} fill sizes="(min-width: 1000px) 280px, 45vw" priority={priority} className={styles.productPhoto}/>;
}

export function ScrollShowcase({products}:{products:ShowcaseProduct[]}){
 const [mode,setMode]=useState<Style>('elegant');const [revision,setRevision]=useState(0);const [status,setStatus]=useState('');
 const cycle=String(revision);const announce=()=>setStatus('Replaying this scene. Scroll to experience the reveal.');
 const first=products[0];if(!first)return <main id="main" className={styles.page}><h1>Motion preview unavailable</h1><Link href="/">Back to storefront</Link></main>;
 return <div className={styles.page}>
  <header className={styles.header}><Link href="/" aria-label="Back to Attires Arena storefront"><Image src="/brand/logo-maroon.png" alt="Attires Arena" width={72} height={70} priority className={styles.logo}/></Link><span className={styles.eyebrow}>The motion atelier</span><Link href="/" className={styles.back}>Back to store <ArrowUpRight size={15} aria-hidden/></Link></header>
  <main id="main" className={styles.main}>
   <div className={styles.intro}><p className={styles.eyebrow}>Attires Arena / Private preview</p><h1>A quieter kind<br/>of motion.</h1><p>Four subtle ways to bring the collection into view. Scroll slowly, compare the two styles, and replay anything you like.</p><a href="#soft" className={styles.scroll}>Explore the studies <ArrowDown size={17} aria-hidden/></a></div>
   <div className={styles.controls} aria-label="Animation controls">
    <div role="group" aria-label="Animation style" className={styles.switch}>{(['elegant','minimal'] as const).map(value=><button key={value} aria-pressed={mode===value} onClick={()=>{setMode(value);setStatus(`${value==='elegant'?'Elegant':'Minimal'} style selected. Visible scenes replay; upcoming scenes reveal as you scroll.`);}}>{value==='elegant'?'Elegant':'Minimal'}</button>)}</div>
    <button className={styles.replay} onClick={()=>{setRevision(v=>v+1);setStatus('Visible scenes replayed. Scroll to reveal the rest.');}}><RotateCcw size={15} aria-hidden/> Replay all</button><a href="#compare" className={styles.compareLink}>Compare side by side</a>
   </div>
   <p role="status" aria-live="polite" className={styles.status}>{status}</p>
   <p className={styles.styleNote}>{mode==='elegant'?'Elegant — a soft rise, generous easing, and unhurried rhythm.':'Minimal — shorter movement, quicker settling, and quieter image reveals.'}</p>
   <Scene id="soft" number="01" title="Luxury soft fade-up" description="A whole editorial moment, arriving together." onReplay={announce}>{local=><Reveal mode={mode} cycle={`${cycle}.${local}`} className={styles.editorial}>
    <div className={styles.editorialCopy}><p className={styles.eyebrow}>One piece. Its own character.</p><h3>Considered pieces.<br/>Effortless presence.</h3><p>Original shirts from the Attires Arena collection, photographed as they are.</p><Link href="/category/shirts" className={styles.textLink}>Explore the shirts <ArrowUpRight size={16} aria-hidden/></Link></div><div className={styles.editorialImage}><ProductPhoto product={first} priority/></div>
   </Reveal>}</Scene>
   <Scene id="stagger" number="02" title="A considered rhythm" description="Product cards reveal in a restrained sequence as each row enters view." onReplay={announce}>{local=><div className={styles.products}>{products.slice(0,8).map((product,index)=><Reveal key={product.id} mode={mode} kind="card" cycle={`${cycle}.${local}`} index={index}><article className={styles.card}><Link href={`/product/${product.id.toLowerCase()}`}><div className={styles.cardPhoto}><ProductPhoto product={product}/></div><h3>{product.name}</h3><p className={styles.price}>৳{product.priceMinor/100}</p></Link></article></Reveal>)}</div>}</Scene>
   <Scene id="images" number="03" title="Details, softly revealed" description="A subtle image scale settles into a still, uncropped photograph." onReplay={announce}>{local=><div className={styles.imagePair}>{products.slice(4,6).map(product=><figure key={product.id}><div className={styles.scaleFrame}><Reveal mode={mode} kind="image" cycle={`${cycle}.${local}`} className={styles.scaleImage}><ProductPhoto product={product}/></Reveal></div><figcaption>{product.name}</figcaption></figure>)}</div>}</Scene>
   <Scene id="headings" number="04" title="Words with room to breathe" description="Minimal heading reveals. No split letters, no distracting movement." onReplay={announce}>{local=><div className={styles.headingStudies}>{['Style, elevated.','Less noise. More character.','Find your next favourite.'].map((heading,index)=><Reveal key={heading} mode={mode} kind="heading" cycle={`${cycle}.${local}`} index={index}><h3>{heading}</h3></Reveal>)}</div>}</Scene>
   <Scene id="compare" number="05" title="Same collection. Two moods." description="Compare identical artwork with different pacing. Each panel has its own replay." onReplay={announce}>{local=><div className={styles.comparison}>{(['elegant','minimal'] as const).map(value=><Comparison key={value} mode={value} product={first} cycle={`${cycle}.${local}`} onReplay={announce}/>)}</div>}</Scene>
   <footer className={styles.footer}><p>Motion study only. Storefront animations are unchanged.</p><p>Reduced motion is respected automatically. All content stays readable without JavaScript.</p><div><Link href="/">Back to storefront</Link><Link href="/motion-preview?lab=components">Earlier component lab</Link></div></footer>
  </main>
 </div>;
}
function Comparison({mode,product,cycle,onReplay}:{mode:Style;product:ShowcaseProduct;cycle:string;onReplay:()=>void}){
 const [revision,setRevision]=useState(0);
 return <div className={styles.comparisonPanel} data-comparison-style={mode}><div className={styles.panelTop}><h3>{mode==='elegant'?'Elegant':'Minimal'}</h3><button className={styles.replay} aria-label={`Replay ${mode} comparison`} onClick={()=>{setRevision(v=>v+1);onReplay();}}><RotateCcw size={15} aria-hidden/> Replay</button></div><Reveal mode={mode} cycle={`${cycle}.${revision}`}><div className={styles.comparisonPhoto}><ProductPhoto product={product}/></div><p>{product.name}</p></Reveal><p className={styles.muted}>{mode==='elegant'?'780ms · softly paced · 24px rise':'380ms · quietly paced · 9px rise'}</p></div>;
}
