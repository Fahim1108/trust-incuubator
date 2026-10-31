'use client';
/* Private signed URLs expire; do not proxy them through a public image cache. */
/* eslint-disable @next/next/no-img-element */
import {useState} from 'react';
import {Package} from 'lucide-react';
export function ProductThumbnail({url,alt}:{url:string|null;alt:string}){
 const [failed,setFailed]=useState<string|null>(null);
 return <span className="aa-product-thumb">{url&&failed!==url?<img src={url} alt={alt} width={48} height={60} onError={()=>setFailed(url)}/>:<Package size={20} strokeWidth={1.4} aria-label="No image preview"/>}</span>;
}
