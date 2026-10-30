import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
for(const file of ['scripts/inventory/apply-development.mjs','scripts/test-customer-auth.mjs','scripts/test-supabase-development.mjs','scripts/test-supabase-staff.mjs','scripts/verify-supabase-schema.mjs']){
 test(file+' cannot execute historical remote operations',()=>{
  try{execFileSync(process.execPath,[file],{stdio:'pipe',timeout:10000});assert.fail('Legacy tool unexpectedly ran');}
  catch(error){assert.match(error.stderr?.toString()||'',/Safety block: this legacy remote tool is retired/);}
 });
}
