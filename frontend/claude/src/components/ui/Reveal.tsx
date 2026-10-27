"use client";
import {useEffect,useRef,type ReactNode} from 'react';
import {cn} from '@/lib/cn';

/** Heading-only, once-per-mount opacity enhancement. Containers and products never animate. */
export function Reveal({children,className}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const heading=ref.current?.querySelector<HTMLElement>('h1,h2,h3,h4');
  if(!heading)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  heading.dataset.quietHeading='true';
  if(media.matches||!heading.animate||!('IntersectionObserver' in window)){heading.dataset.headingState='static';return;}
  // Initial/previously visible headings remain fully visible; never flash them after hydration.
  if(heading.getBoundingClientRect().top<innerHeight){heading.dataset.headingState='initial';return;}
  let animation:Animation|undefined;
  heading.dataset.headingState='waiting';
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   observer.disconnect();
   if(media.matches)return;
   heading.dataset.headingState='shown';
   animation=heading.animate([{opacity:.4},{opacity:1}],{duration:350,easing:'ease-out'});
  },{threshold:.1});
  const stop=()=>{if(media.matches){observer.disconnect();animation?.cancel();heading.dataset.headingState='static';}};
  observer.observe(heading);media.addEventListener('change',stop);
  return()=>{observer.disconnect();animation?.cancel();media.removeEventListener('change',stop);};
 },[]);
 return <div ref={ref} className={cn('aa-heading-reveal',className)}>{children}</div>;
}
