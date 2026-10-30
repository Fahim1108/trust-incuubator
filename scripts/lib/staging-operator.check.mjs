import test from 'node:test';
import assert from 'node:assert/strict';
import {projectRef,projectUrl,getStagingPublishableKey,requireDevelopmentConfiguration} from './supabase-development.mjs';
test('operator tools are pinned to staging, not the historical Production project',()=>{
 assert.equal(projectRef,'jwccyndyaamodxjtjtfo');assert.equal(projectUrl,'https://jwccyndyaamodxjtjtfo.supabase.co');
});
test('refuses explicitly configured mismatching staging URLs',()=>{
 const previous=process.env.SUPABASE_STAGING_URL;
 try{process.env.SUPABASE_STAGING_URL='https://euoannuvovsbwxjqnriw.supabase.co';assert.throws(()=>requireDevelopmentConfiguration(),/does not match/);}finally{if(previous===undefined)delete process.env.SUPABASE_STAGING_URL;else process.env.SUPABASE_STAGING_URL=previous;}
});
test('test clients cannot use privileged or another project anon credentials',async()=>{
 const priorKey=process.env.SUPABASE_STAGING_PUBLISHABLE_KEY,priorToken=process.env.SUPABASE_ACCESS_TOKEN;
 try{
  process.env.SUPABASE_ACCESS_TOKEN='unit-only';
  for(const key of ['sb_secret_unit_forbidden','x.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.x','x.'+Buffer.from(JSON.stringify({role:'anon',ref:'euoannuvovsbwxjqnriw'})).toString('base64url')+'.x']){
   process.env.SUPABASE_STAGING_PUBLISHABLE_KEY=key;await assert.rejects(getStagingPublishableKey(),/privileged or foreign-project/);
  }
 }finally{for(const [name,value] of [['SUPABASE_STAGING_PUBLISHABLE_KEY',priorKey],['SUPABASE_ACCESS_TOKEN',priorToken]]){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});
