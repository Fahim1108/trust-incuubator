'use client';
import {createContext,useContext,useState,type ReactNode} from 'react';
import type {Brand,Product} from '@/types';
import {availableApparelSizes,sameSizeRecommendations} from '@/lib/catalogue-dimensions';
import {ProductGrid} from './ProductGrid';
const Context=createContext<{size?:string;setSize:(size:string)=>void}|null>(null);
export function ProductSizeProvider({product,children}:{product:Product;children:ReactNode}){
 const sizes=availableApparelSizes(product);const [size,setSize]=useState<string|undefined>(sizes.length===1?sizes[0]:undefined);
 return <Context.Provider value={{size,setSize}}>{children}</Context.Provider>;
}
export const useProductSize=()=>useContext(Context);
export function SameSizeRecommendations({product,candidates,brands}:{product:Product;candidates:Product[];brands:Brand[]}){
 const context=useProductSize();const items=sameSizeRecommendations(product,candidates,context?.size);
 if(!items.length)return null;
 return <section className="container mt-12" aria-label="You May Also Like"><h2 className="mb-5 font-display text-2xl">You May Also Like</h2><ProductGrid products={items} brands={brands} columns={4}/></section>;
}
