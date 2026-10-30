'use server';
import {revalidatePath} from 'next/cache';
import {staffSession} from './access';
import {isProductionStorefront} from '../storefront-policy';
import {basicDraftSchema} from './basic-draft-validation';
import type {AdminActionState} from './validation';
export async function saveBasicDraft(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 if(isProductionStorefront()||process.env.STAGING_GENERIC_DRAFT_EDITOR!=='1')return {error:'Draft editing requires the approved Staging migration and activation.'};
 const session=await staffSession();
 if(!session.roles.some(r=>r==='owner'||r==='product_manager'))return {error:'Your role cannot edit product drafts.'};
 const parsed=basicDraftSchema.safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:'Enter a name up to 200 characters and a description up to 20,000 characters. Reload if the saved version is missing.'};
 const d=parsed.data;
 const result=await session.client.rpc('admin_update_product_draft',{target_id:d.id,expected_updated_at:d.updated_at,product_name:d.name,product_description:d.description});
 if(result.error)return {error:result.error.code==='PT409'?'This draft changed. Reload to review the latest version before saving.':result.error.code==='22023'?'This record cannot be edited here. Reload and use its correct draft workflow.':'Draft could not be saved. Check your access or Staging configuration before retrying.'};
 if(!basicDraftSchema.shape.updated_at.safeParse(result.data).success)return {error:'Save could not be confirmed. Reload the product before retrying.'};
 revalidatePath('/admin');revalidatePath('/admin/products');revalidatePath('/admin/products/library');revalidatePath('/admin/products/'+d.id);revalidatePath('/admin/audit');
 return {success:'Draft details saved.'};
}
