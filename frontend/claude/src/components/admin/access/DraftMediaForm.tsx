'use client';
import {useActionState} from 'react';
import {uploadDraftMedia,type MediaUploadState} from '@/lib/admin/media-actions';
export function DraftMediaForm(){
 const [state,action,pending]=useActionState<MediaUploadState,FormData>(uploadDraftMedia,{});
 return <form action={action} className="aa-form">
  <label>Private draft image<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required/></label>
  <p>JPEG, PNG or WebP, up to 768 KiB. Stored privately; this does not publish or attach an image to a product.</p>
  <button disabled={pending}>{pending?'Uploading…':'Upload private image'}</button>
  {state.error&&<p role="alert">{state.error}</p>}
  {state.path&&<div role="status"><p>Private image uploaded.</p><label>Stored object path<input readOnly value={state.path}/></label></div>}
 </form>;
}
