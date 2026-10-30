import {rejectLegacyRemoteTool} from './lib/legacy-remote-tool.mjs';
rejectLegacyRemoteTool();
// Real signed-JWT permission matrix; only disposable accounts in the authorized dev project.
import assert from 'node:assert/strict';
import { randomUUID,randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
import { projectUrl,getTestAdminKey,query,uuid,literal } from './lib/supabase-development.mjs';
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(projectUrl,await getTestAdminKey(),options);
const users=[],results=[];const product=randomUUID(),variant=randomUUID();
const password=randomBytes(32).toString('base64url');
function ok(r){if(r.error)throw new Error('Supabase operation failed; details withheld');return r.data;}
try {
 await query(`insert into public.products(id,name,slug,status) values (${uuid(product)},'Staff verification fixture',${literal('staff-'+product)},'draft');
 insert into public.product_variants(id,product_id,sku,size,color,price_minor) values (${uuid(variant)},${uuid(product)},${literal('staff-'+variant)},'M','Black',10000);
 insert into public.inventory(variant_id,on_hand,reserved) values (${uuid(variant)},5,2);`,false);
 for(const role of ['owner','product_manager','order_manager','customer_support','marketing_manager','analyst']) {
  const email=`attire-staff-${randomUUID()}@example.com`;
  const user=ok(await admin.auth.admin.createUser({email,password,email_confirm:true})).user;users.push(user.id);
  if(role==='owner')await query(`select private.provision_owner(${uuid(user.id)},${literal(email)},'Authorized disposable staff permission verification')`,false);
  else await query(`insert into public.user_roles(user_id,role) values (${uuid(user.id)},${literal(role)})`,false);
  const client=createClient(projectUrl,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);ok(await client.auth.signInWithPassword({email,password}));
  const reader=['owner','product_manager','order_manager','analyst'].includes(role),writer=['owner','product_manager'].includes(role);
  assert.equal(ok(await client.from('products').select('id').eq('id',product)).length,reader?1:0);
  assert.equal(ok(await client.from('inventory').select('variant_id').eq('variant_id',variant)).length,reader?1:0);
  const change=await client.rpc('adjust_inventory',{target_variant:variant,quantity_delta:1,adjustment_reason:'Staff matrix verification'});
  if(writer)ok(change);else assert.equal(change.error?.code,'42501');
  assert((await client.from('user_roles').insert({user_id:user.id,role:'owner'})).error);
  assert((await client.from('inventory').update({on_hand:100}).eq('variant_id',variant)).error);
  results.push({role,status:'passed'});console.log('PASS: real JWT permission matrix for '+role);
 }
}catch{results.push({status:'failed'});console.error('Staff matrix verification failed; provider details withheld.');process.exitCode=1;}
finally{
 try{
  await query(`delete from public.inventory_movements where variant_id=${uuid(variant)};delete from public.inventory where variant_id=${uuid(variant)};delete from public.product_variants where id=${uuid(variant)};delete from public.products where id=${uuid(product)};`,false);
  for(const id of users)ok(await admin.auth.admin.deleteUser(id));console.log('Staff fixtures removed; no permanent staff account provisioned.');
 }catch{results.push({name:'cleanup',status:'failed'});process.exitCode=1;console.error('Staff fixture cleanup needs investigation.');}
 writeFileSync('docs/SUPABASE_STAFF_VERIFICATION_RESULTS.json',JSON.stringify({scope:'real hosted development Auth/PostgREST',results},null,2)+'\n');
}
