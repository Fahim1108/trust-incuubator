'use server';
import {revalidatePath} from 'next/cache';
import {randomUUID} from 'node:crypto';
import {staffSession} from './access';
import {isProductionStorefront} from '../storefront-policy';
import {publicSupabaseConfiguration} from '../supabase-public';
import projects from '@/config/supabase-projects.json';
import {galleryTarget,galleryCommand} from './gallery-validation';
import {validDraftImage,draftMediaLimit} from './media-validation';
import type {AdminActionState} from './validation';
async function gallerySession(){
 if(isProductionStorefront()||process.env.STAGING_PRODUCT_GALLERY!=='1'||publicSupabaseConfiguration()?.url!==`https://${projects.staging}.supabase.co`)throw new Error('Product gallery is not activated for this environment.');
 const session=await staffSession();
 if(!session.roles.some(r=>r==='owner'||r==='product_manager'))throw new Error('Your role cannot edit product galleries.');
 return session;
}
export async function editGallery(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const session=await gallerySession();const target=galleryTarget.safeParse(Object.fromEntries(form));
 let ids:unknown;try{ids=JSON.parse(String(form.get('ids')||'[]'));}catch{return {error:'Invalid gallery order.'};}
 const command=galleryCommand.safeParse({operation:form.get('operation'),id:form.get('image_id'),alt:form.get('alt'),ids});
 if(!target.success||!command.success)return {error:'Invalid gallery update. Reload and try again.'};
 const r=await session.client.rpc('admin_edit_product_gallery',{target_id:target.data.id,expected_updated_at:target.data.updated_at,command:command.data});
 if(r.error)return {error:r.error.code==='PT409'?'This product changed. Reload before editing the gallery.':'Gallery was not changed. Check your access and reload.'};
 revalidatePath('/admin/products/'+target.data.id);revalidatePath('/admin/audit');
 return {success:'Gallery updated.'};
}
export async function uploadProductImages(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const session=await gallerySession();const target=galleryTarget.safeParse(Object.fromEntries(form));
 const files=form.getAll('images');
 if(!target.success||!files.length||files.length>8||files.some(f=>!(f instanceof File))||files.reduce((sum,f)=>sum+(f instanceof File?f.size:0),0)>draftMediaLimit)return {error:'Choose up to 8 images, 768 KiB combined per upload. Repeat for additional images.'};
 // Validate every file before writing any bytes.
 const prepared=[];
 for(const f of files as File[]){const bytes=new Uint8Array(await f.arrayBuffer());if(!validDraftImage(bytes,f.type))return {error:'Every file must be a valid JPEG, PNG or WebP image.'};prepared.push({f,bytes});}
 let version=target.data.updated_at;let count=0;
 for(const {f,bytes} of prepared){
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[f.type];const path=`${session.user.id}/${randomUUID()}.${ext}`;
  const upload=await session.client.storage.from('attires-product-drafts').upload(path,bytes,{contentType:f.type,upsert:false});
  if(upload.error){revalidatePath('/admin/products/'+target.data.id);return {error:`${count} images attached. Remaining uploads failed; reload before retrying.`};}
  const attached=await session.client.rpc('admin_edit_product_gallery',{target_id:target.data.id,expected_updated_at:version,command:{operation:'attach',path,alt:''}});
  if(attached.error||!galleryTarget.shape.updated_at.safeParse(attached.data).success){
   // FK prevents removing bytes if an attachment committed but its response was lost.
   await session.client.storage.from('attires-product-drafts').remove([path]);
   revalidatePath('/admin/products/'+target.data.id);
   return {error:`${count} attachments confirmed. Reload the gallery to check the last upload before retrying.`};
  }
  version=attached.data;count++;
 }
 revalidatePath('/admin/products/'+target.data.id);revalidatePath('/admin/audit');
 return {success:`${count} images uploaded and attached privately.`};
}
