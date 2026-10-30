// Staging only. Default executes DDL inside a transaction and rolls it back.
import {readFile,readdir} from 'node:fs/promises';
import {query,literal,projectRef,projectUrl} from '../lib/supabase-development.mjs';
import {assertRemoteDatabaseIsolation} from '../lib/deployment-isolation.mjs';
import {buildStagingMigrationPlan} from '../lib/staging-migrations.mjs';
await assertRemoteDatabaseIsolation(projectUrl);
const exists=await query("select to_regclass('supabase_migrations.schema_migrations') is not null as present");
const history=exists[0].present?await query('select version from supabase_migrations.schema_migrations order by version'):[];
const files=[];
for(const name of (await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql'))){
 files.push({name,sql:await readFile('supabase/migrations/'+name,'utf8')});
}
const pending=buildStagingMigrationPlan(files,history.map(r=>r.version));
if(!pending.length){console.log('Staging migrations already current.');process.exit(0);}
// The first migration on a fresh Supabase project also creates CLI-compatible
// migration history. This is never run against the Production project.
let body=`create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations(version text primary key,statements text[],name text);
`;
for(const migration of pending){
 body+=migration.sql+'\n';
 body+=`insert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(migration.version)},${literal(migration.name)},ARRAY[${literal(migration.original)}]);\n`;
}
console.log(JSON.stringify({stagingProject:projectRef,pending:pending.map(p=>p.version)}));
await query('begin;\n'+body+'\nrollback;',false);
console.log('Staging migration dry run passed. No changes persisted.');
if(process.argv.includes('--apply')){
 await query('begin;\n'+body+'\ncommit;',false);
 console.log('Staging migrations applied atomically; Production untouched.');
}
