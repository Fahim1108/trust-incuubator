import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {buildStagingMigrationPlan} from './staging-migrations.mjs';
test('fresh staging includes every repository migration, preserving SQL function blocks',()=>{
 const result=buildStagingMigrationPlan([{name:'20261024000000_foundation.sql',sql:'-- comment\nbegin;\ncreate function f() returns void as $$\nbegin\n null;\nend $$ language plpgsql;\ncommit;'}],[]);
 assert.equal(result.length,1);assert(!/^begin;$/mi.test(result[0].sql));assert(!/^commit;$/mi.test(result[0].sql));assert(result[0].sql.includes('begin\n null;'));
});
test('only missing versions are planned in filename order',()=>{
 const files=['20261024000002_second.sql','20261024000001_first.sql'].map(name=>({name,sql:'select 1;'}));
 assert.deepEqual(buildStagingMigrationPlan(files,['20261024000001']).map(p=>p.version),['20261024000002']);
});
test('unknown history and duplicate migration versions fail closed',()=>{
 const file={name:'20261024000000_first.sql',sql:'select 1;'};
 assert.throws(()=>buildStagingMigrationPlan([file],['20260101000000']),/unknown migrations/);
 assert.throws(()=>buildStagingMigrationPlan([file,{...file,name:'20261024000000_duplicate.sql'}],[]),/Duplicate/);
});
test('all actual repository migrations can be prepared for a fresh staging project',async()=>{
 const names=(await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql'));
 const files=await Promise.all(names.map(async name=>({name,sql:await readFile('supabase/migrations/'+name,'utf8')})));
 const plan=buildStagingMigrationPlan(files,[]);assert.equal(plan.length,names.length);assert(plan.some(m=>m.name==='foundation'));assert(plan.every(m=>!/^\s*(begin|commit);\s*$/mi.test(m.sql)));
});
