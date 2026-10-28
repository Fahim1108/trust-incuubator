'use client';
import {useActionState,useState} from 'react';
import {useUnsavedDraft} from "./useUnsavedDraft";
import {createProductDraft} from '@/lib/admin/actions';
export function CreateDraftForm({requestId}:{requestId:string}){
 const [dirty,setDirty]=useState(false);useUnsavedDraft(dirty);
 const [state,action,pending]=useActionState(async(previous:import("@/lib/admin/validation").AdminActionState,form:FormData)=>{const result=await createProductDraft(previous,form);if(result.success)setDirty(false);return result;},{});
 return <form action={action} className="aa-form" onChange={()=>setDirty(true)}><input type="hidden" name="request_id" value={requestId}/><label>Product name<input name="name" required maxLength={200}/></label><label htmlFor="new-description">Description</label><textarea id="new-description" name="description" maxLength={20000} rows={5}/>{state.error&&<p role="alert">{state.error}</p>}{state.success?<p role="status">{state.success}</p>:<button disabled={pending}>{pending?'Saving…':'Create draft'}</button>}</form>;
}
