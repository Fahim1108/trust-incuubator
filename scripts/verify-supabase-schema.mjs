import {rejectLegacyRemoteTool} from './lib/legacy-remote-tool.mjs';
rejectLegacyRemoteTool();
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { query, management } from './lib/supabase-development.mjs';
const expected = ['profiles','role_permissions','user_roles','categories','products','product_variants','inventory','inventory_movements'];
const tables = await query("select c.relname as name,c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by 1");
assert.deepEqual(tables.map(t=>t.name).sort(), [...expected].sort());
assert(tables.every(t=>t.rls));
console.log('PASS: all eight expected public tables exist with RLS enabled');
const privateTable=await query("select c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname='owner_provisioning_log'");assert.equal(privateTable.length,1);assert(privateTable[0].rls);
const privateAccess=await query("select has_table_privilege('authenticated','private.owner_provisioning_log','SELECT') as read,has_table_privilege('authenticated','private.owner_provisioning_log','INSERT') as write,has_sequence_privilege('authenticated','private.owner_provisioning_log_id_seq','USAGE') as sequence");assert(Object.values(privateAccess[0]).every(v=>v===false));
const privateConstraints=await query("select count(*)::int as count,bool_and(convalidated) as validated from pg_constraint where conrelid='private.owner_provisioning_log'::regclass");assert.equal(privateConstraints[0].count,2);assert(privateConstraints[0].validated);
console.log('PASS: private owner audit table enables RLS, validates both constraints and denies customer table/sequence access');
const constraints = await query("select c.relname as name,count(*)::int as constraints,bool_and(x.convalidated) as validated from pg_constraint x join pg_class c on c.oid=x.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' group by 1");
const expectedConstraints={profiles:3,role_permissions:3,user_roles:3,categories:6,products:7,product_variants:9,inventory:5,inventory_movements:6};
assert(expected.every(name=>constraints.some(c=>c.name===name && c.constraints===expectedConstraints[name] && c.validated)));
console.log('PASS: all 42 expected table constraints exist and are validated');
const indexes=await query("select indexname from pg_indexes where schemaname='public'");
for(const name of ['categories_parent_idx','products_category_idx','products_listing_idx','inventory_movements_history_idx'])assert(indexes.some(i=>i.indexname===name));
console.log('PASS: all four explicit query/history indexes exist');
const policies = await query("select tablename,count(*)::int as policies from pg_policies where schemaname='public' group by tablename");
assert(expected.filter(n=>n!=='role_permissions').every(n=>policies.some(p=>p.tablename===n && p.policies>0)));
assert(!policies.some(p=>p.tablename==='role_permissions'));
console.log('PASS: expected read/profile policies exist; permission mapping remains deny-by-default');
const functions = await query("select n.nspname as schema,p.proname as name,p.prosecdef as definer,p.proconfig as config from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private')");
for (const [name,definer] of [['adjust_inventory',true],['has_permission',true],['handle_new_user',true],['provision_owner',false],['touch_updated_at',false]]) {
 const fn=functions.find(f=>f.name===name);assert(fn && fn.definer===definer && fn.config?.some(c=>c.startsWith('search_path=')));
}
console.log('PASS: five security-sensitive functions have expected privilege modes and fixed search paths');
const trigger = await query("select tgname from pg_trigger where tgrelid='auth.users'::regclass and tgname='attire_create_customer_profile' and not tgisinternal");assert.equal(trigger.length,1);
const access = await query(`select
 has_table_privilege('authenticated','public.user_roles','INSERT') as role_write,
 has_table_privilege('authenticated','public.product_variants','UPDATE') as price_write,
 has_table_privilege('authenticated','public.inventory','UPDATE') as stock_write,
 has_function_privilege('authenticated','private.provision_owner(uuid,text,text)','EXECUTE') as customer_owner,
 has_function_privilege('anon','private.provision_owner(uuid,text,text)','EXECUTE') as public_owner,
 has_function_privilege('anon','public.adjust_inventory(uuid,integer,text)','EXECUTE') as public_stock`);
assert(Object.values(access[0]).every(v=>v===false));
console.log('PASS: registration trigger exists; public/customer privileged writes and owner execution are denied');
const history = await management('/database/migrations');
const files = readdirSync(new URL('../supabase/migrations',import.meta.url)).filter(n=>n.endsWith('.sql')).sort();
assert.deepEqual(history.map(h=>`${h.version}_${h.name}.sql`).sort(),files);
const provenance=JSON.parse(readFileSync(new URL('../supabase/development-deployment.json',import.meta.url),'utf8'));
for (const item of provenance) assert.equal(createHash('sha256').update(readFileSync(new URL(`../supabase/migrations/${item.deployed_file}`,import.meta.url))).digest('hex'),item.sha256);
console.log('PASS: actual migration history matches local files and original SQL hashes');
console.log('Hosted schema verification passed. Auth/JWT/browser behavior is tested separately.');
