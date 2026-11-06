'use client';
/* Original intake photographs are existing static storefront assets. */
import Image from 'next/image';
import {startTransition,useActionState,useEffect,useId,useState,type FormEvent,type ReactNode} from 'react';
import {saveThriftDraft} from '@/lib/admin/actions';
import {shirtAttributes,garmentSizes,garmentConditions,type AdminActionState} from '@/lib/admin/validation';
import {useUnsavedDraft} from './useUnsavedDraft';
import {ProductWorkspace} from './ProductWorkspace';
type Garment={source_id:string;image_path:string;actual_size:string|null;actual_color:string|null;chest_inches:number|null;length_inches:number|null;condition:string|null;price_minor:number;stock_quantity:number;attributes:string[];seo_title:string|null;seo_description:string|null};
type Product={id:string;name:string;description:string;updated_at:string};
function price(minor:number){return (BigInt(minor)/BigInt(100)).toString()+'.'+(BigInt(minor)%BigInt(100)).toString().padStart(2,'0');}
/**
 * One audited draft save (admin_save_thrift_draft) whose fields are spread across
 * workflow steps via the HTML `form` attribute. Hidden steps stay mounted, so every
 * field is always submitted. The saved version is pinned while edits are pending,
 * so a concurrent change is rejected (PT409) rather than silently overwritten.
 */
export function GarmentWorkspace({product,garment,editable,slots}:{product:Product;garment:Garment;editable:boolean;slots:{media:ReactNode;taxonomy:ReactNode;inventory:ReactNode;review:ReactNode}}){
 const formId=useId().replace(/:/g,'')+'-garment';
 const [draft,setDraft]=useState({version:product.updated_at,dirty:false});
 if(!draft.dirty&&draft.version!==product.updated_at)setDraft({version:product.updated_at,dirty:false});
 useUnsavedDraft(draft.dirty);
 const [state,action,pending]=useActionState(async(previous:AdminActionState,form:FormData)=>{const result=await saveThriftDraft(previous,form);if(result.success)setDraft(current=>({...current,dirty:false}));return result;},{});
 // Field changes bubble through the tab panels, not the form element, so listen at the document.
 useEffect(()=>{
  const mark=(event:Event)=>{const target=event.target;if((target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement)&&target.form?.id===formId)setDraft(current=>current.dirty?current:{...current,dirty:true});};
  document.addEventListener('input',mark);document.addEventListener('change',mark);
  return ()=>{document.removeEventListener('input',mark);document.removeEventListener('change',mark);};
 },[formId]);
 // Submit through a transition instead of <form action>: React resets every associated
 // field after a form action resolves, which would discard edits when a save is rejected.
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const data=new FormData(event.currentTarget);startTransition(()=>action(data));};
 const off=!editable||pending;
 // Remount uncontrolled fields only when a fresh, clean server version arrives (pinned while dirty).
 const k=draft.version;
 const f={form:formId};
 const sections=[
  {id:'basics',label:'1. Basics',content:<section className="aa-panel" key={k}><h2>Basic information</h2>
   <fieldset className="aa-form" disabled={off}><legend className="aa-sr-only">Basic information</legend>
   <label>Product name<input {...f} name="name" defaultValue={product.name} maxLength={200}/></label>
   <label htmlFor={formId+'-description'}>Description</label><textarea {...f} id={formId+'-description'} name="description" rows={6} defaultValue={product.description} maxLength={20000}/>
   </fieldset>
   <dl className="aa-fact-grid"><div><dt>Garment ID</dt><dd>{garment.source_id}</dd></div><div><dt>Product type</dt><dd>Single physical garment</dd></div></dl></section>},
  {id:'media',label:'2. Media',content:<>
   <section className="aa-panel"><h2>Original photograph</h2><p>The intake photograph is preserved unchanged and remains the image customers see for this garment.</p>
   <Image className="aa-original-photo" src={garment.image_path} alt={product.name} width={240} height={300}/></section>{slots.media}</>},
  {id:'taxonomy',label:'3. Category',content:slots.taxonomy},
  {id:'size',label:'4. Size',content:<section className="aa-panel" key={k}><h2>Actual size and measurements</h2><p>Record the real garment. Leave unknown values blank; nothing here creates size variants.</p>
   <fieldset className="aa-fields" disabled={off}><legend className="aa-sr-only">Size and measurements</legend>
   <label>Actual size<select {...f} name="actual_size" defaultValue={garment.actual_size||''}><option value="">Not recorded</option>{Array.from(new Set([...(garment.actual_size?[garment.actual_size]:[]),...garmentSizes])).map(s=><option key={s} value={s}>{s}</option>)}</select></label>
   <label>Actual color<input {...f} name="actual_color" defaultValue={garment.actual_color||''} maxLength={80}/></label>
   <label>Chest (inches)<input {...f} name="chest_inches" type="number" inputMode="decimal" min="0.01" max="100" step="0.01" defaultValue={garment.chest_inches??''}/></label>
   <label>Length (inches)<input {...f} name="length_inches" type="number" inputMode="decimal" min="0.01" max="100" step="0.01" defaultValue={garment.length_inches??''}/></label>
   <label>Condition<select {...f} name="condition" defaultValue={garment.condition||''}><option value="">Not recorded</option>{garmentConditions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
   </fieldset></section>},
  {id:'inventory',label:'5. Price & stock',content:<><section className="aa-panel" key={k}><h2>Price and physical quantity</h2><p>This is one original garment. Quantity is 1 while it is on hand and 0 once it is gone; it can never exceed one.</p>
   <fieldset className="aa-fields" disabled={off}><legend className="aa-sr-only">Price and quantity</legend>
   <label>Price (BDT)<input {...f} name="price" inputMode="decimal" defaultValue={price(garment.price_minor)}/></label>
   <label>Physical quantity<select {...f} name="stock_quantity" defaultValue={String(garment.stock_quantity)}><option value="0">0 — no physical stock</option><option value="1">1 — one original garment</option></select></label>
   </fieldset></section>{slots.inventory}</>},
  {id:'attributes',label:'6. Attributes',content:<section className="aa-panel" key={k}><h2>Garment attributes</h2>
   <fieldset className="aa-choice-grid" disabled={off}><legend>Choose all that apply</legend>{shirtAttributes.map(a=><label key={a} className="aa-choice"><input {...f} type="checkbox" name="attributes" value={a} defaultChecked={garment.attributes.includes(a)}/>{a}</label>)}</fieldset></section>},
  {id:'seo',label:'7. SEO',content:<section className="aa-panel" key={k}><h2>Search appearance</h2><p>Saved with the draft. Public metadata does not change until a publication workflow exists.</p>
   <fieldset className="aa-form" disabled={off}><legend className="aa-sr-only">SEO</legend>
   <label>SEO title<input {...f} name="seo_title" maxLength={70} defaultValue={garment.seo_title||''}/></label>
   <label htmlFor={formId+'-seo'}>SEO description</label><textarea {...f} id={formId+'-seo'} name="seo_description" rows={3} maxLength={160} defaultValue={garment.seo_description||''}/>
   </fieldset></section>},
  {id:'review',label:'8. Review',content:slots.review},
 ];
 return <>
  <ProductWorkspace sections={sections}/>
  {editable&&<form id={formId} onSubmit={submit} noValidate className="aa-save-bar" aria-label="Save garment draft">
   <input type="hidden" name="id" value={product.id}/><input type="hidden" name="updated_at" value={draft.version}/>
   <div role="status" aria-live="polite">{state.error?<span className="aa-save-error">{state.error}</span>:draft.dirty?'Unsaved changes in this garment draft.':state.success||'All garment details saved.'}</div>
   <button disabled={pending}>{pending?'Saving…':'Save draft'}</button>
  </form>}
 </>;
}
