'use server';
import {revalidatePath} from 'next/cache';
import {staffSession} from './access';
import {isProductionStorefront} from '../storefront-policy';
import {publicSupabaseConfiguration} from '../supabase-public';
import projects from '@/config/supabase-projects.json';
import {variantEditSchema,stockEditSchema} from './variant-management';
import type {AdminActionState} from './validation';
async function session(){
 if(isProductionStorefront()||process.env.STAGING_VARIANT_MANAGEMENT!=='1'||publicSupabaseConfiguration()?.url!==`https://${projects.staging}.supabase.co`)throw new Error('SKU management is available only in verified Staging.');
 const s=await staffSession();if(!s.roles.some(r=>r==='owner'||r==='product_manager'))throw new Error('Your role cannot manage SKUs or stock.');return s;
}
function resultState(id:string,error:{code?:string}|null):AdminActionState{
 if(error)return {error:error.code==='PT409'?'This product changed. Reload before retrying.':error.code==='23505'?'The SKU or size/color combination already exists.':'Update rejected. Check the fields, available stock and permissions.'};
 revalidatePath('/admin/products/'+id);revalidatePath('/admin/products/library');revalidatePath('/admin');revalidatePath('/admin/audit');return {success:'Changes saved and audited.'};
}
export async function saveVariant(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const s=await session();const parsed=variantEditSchema.safeParse({...Object.fromEntries(form),active:form.get('active')||''});if(!parsed.success)return {error:'Enter a unique SKU, actual size/color and valid regular/sale prices.'};
 const d=parsed.data;const r=await s.client.rpc('admin_save_product_variant',{target_id:d.id,expected_updated_at:d.updated_at,target_variant:d.variant_id,variant:{sku:d.sku,size:d.size,color:d.color,price_minor:d.price,sale_price_minor:d.sale_price,active:d.active}});
 return resultState(d.id,r.error);
}
export async function adjustProductStock(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const s=await session();const parsed=stockEditSchema.safeParse(Object.fromEntries(form));if(!parsed.success)return {error:'Enter a non-zero whole quantity change and a reason of 3–500 characters.'};
 const d=parsed.data;const r=await s.client.rpc('admin_adjust_product_stock',{target_id:d.id,expected_updated_at:d.updated_at,target_variant:d.variant_id,quantity_delta:d.delta,adjustment_reason:d.reason});return resultState(d.id,r.error);
}
