'use client';
import {useActionState,useState} from 'react';
import {saveBasicDraft} from '@/lib/admin/basic-draft-actions';
import {useUnsavedDraft} from './useUnsavedDraft';
import type {AdminActionState} from '@/lib/admin/validation';
export function BasicDraftEditor({product}:{product:{id:string;name:string;description:string;updated_at:string}}){
 const [draft,setDraft]=useState({...product,dirty:false});useUnsavedDraft(draft.dirty);
 // Keep dirty fields AND their original concurrency version across other-tab saves.
 // Clean forms adopt fresh server values; dirty forms must resolve stale conflicts.
 if(!draft.dirty&&draft.updated_at!==product.updated_at)setDraft({...product,dirty:false});
 const [state,action,pending]=useActionState(async(previous:AdminActionState,form:FormData)=>{const result=await saveBasicDraft(previous,form);if(result.success)setDraft(current=>({...current,dirty:false}));return result;},{});
 return <section className="aa-panel"><h2>Edit draft details</h2><p>This changes only the name and description. Prices, sizes, stock, images and publication remain separate workflows.</p>
 <form action={action} className="aa-form">
 <input type="hidden" name="id" value={product.id}/><input type="hidden" name="updated_at" value={draft.updated_at}/>
 <label>Product name<input name="name" value={draft.name} onChange={event=>setDraft(current=>({...current,name:event.target.value,dirty:true}))} maxLength={200} required disabled={pending}/></label>
 <label htmlFor={'draft-description-'+product.id}>Description</label><textarea id={'draft-description-'+product.id} name="description" value={draft.description} onChange={event=>setDraft(current=>({...current,description:event.target.value,dirty:true}))} maxLength={20000} rows={6} disabled={pending}/>
 {state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}
 <button disabled={pending}>{pending?'Saving…':'Save draft details'}</button>
 </form></section>;
}
