// Real signed Supabase sessions. Generated fixtures only; no permanent Owner use.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {projectUrl,projectRef,getTestAdminKey,getStagingPublishableKey,query,uuid,literal} from '../lib/supabase-development.mjs';
import {assertRemoteDatabaseIsolation} from '../lib/deployment-isolation.mjs';
import {totpCode} from './verify-browser.mjs';
await assertRemoteDatabaseIsolation(projectUrl);
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(projectUrl,await getTestAdminKey(),options);
const key=await getStagingPublishableKey();
const client=()=>createClient(projectUrl,key,options);
const users=[],products=[],checks=[];
const storagePaths=[];
const taxonomyIds=[];
const password=randomBytes(32).toString('base64url');
const ok=r=>{if(r.error)throw new Error('Staging operation rejected: '+r.error.code);return r.data;};
const pass=s=>{checks.push(s);console.log('PASS: '+s);};
const permanent=await query("select u.id, array(select id::text from auth.mfa_factors where user_id=u.id and status='verified' order by id) as factors from auth.users u where email='attiresarena664@gmail.com'");
let success=false;
try{
 const p=randomUUID();products.push(p);
 await query(`insert into public.products(id,name,slug) values(${uuid(p)},'Disposable metadata test',${literal('qa-metadata-'+p)})`,false);
 const version=async()=>(await query(`select updated_at from public.products where id=${uuid(p)}`))[0].updated_at;
 let savedVersion=await version();
 const payload=()=>({target_id:p,expected_updated_at:savedVersion,product_name:'Audited staging edit',product_description:'Temporary verification fixture'});
 assert((await client().rpc('admin_update_product_draft',payload())).error);pass('anonymous edit denied');
 for(const role of ['customer','analyst','product_manager','owner']){
  const email='qa-draft-'+randomUUID()+'@example.com';
  const user=ok(await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{role:'owner'}})).user;users.push(user.id);
  if(role==='owner')await query(`select private.provision_owner(${uuid(user.id)},${literal(email)},'Disposable staging draft integration verification')`,false);
  else if(role!=='customer')await query(`insert into public.user_roles(user_id,role) values(${uuid(user.id)},${literal(role)})`,false);
  const c=client();ok(await c.auth.signInWithPassword({email,password}));
  assert.equal((await c.rpc('admin_update_product_draft',payload())).error?.code,'42501');pass(role+' AAL1 edit denied');
  if(process.argv.includes('--variants')){
   assert.equal((await c.rpc('admin_save_product_variant',{target_id:p,expected_updated_at:savedVersion,target_variant:randomUUID(),variant:{}})).error?.code,'42501');
   assert.equal((await c.rpc('admin_adjust_product_stock',{target_id:p,expected_updated_at:savedVersion,target_variant:randomUUID(),quantity_delta:1,adjustment_reason:'Rejected AAL1 attempt'})).error?.code,'42501');
  }
  if(process.argv.includes('--taxonomy'))assert.equal((await c.rpc('admin_save_catalogue_term',{term_type:'brand',target_id:randomUUID(),expected_updated_at:null,term:{name:'Rejected AAL1',slug:'rejected',published:false}})).error?.code,'42501');
  const factor=ok(await c.auth.mfa.enroll({factorType:'totp',friendlyName:'Disposable metadata test'}));
  ok(await c.auth.mfa.challengeAndVerify({factorId:factor.id,code:totpCode(factor.totp.secret)}));
  if(process.argv.includes('--taxonomy')){
   const {checkTaxonomy}=await import('./check-taxonomy-staging.mjs');
   await checkTaxonomy({c,role,product:p,version,trackTerm:t=>taxonomyIds.push(t),anonymous:client()});savedVersion=await version();
   pass(['owner','product_manager'].includes(role)?role+' real taxonomy CRUD, assignment, version conflict and referenced-delete protection':role+' taxonomy mutation denied');
  }
  if(process.argv.includes('--variants')){
   const {checkVariants}=await import('./check-variants-staging.mjs');
   await checkVariants({c,role,product:p,version});savedVersion=await version();
   pass(['owner','product_manager'].includes(role)?role+' actual SKU/pricing, zero initial stock, audited adjustments and negative/stale rejection':role+' SKU and stock mutations denied');
  }
  if(process.argv.includes('--gallery')){
   const {checkGallery}=await import('./check-gallery-staging.mjs');
   await checkGallery({c,user,role,product:p,version,trackPath:path=>storagePaths.push(path)});
   savedVersion=await version();
   pass(['owner','product_manager'].includes(role)?role+' private binary gallery linkage and Storage protection':role+' private upload and gallery mutation denied');
  }
  if(['customer','analyst'].includes(role))assert.equal((await c.rpc('admin_update_product_draft',payload())).error?.code,'42501');
  else{
   const before=savedVersion;
   const edited={...payload(),product_name:'Edited by '+role};
   const timestamp=ok(await c.rpc('admin_update_product_draft',edited));assert(timestamp);
   const row=(await query(`select name,description,status,updated_at from public.products where id=${uuid(p)}`))[0];
   assert.equal(row.name,'Edited by '+role);assert.equal(row.status,'draft');
   assert.equal((await c.rpc('admin_update_product_draft',{...edited,expected_updated_at:before})).error?.code,'PT409');
   savedVersion=row.updated_at;
   const noop=ok(await c.rpc('admin_update_product_draft',{...edited,expected_updated_at:savedVersion}));
   assert.equal(new Date(noop).getTime(),new Date(savedVersion).getTime());
   const audit=await query(`select actor_id,changes from public.admin_audit_logs where target_id=${uuid(p)} and actor_id=${uuid(user.id)} and action='product.draft_updated'`);
   assert.equal(audit.length,1);assert.equal(audit[0].changes.after.name,'Edited by '+role);
   assert((await c.rpc('admin_update_product_draft',{...payload(),product_name:' '})).error);
   pass(role+' real AAL2 audited edit, persistence, no-op, validation and stale-edit rejection');
   if(role==='owner'&&process.env.ADMIN_VERCEL_DEPLOYMENT_FILE){
    const {verifyHostedPreview}=await import('./hosted-preview-browser.mjs');
    const {verifyGenericDraftBrowser}=await import('./verify-generic-draft-browser.mjs');
    await verifyHostedPreview({email,password,secret:factor.totp.secret,product:p},verifyGenericDraftBrowser);
    pass('hosted browser password/TOTP login, actual edit, reload persistence, 390/1440 screenshots, logout protection');
    if(process.argv.includes('--gallery'))pass('hosted browser original-photo multi-upload, persisted alt text, cover order and gallery removal');
    if(process.argv.includes('--variants'))pass('hosted browser SKU/pricing creation, zero initial stock, actual stock adjustment and negative-stock rejection');
    if(process.argv.includes('--taxonomy'))pass('hosted browser brand creation/edit, taxonomy screenshots and persisted product-brand assignment');
   }
  }
  assert((await c.from('products').update({name:'Unaudited'}).eq('id',p)).error);
  ok(await c.auth.signOut());pass(role+' signed session logout and direct-write rejection');
 }
 success=true;
}finally{
 for(const p of products)await query(`${process.argv.includes('--taxonomy')?`delete from public.product_catalogue_terms where product_id=${uuid(p)};`:''}delete from public.product_media where product_id=${uuid(p)};delete from public.inventory_movements where variant_id in (select id from public.product_variants where product_id=${uuid(p)});delete from public.inventory where variant_id in(select id from public.product_variants where product_id=${uuid(p)});delete from public.product_variants where product_id=${uuid(p)};delete from public.admin_audit_logs where target_id=${uuid(p)};delete from public.products where id=${uuid(p)}`,false);
 if(process.argv.includes('--taxonomy')&&users.length){
  // Also discover UI-created records if a response was lost after commit.
  const actors=users.map(uuid).join(',');
  const discovered=await query(`select distinct t.id,t.kind from public.catalogue_terms t join public.admin_audit_logs l on l.target_id=t.id where l.actor_id in(${actors}) and l.action='catalogue.term_saved' union select distinct c.id,'category' as kind from public.categories c join public.admin_audit_logs l on l.target_id=c.id where l.actor_id in(${actors}) and l.action='catalogue.term_saved'`);
  taxonomyIds.push(...discovered);
  for(const term of new Map(taxonomyIds.map(t=>[t.id,t])).values())await query(`delete from public.admin_audit_logs where target_id=${uuid(term.id)};delete from public.${term.kind==='category'?'categories':'catalogue_terms'} where id=${uuid(term.id)}`,false);
 }
 for(const id of users){
  const listed=ok(await admin.storage.from('attires-product-drafts').list(id,{limit:1000}));
  storagePaths.push(...listed.map(o=>id+'/'+o.name));
 }
 if(storagePaths.length)ok(await admin.storage.from('attires-product-drafts').remove([...new Set(storagePaths)]));
 for(const id of users)ok(await admin.auth.admin.deleteUser(id));
 assert.deepEqual(await query("select u.id, array(select id::text from auth.mfa_factors where user_id=u.id and status='verified' order by id) as factors from auth.users u where email='attiresarena664@gmail.com'"),permanent);
 pass('generated fixtures removed; permanent Owner and verified MFA factors unchanged');
 await mkdir('artifacts/admin/generic-draft',{recursive:true});
 await writeFile('artifacts/admin/generic-draft/staging-results.json',JSON.stringify({projectRef,success,checks,productionAccessed:false},null,2)+'\n');
}
