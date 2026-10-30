'use server';
import {revalidatePath} from 'next/cache';
import {staffSession} from './access';
import {isProductionStorefront} from '../storefront-policy';
import {publicSupabaseConfiguration} from '../supabase-public';
import projects from '@/config/supabase-projects.json';
import {termEdit,productTerms} from './taxonomy-validation';
import type {AdminActionState} from './validation';
async function manager(){
 if(isProductionStorefront()||process.env.STAGING_CATALOGUE_TAXONOMY!=='1'||publicSupabaseConfiguration()?.url!==`https://${projects.staging}.supabase.co`)throw new Error('Taxonomy management is available only in verified Staging.');
 const s=await staffSession();if(!s.roles.some(r=>r==='owner'||r==='product_manager'))throw new Error('Your role cannot manage catalogue terms.');return s;
}
export async function saveTerm(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const s=await manager();const parsed=termEdit.safeParse({...Object.fromEntries(form),published:form.get('published')||''});if(!parsed.success)return {error:'Enter a name and a URL slug using lowercase letters, numbers and single hyphens.'};
 const d=parsed.data;const deleting=form.get('operation')==='delete';
 if(deleting&&form.get('confirm')!=='on')return {error:'Confirm deletion of this unused, unpublished record.'};
 const params={term_type:d.kind,target_id:d.id,expected_updated_at:d.updated_at||null};
 const r=deleting?await s.client.rpc('admin_delete_catalogue_term',params):await s.client.rpc('admin_save_catalogue_term',{...params,term:{name:d.name,slug:d.slug,published:d.published}});
 if(r.error)return {error:r.error.code==='PT409'?'This record changed. Reload before retrying.':r.error.code==='23503'?'This record is assigned or has child categories. Remove those references first.':r.error.code==='23505'?'That URL slug already exists.':'Update rejected. Only unused, unpublished records can be deleted.'};
 revalidatePath('/admin/taxonomy');return {success:deleting?'Unused record deleted and audited.':'Catalogue record saved and audited.'};
}
export async function assignProductTerms(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const s=await manager();const parsed=productTerms.safeParse({...Object.fromEntries(form),terms:form.getAll('terms').filter(Boolean)});
 if(!parsed.success)return {error:'Select existing catalogue terms and reload if the saved version is missing.'};
 const d=parsed.data;const r=await s.client.rpc('admin_set_product_taxonomy',{target_id:d.id,expected_updated_at:d.updated_at,category:d.category||null,term_ids:d.terms});
 if(r.error)return {error:r.error.code==='PT409'?'This product changed. Reload before saving.':'Assignment rejected. Choose existing terms and at most one brand.'};
 revalidatePath('/admin/products/'+d.id);revalidatePath('/admin/audit');return {success:'Product category and terms saved.'};
}
