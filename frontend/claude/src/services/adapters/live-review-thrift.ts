import 'server-only';
import { cookies } from 'next/headers';
import { adminClient } from '@/lib/admin/supabase';
import { rolesSchema, snapshotSchema, type IntakeItem } from '@/lib/admin/validation';
import { reviewInventoryEnabled } from '@/lib/storefront-policy';
import type { Product } from '@/types';

/** No service key or public draft endpoint: use this browser's verified staff session. */
export async function readLiveReviewDrafts(): Promise<IntakeItem[] | null> {
 if(!reviewInventoryEnabled())return null;
 let store;
 try {store=await cookies();}catch{return null;}
 if(!store.getAll().some(c=>c.name==='aa-admin-auth'||c.name.startsWith('aa-admin-auth.')))return null;
 const client=await adminClient();
 const identity=await client.auth.getUser();
 if(identity.error||!identity.data.user||identity.data.user.is_anonymous)return null;
 const membership=await client.from('user_roles').select('role').eq('user_id',identity.data.user.id);
 const roles=rolesSchema.safeParse(membership.data);
 if(membership.error||!roles.success||!roles.data.some(r=>r.role==='owner'||r.role==='product_manager'))return null;
 const assurance=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(assurance.error||assurance.data.currentLevel!=='aal2')return null;
 const snapshot=await client.rpc('admin_catalogue_snapshot');
 const parsed=snapshotSchema.safeParse(snapshot.data);
 if(snapshot.error||!parsed.success)throw new Error('Saved review products could not be loaded. Please retry; the old import is not being substituted.');
 return parsed.data.items;
}

/** Review projection only; never creates SKUs, verifies a garment or changes publication. */
export function projectSavedReview(item:IntakeItem,base:Product):Product {
 const size=item.actual_size||base.sizes[0]||'';
 const variantId=`preview-${item.source_id}`;
 const image={src:item.image_path,alt:item.name};
 const details=[
  ...(item.chest_inches?[`Actual chest: ${item.chest_inches} inches`]:[]),
  ...(item.length_inches?[`Actual length: ${item.length_inches} inches`]:[]),
  ...(item.condition?[`Condition: ${item.condition.replaceAll('_',' ')}`]:[]),
  ...item.attributes,
 ];
 return {...base,slug:item.slug,name:item.name,status:item.status,reviewOnly:true,
  displaySizeEstimate:item.actual_size?undefined:base.displaySizeEstimate,
  description:item.description,shortDescription:item.description,details,
  price:item.price_minor/100,physicalStock:item.stock_quantity,
  sizes:size?[size]:[],fixedVariantId:variantId,
  variants:size?[{id:variantId,sku:variantId,size,colorId:'fixed',stock:item.stock_quantity}]:[],
  colors:[{id:'fixed',name:item.actual_color||base.colors[0]?.name||'',hex:'#6B0202'}],
  defaultImages:[image],imagesByColor:{fixed:[image]},tags:item.attributes,
 };
}
