import {z} from 'zod';
import {galleryTarget} from './gallery-validation';
import {toMinorUnits} from './validation';
const money=z.string().regex(/^\d{1,9}(\.\d{1,2})?$/).transform(toMinorUnits);
export const variantEditSchema=galleryTarget.extend({
 variant_id:z.uuid(),sku:z.string().trim().min(1).max(100),size:z.string().trim().min(1).max(40).refine(v=>!['N/A','NA','UNKNOWN'].includes(v.toUpperCase())),
 color:z.string().trim().min(1).max(80),price:money,sale_price:z.union([z.literal('').transform(()=>null),money]),active:z.enum(['on','']).transform(v=>v==='on'),
}).refine(v=>(v.sale_price===null||v.sale_price<=v.price)&&(!v.active||v.price>0),'Sale cannot exceed regular price; active SKU needs a positive price.');
export const stockEditSchema=galleryTarget.extend({variant_id:z.uuid(),delta:z.string().regex(/^-?\d{1,9}$/).transform(Number).refine(v=>v!==0),reason:z.string().trim().min(3).max(500)});
export function editablePrice(minor:number){return (BigInt(minor)/BigInt(100)).toString()+'.'+(BigInt(minor)%BigInt(100)).toString().padStart(2,'0');}
