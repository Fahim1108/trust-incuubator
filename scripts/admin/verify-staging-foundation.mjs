// Read-only real staging inspection; no Production database requests.
import assert from 'node:assert/strict';
import {query,projectRef,projectUrl} from '../lib/supabase-development.mjs';
import {assertRemoteDatabaseIsolation} from '../lib/deployment-isolation.mjs';
await assertRemoteDatabaseIsolation(projectUrl);
const history=await query('select version from supabase_migrations.schema_migrations order by version');
const galleryInstalled=history.some(r=>r.version==='20261030000400');
const expected=['profiles','role_permissions','user_roles','categories','products','product_variants','inventory','inventory_movements','thrift_intake','product_reviews','review_moderation_log','admin_audit_logs',...(galleryInstalled?['product_media']:[])].sort();
const tables=await query("select c.relname as name,c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by 1");
assert.deepEqual(tables.map(t=>t.name),expected);assert(tables.every(t=>t.rls));
assert(history.some(r=>r.version==='20261030000100'));assert(history.some(r=>r.version==='20261030000200'));
const permission=await query("select prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and proname='has_permission'");assert(permission[0].prosrc.includes('aal2'));
const constraints=await query("select count(*)::int as count, bool_and(convalidated) as validated from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname in ('public','private')");assert(constraints[0].validated);
const privileges=await query(`select has_table_privilege('authenticated','public.thrift_intake','UPDATE') as direct_intake_write,has_table_privilege('authenticated','public.user_roles','INSERT') as role_write,has_function_privilege('anon','public.admin_catalogue_snapshot()','EXECUTE') as anonymous_admin,has_function_privilege('authenticated','private.provision_owner(uuid,text,text)','EXECUTE') as public_owner_provision`);
assert(Object.values(privileges[0]).every(v=>v===false));
const mutations=await query("select proname,prosecdef,proconfig,prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in ('adjust_inventory','moderate_product_review','admin_save_thrift_draft','admin_create_product_draft')");assert.equal(mutations.length,4);assert(mutations.every(m=>m.prosecdef&&m.prosrc.includes('private.require_admin')&&m.proconfig.some(c=>c.startsWith('search_path='))));
const bucket=await query("select public,file_size_limit,allowed_mime_types from storage.buckets where id='attires-product-drafts'");assert.equal(bucket.length,1);assert.equal(bucket[0].public,false);assert.equal(bucket[0].file_size_limit,5242880);assert.deepEqual(bucket[0].allowed_mime_types,['image/jpeg','image/png','image/webp']);
const policies=await query("select policyname,qual,with_check from pg_policies where schemaname='storage' and policyname like 'attire_draft_media_%'");assert.equal(policies.length,4);assert(policies.every(p=>(p.qual||p.with_check).includes('aal2')));
if(galleryInstalled){
 const gallery=await query("select prosecdef,proconfig,prosrc from pg_proc where oid='public.admin_edit_product_gallery(uuid,timestamptz,jsonb)'::regprocedure");
 assert(gallery[0].prosecdef&&gallery[0].prosrc.includes('private.require_admin')&&gallery[0].proconfig.includes('search_path=\"\"'));
 const restrictive=await query("select count(*)::int as n from pg_policies where schemaname='storage' and policyname in ('product_media_no_linked_delete','product_media_no_linked_update') and permissive='RESTRICTIVE'");assert.equal(restrictive[0].n,2);
}
const state=await query("select (select count(*)::int from auth.users) as auth_users,(select count(*)::int from public.user_roles) as staff_assignments,(select count(*)::int from public.products) as products,(select count(*)::int from storage.objects where bucket_id='attires-product-drafts') as draft_objects");
console.log(JSON.stringify({stagingProject:projectRef,verified:true,publicTables:tables.length,migrations:history.length,validatedConstraints:constraints[0].count,storagePolicies:policies.length,privateDraftBucket:true,state:state[0]}));
