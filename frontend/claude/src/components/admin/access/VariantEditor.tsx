'use client';
import {useActionState,useState} from 'react';
import {saveVariant,adjustProductStock} from '@/lib/admin/variant-actions';
import {editablePrice} from '@/lib/admin/variant-management';
import type {z} from 'zod';
import type {variantRecordSchema} from '@/lib/admin/library-validation';
type Target={id:string;updated_at:string};
function TargetFields({target,variantId}:{target:Target;variantId:string}){return <><input type="hidden" name="id" value={target.id}/><input type="hidden" name="updated_at" value={target.updated_at}/><input type="hidden" name="variant_id" value={variantId}/></>;}
export function VariantEditor({target,variant,newId}:{target:Target;variant?:z.infer<typeof variantRecordSchema>;newId?:string}){
 const id=variant?.id||newId||'';const [state,action,pending]=useActionState(saveVariant,{});
 return <section className="aa-panel"><h3>{variant?'Edit '+variant.sku:'Add SKU variant'}</h3><form action={action} className="aa-form"><TargetFields target={target} variantId={id}/><div className="aa-fields">
 <label>SKU<input name="sku" defaultValue={variant?.sku||''} maxLength={100} required/></label>
 <label>Actual size<input name="size" defaultValue={variant?.size||''} maxLength={40} required/></label>
 <label>Actual color<input name="color" defaultValue={variant?.color||''} maxLength={80} required/></label>
 <label>Regular price (BDT)<input name="price" inputMode="decimal" defaultValue={variant?editablePrice(variant.price_minor):''} required/></label>
 <label>Sale price (BDT, optional)<input name="sale_price" inputMode="decimal" defaultValue={variant?.sale_price_minor!=null?editablePrice(variant.sale_price_minor):''}/></label>
 </div><label><input type="checkbox" name="active" defaultChecked={variant?.active||false}/> Active SKU</label><p>A new SKU starts with zero stock. Record physical inventory separately. This does not publish the product.</p>
 <button disabled={pending}>{pending?'Saving SKU…':variant?'Save SKU':'Create SKU'}</button>{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</form></section>;
}
export function StockEditor({target,variantId}:{target:Target;variantId:string}){
 const [state,action,pending]=useActionState(adjustProductStock,{});
 const [direction,setDirection]=useState<'add'|'remove'>('add');const [quantity,setQuantity]=useState('');
 const delta=/^[1-9]\d{0,8}$/.test(quantity)?(direction==='remove'?'-':'')+quantity:'';
 return <form action={action} className="aa-form"><TargetFields target={target} variantId={variantId}/><input type="hidden" name="delta" value={delta}/>
 <fieldset className="aa-stock-direction" disabled={pending}><legend>Adjustment type</legend><label><input type="radio" name="adjustment_type" value="add" checked={direction==='add'} onChange={()=>setDirection('add')}/>Add stock</label><label><input type="radio" name="adjustment_type" value="remove" checked={direction==='remove'} onChange={()=>setDirection('remove')}/>Remove stock</label></fieldset>
 <label>Quantity<input name="quantity" inputMode="numeric" pattern="[1-9][0-9]*" maxLength={9} value={quantity} onChange={event=>setQuantity(event.target.value)} required disabled={pending}/></label><label>Adjustment reason<input name="reason" minLength={3} maxLength={500} required disabled={pending}/></label><button disabled={pending}>{pending?'Recording adjustment…':'Record stock adjustment'}</button>{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</form>;
}
