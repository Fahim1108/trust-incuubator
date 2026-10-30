'use server';
import {randomUUID} from 'node:crypto';
import {staffSession} from './access';
import {publicSupabaseConfiguration} from '../supabase-public';
import {isProductionStorefront} from '../storefront-policy';
import projects from '@/config/supabase-projects.json';
import {draftMediaLimit,validDraftImage} from './media-validation';
export type MediaUploadState={error?:string;path?:string};
export async function uploadDraftMedia(_:MediaUploadState,form:FormData):Promise<MediaUploadState>{
  if(isProductionStorefront() || publicSupabaseConfiguration()?.url!==`https://${projects.staging}.supabase.co`)return {error:'Private media verification is available only in Staging.'};
  const {client,user,roles}=await staffSession();
  if(!roles.some(r=>r==='owner'||r==='product_manager'))return {error:'Your role cannot upload draft images.'};
  const file=form.get('image');
  if(!(file instanceof File)||file.size>draftMediaLimit)return {error:'Choose a JPEG, PNG or WebP image up to 768 KiB.'};
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!validDraftImage(bytes,file.type))return {error:'Choose a valid JPEG, PNG or WebP image up to 768 KiB.'};
  const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
  const path=`${user.id}/${randomUUID()}.${extension}`;
  const result=await client.storage.from('attires-product-drafts').upload(path,bytes,{contentType:file.type,upsert:false});
  if(result.error)return {error:'Upload failed. Check your access and try again.'};
  return {path:result.data.path};
}
