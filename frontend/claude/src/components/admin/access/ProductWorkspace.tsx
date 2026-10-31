'use client';
import {useId,useRef,useState,type ReactNode} from 'react';
export function ProductWorkspace({sections}:{sections:{id:string;label:string;content:ReactNode}[]}){
 const [active,setActive]=useState(sections[0]?.id);const base=useId();const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const selected=sections.some(s=>s.id===active)?active:sections[0]?.id;
 return <div className="aa-product-workspace"><div className="aa-workspace-tabs" role="tablist" aria-label="Product workspace">
 {sections.map((section,index)=><button key={section.id} ref={element=>{buttons.current[index]=element;}} type="button" role="tab" id={base+'-tab-'+section.id} aria-controls={base+'-panel-'+section.id} aria-selected={selected===section.id} tabIndex={selected===section.id?0:-1} onClick={()=>setActive(section.id)} onKeyDown={event=>{
  let next=index;if(event.key==='ArrowRight')next=(index+1)%sections.length;else if(event.key==='ArrowLeft')next=(index-1+sections.length)%sections.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=sections.length-1;else return;
  event.preventDefault();setActive(sections[next]?.id);buttons.current[next]?.focus();
 }}>{section.label}</button>)}
 </div>{sections.map(section=><section key={section.id} role="tabpanel" id={base+'-panel-'+section.id} aria-labelledby={base+'-tab-'+section.id} hidden={selected!==section.id} tabIndex={0}>{section.content}</section>)}</div>;
}
