'use client';
import {useActionState,useState} from 'react';
import {saveBasicDraft} from '@/lib/admin/basic-draft-actions';
import {useUnsavedDraft} from './useUnsavedDraft';
import type {AdminActionState} from '@/lib/admin/validation';
export function BasicDraftEditor({product}:{product:{id:string;name:string;description:string;updated_at:string}}){
 const [dirty,setDirty]=useState(false);useUnsavedDraft(dirty);
 const [state,action,pending]=useActionState(async(previous:AdminActionState,form:FormData)=>{const result=await saveBasicDraft(previous,form);if(result.success)setDirty(false);return result;},{});
 return <section className="aa-panel"><h2>Edit draft details</h2><p>This changes only the name and description. Prices, sizes, stock, images and publication remain separate workflows.</p>
 <form action={action} className="aa-form" onChange={()=>setDirty(true)}>
 <input type="hidden" name="id" value={product.id}/><input type="hidden" name="updated_at" value={product.updated_at}/>
 <label>Product name<input name="name" defaultValue={product.name} maxLength={200} required disabled={pending}/></label>
 <label>Description<textarea name="description" defaultValue={product.description} maxLength={20000} rows={6} disabled={pending}/></label>
 {state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}
 <button disabled={pending}>{pending?'Saving…':'Save draft details'}</button>
 </form></section>;
}
