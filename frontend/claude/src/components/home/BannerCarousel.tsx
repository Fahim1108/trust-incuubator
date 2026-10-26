"use client";

import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import {SmartImage} from '@/components/ui';
import type {HeroSettings} from '@/types';

/** Controls sit below the artwork so they never obscure contact details or text. */
export function BannerCarousel({hero}:{hero:HeroSettings}) {
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const touch=useRef<{x:number;y:number}|null>(null);
  const count=hero.slides.length;
  const active=count?index%count:0;
  const go=(delta:number)=>setIndex(current=>(current+delta+count)%count);
  useEffect(()=>{
    if(count<2||paused||hovered||focused||!hero.autoplayMs)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer:number|undefined;
    const sync=()=>{
      window.clearInterval(timer);
      if(!media.matches&&!document.hidden)timer=window.setInterval(()=>setIndex(current=>(current+1)%count),hero.autoplayMs);
    };
    sync();media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    return ()=>{window.clearInterval(timer);media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[count,paused,hovered,focused,hero.autoplayMs]);
  if(!count)return null;
  const control='flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-primary transition-colors hover:bg-selected focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
  return <section aria-label="Attires Arena campaigns" aria-roledescription="carousel" className="bg-white"
    onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true);}} onPointerLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}
    onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}if(e.key==='ArrowRight'){e.preventDefault();go(1);}}}>
    <div data-banner-frame className="relative mx-auto h-[clamp(220px,56.25vw,300px)] w-full overflow-hidden bg-white [touch-action:pan-y] sm:h-[clamp(380px,29vw,460px)]"
      onTouchStart={e=>{const t=e.touches[0];if(t)touch.current={x:t.clientX,y:t.clientY};}}
      onTouchEnd={e=>{const t=e.changedTouches[0],start=touch.current;touch.current=null;if(!t||!start)return;const dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go(dx<0?1:-1);}}
      onTouchCancel={()=>{touch.current=null;}}>
      {hero.slides.map((slide,i)=><div key={slide.id} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${count}: ${slide.title}`} aria-hidden={i!==active} inert={i!==active}
        className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${i===active?'opacity-100':'pointer-events-none opacity-0'}`}>
        <SmartImage src={slide.image.src} alt={slide.image.alt} fill sizes="(min-width: 768px) 818px, 100vw" priority={i===0} loading={i===0?undefined:'lazy'} className="object-contain" />
      </div>)}
    </div>
    {count>1&&<div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 sm:gap-4">
      <button type="button" className={control} aria-label="Previous banner" onClick={()=>go(-1)}><ChevronLeft size={18} aria-hidden/></button>
      <div className="flex" role="group" aria-label="Choose banner">{hero.slides.map((slide,i)=><button type="button" key={slide.id} className="flex h-11 w-8 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Show banner ${i+1}: ${slide.title}`} aria-current={i===active?'true':undefined} onClick={()=>setIndex(i)}><span className={`h-2 w-2 rounded-full ${i===active?'bg-primary':'border border-primary bg-white'}`}/></button>)}</div>
      <button type="button" className={control} aria-label="Next banner" onClick={()=>go(1)}><ChevronRight size={18} aria-hidden/></button>
      {hero.autoplayMs > 0 && <button type="button" className={control} aria-label={paused?'Play banners':'Pause banners'} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={16} aria-hidden/>:<Pause size={16} aria-hidden/>}</button>}
    </div>}
  </section>;
}
