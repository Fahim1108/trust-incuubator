import {rejectLegacyRemoteTool} from './lib/legacy-remote-tool.mjs';
rejectLegacyRemoteTool();
// Real hosted tests, confined to the explicitly authorized development reference.
// Never writes tokens, keys, passwords, cookies or email links to logs/artifacts.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { projectRef, projectUrl, management, query, getTestAdminKey, literal, uuid } from './lib/supabase-development.mjs';
const results=[];
async function check(name, operation) {
 try { await operation(); results.push({name,status:'passed'}); console.log(`PASS: ${name}`); }
 catch(error) { const status=error.blocked?'blocked':'failed'; results.push({name,status,error:error.code||error.name||'Error'}); console.error(`${status.toUpperCase()}: ${name} (${error.code||error.name||'Error'}; details withheld)`); }
}
function ok(result) { if(result.error) { const error=new Error('Supabase operation failed; details withheld'); error.code=result.error.code||'supabase_error';throw error; } return result.data; }
function deny(result) { assert(result.error,'Expected unauthorized operation to fail'); }
const opts={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client=()=>createClient(projectUrl,publicKey,opts);
const admin=createClient(projectUrl,await getTestAdminKey(),opts);
const password=randomBytes(32).toString('base64url');
const users=new Set(); const runId=randomUUID().replaceAll('-','');
const product=randomUUID(),variant=randomUUID(),draft=randomUUID();
const trigger=`phase1_${runId}`;
let browser,server; let customer,other,owner,analyst;
async function account() {
 const email=`attire-phase1-${randomUUID()}@example.com`;
 const generated=ok(await admin.auth.admin.generateLink({type:'signup',email,password}));
 assert(generated.user && generated.properties.hashed_token);users.add(generated.user.id);
 const sessionClient=client();
 const unconfirmed=await sessionClient.auth.signInWithPassword({email,password});deny(unconfirmed);
 const verified=ok(await sessionClient.auth.verifyOtp({token_hash:generated.properties.hashed_token,type:'signup'}));
 assert(verified.session && verified.user?.email_confirmed_at);
 return {email,user:verified.user,sessionClient,session:verified.session};
}
try {
 await check('project health and migration history use intended development project',async()=>{
  const health=await fetch(projectUrl+'/auth/v1/health',{headers:{apikey:publicKey}});assert.equal(health.status,200);
  const history=await management('/database/migrations');assert.equal(history.length,2);
 });
 await check('real generated signup links enforce and verify email confirmation',async()=>{
  customer=await account();other=await account();owner=await account();analyst=await account();
 });
 if(!customer||!other||!owner||!analyst) throw new Error('Fixture account creation failed; dependent checks not executed');
 await check('public customer signup',async()=>{
  const email=process.env.SUPABASE_TEST_SIGNUP_EMAIL||`attire-public-${runId}@example.com`;
  const existing=await query(`select id from auth.users where email=${literal(email)}`);
  if(existing.length){const error=new Error('Test email already belongs to an account; refusing to modify or remove it');error.blocked=true;error.code='test_email_in_use';throw error;}
  const result=await client().auth.signUp({email,password,options:{data:{role:'owner',is_admin:true}}});
  const created=await query(`select id from auth.users where email=${literal(email)}`);created.forEach(u=>users.add(u.id));
  if(result.error){const error=new Error('Public signup is blocked by the test recipient or email provider');error.blocked=true;error.code=result.error.code||'email_provider_error';throw error;}
  assert(result.data.user && !result.data.session);users.add(result.data.user.id);
 });
 await query(`select private.provision_owner(${uuid(owner.user.id)},${literal(owner.email)},'Authorized Phase 1 disposable verification owner');
 insert into public.user_roles(user_id,role) values (${uuid(analyst.user.id)},'analyst');
 insert into public.products(id,name,slug,status) values (${uuid(product)},'Phase 1 fixture',${literal('phase1-'+runId)},'published'),(${uuid(draft)},'Phase 1 draft',${literal('draft-'+runId)},'draft');
 insert into public.product_variants(id,product_id,sku,size,color,price_minor,active) values (${uuid(variant)},${uuid(product)},${literal('phase1-'+runId)},'M','Black',10000,true);
 insert into public.inventory(variant_id,on_hand) values (${uuid(variant)},1);`,false);
 await check('real customer profile isolation and cross-customer write denial',async()=>{
  const mine=ok(await customer.sessionClient.from('profiles').select('id'));assert.deepEqual(mine.map(p=>p.id),[customer.user.id]);
  assert.equal(ok(await customer.sessionClient.from('profiles').select('id').eq('id',other.user.id)).length,0);
  ok(await customer.sessionClient.from('profiles').update({display_name:'Phase 1 fixture'}).eq('id',customer.user.id));
  const changed=ok(await customer.sessionClient.from('profiles').update({display_name:'Forbidden'}).eq('id',other.user.id).select('id'));assert.equal(changed.length,0);
  assert.notEqual(ok(await other.sessionClient.from('profiles').select('display_name').single()).display_name,'Forbidden');
 });
 await check('user metadata cannot grant staff privileges',async()=>{
  ok(await customer.sessionClient.auth.updateUser({data:{role:'owner',is_admin:true}}));ok(await customer.sessionClient.auth.refreshSession());
  assert.equal(ok(await customer.sessionClient.from('user_roles').select('*')).length,0);
  deny(await customer.sessionClient.from('user_roles').insert({user_id:customer.user.id,role:'owner'}));
  deny(await customer.sessionClient.rpc('provision_owner',{target_user:customer.user.id,expected_email:customer.email,provisioning_reason:'Unauthorized attempt'}));
 });
 await check('anonymous/catalogue and staff draft-read policies use real JWTs',async()=>{
  const anonymous=client();deny(await anonymous.from('profiles').select('id'));
  assert.equal(ok(await anonymous.from('products').select('id').eq('id',draft)).length,0);
  assert.equal(ok(await anonymous.from('products').select('id').eq('id',product)).length,1);
  assert.equal(ok(await analyst.sessionClient.from('products').select('id').eq('id',draft)).length,1);
 });
 await check('customers and read-only analysts cannot mutate stock or prices',async()=>{
  deny(await customer.sessionClient.from('product_variants').update({price_minor:1}).eq('id',variant));
  deny(await customer.sessionClient.from('inventory').update({on_hand:50}).eq('variant_id',variant));
  for(const c of [customer.sessionClient,analyst.sessionClient])deny(await c.rpc('adjust_inventory',{target_variant:variant,quantity_delta:-1,adjustment_reason:'Unauthorized attempt'}));
 });
 await check('concurrent real PostgREST inventory transactions cannot oversell',async()=>{
  const outcomes=await Promise.all([1,2].map(()=>owner.sessionClient.rpc('adjust_inventory',{target_variant:variant,quantity_delta:-1,adjustment_reason:'Concurrent Phase 1 fixture adjustment'})));
  assert.equal(outcomes.filter(r=>!r.error).length,1);assert.equal(outcomes.filter(r=>r.error?.code==='22023').length,1);
  assert.equal(ok(await owner.sessionClient.from('inventory').select('on_hand').eq('variant_id',variant).single()).on_hand,0);
 });
 await check('real inventory RPC rolls back on audit-write failure',async()=>{
  await query(`create function private.${trigger}() returns trigger language plpgsql as $$ begin raise exception 'Phase 1 injected failure' using errcode='23514'; end $$;
  create trigger ${trigger} before insert on public.inventory_movements for each row when (new.variant_id=${uuid(variant)}) execute function private.${trigger}();`,false);
  try{
   const result=await owner.sessionClient.rpc('adjust_inventory',{target_variant:variant,quantity_delta:2,adjustment_reason:'Atomic rollback verification'});assert.equal(result.error?.code,'23514');
   assert.equal(ok(await owner.sessionClient.from('inventory').select('on_hand').eq('variant_id',variant).single()).on_hand,0);
  }finally{await query(`drop trigger ${trigger} on public.inventory_movements;drop function private.${trigger}();`,false);}
 });
 await check('refresh tokens work and forged signed-token requests fail',async()=>{
  const before=ok(await customer.sessionClient.auth.getSession()).session;
  const refreshed=ok(await customer.sessionClient.auth.refreshSession()).session;assert.notEqual(refreshed.refresh_token,before.refresh_token);
  assert.equal(ok(await customer.sessionClient.auth.getUser()).user.id,customer.user.id);
  const parts=refreshed.access_token.split('.');parts[2]='AAAA'+parts[2].slice(4);deny(await customer.sessionClient.auth.getUser(parts.join('.')));
 });
 await check('persisted SDK session survives a new client instance',async()=>{
  const store=new Map();const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  const first=createClient(projectUrl,publicKey,{auth:{persistSession:true,autoRefreshToken:false,storage}});
  ok(await first.auth.signInWithPassword({email:customer.email,password}));
  const second=createClient(projectUrl,publicKey,{auth:{persistSession:true,autoRefreshToken:false,storage}});
  assert.equal(ok(await second.auth.getUser()).user.id,customer.user.id);ok(await second.auth.signOut());
 });
 const site=new URL(process.env.SITE_URL);
 if(!['localhost','127.0.0.1'].includes(site.hostname)||site.protocol!=='http:')throw new Error('Browser runner requires the configured development loopback site; refusing external server startup');
 await check('browser login, HttpOnly cookies, reload persistence and proxy refresh',async()=>{
  const existing=await fetch(site.origin).then(()=>true).catch(()=>false);assert(!existing,'Refusing to reuse an unknown server on the configured port');
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname',site.hostname,'--port',site.port||'80'],{cwd:process.cwd(),env:{...process.env,NODE_OPTIONS:((process.env.NODE_OPTIONS||'')+' --use-env-proxy').trim()},stdio:'ignore'});
  let ready=false;for(let i=0;i<90;i++){try{if((await fetch(site.origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}assert(ready);
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true});
  const context=await browser.newContext();const page=await context.newPage();
  await page.goto(site.origin+'/account');
  const login=page.locator('form').filter({has:page.getByRole('heading',{name:'Welcome back'})});
  await login.getByLabel('Email',{exact:true}).fill(customer.email);await login.getByLabel('Password',{exact:true}).fill(password);await login.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.getByText('You are signed in.',{exact:true}).waitFor();await page.reload();await page.getByText('You are signed in.',{exact:true}).waitFor();
  let cookies=(await context.cookies()).filter(c=>c.name.startsWith(`sb-${projectRef}-auth-token`)&&!c.name.includes('verifier'));assert(cookies.length && cookies.every(c=>c.httpOnly));
  cookies.sort((a,b)=>a.name.localeCompare(b.name));const serialized=cookies.map(c=>c.value).join('');assert(serialized.startsWith('base64-'));
  const session=JSON.parse(Buffer.from(serialized.slice(7),'base64url').toString());assert(session.access_token && session.refresh_token);session.expires_at=Math.floor(Date.now()/1000)-60;
  const encoded='base64-'+Buffer.from(JSON.stringify(session)).toString('base64url');
  await context.clearCookies({name:new RegExp(`^sb-${projectRef}-auth-token`)});
  const chunks=encoded.match(/.{1,3180}/g);await context.addCookies(chunks.map((value,i)=>({name:`sb-${projectRef}-auth-token`+(chunks.length>1?'.'+i:''),value,domain:site.hostname,path:'/',httpOnly:true,sameSite:'Lax',secure:false})));
  await page.reload();await page.getByText('You are signed in.',{exact:true}).waitFor();
  const after=(await context.cookies()).filter(c=>c.name.startsWith(`sb-${projectRef}-auth-token`)).sort((a,b)=>a.name.localeCompare(b.name)).map(c=>c.value).join('');assert.notEqual(after,encoded);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('heading',{name:'Welcome back'}).waitFor();
  await page.goto(site.origin+'/account/password');await page.getByRole('heading',{name:'Welcome back'}).waitFor();
  const adminPage=await page.goto(site.origin+'/admin');assert.equal(adminPage.status(),404);
  await context.close();
 });
 await check('real recovery OTP grants a session for protected browser password update',async()=>{
  assert(browser,'Browser startup did not complete');
  const generated=ok(await admin.auth.admin.generateLink({type:'recovery',email:customer.email}));const collected=[];
  const recovery=createServerClient(projectUrl,publicKey,{cookieOptions:{httpOnly:true,sameSite:'lax',path:'/',secure:false},cookies:{getAll:()=>[],setAll:values=>collected.push(...values)}});
  ok(await recovery.auth.verifyOtp({type:'recovery',token_hash:generated.properties.hashed_token}));assert(collected.length);
  const context=await browser.newContext();await context.addCookies(collected.filter(c=>c.value).map(c=>({name:c.name,value:c.value,domain:site.hostname,path:'/',httpOnly:true,sameSite:'Lax',secure:false})));
  const page=await context.newPage();await page.goto(site.origin+'/account/password');const newPassword=randomBytes(32).toString('base64url');
  await page.getByLabel('New password',{exact:true}).fill(newPassword);await page.getByRole('button',{name:'Update password',exact:true}).click();await page.getByText('Your password has been updated.',{exact:true}).waitFor();
  deny(await client().auth.signInWithPassword({email:customer.email,password}));ok(await client().auth.signInWithPassword({email:customer.email,password:newPassword}));await context.close();
 });
 await check('staff-role revocation denies subsequent requests with an existing JWT',async()=>{
  await query(`delete from public.user_roles where user_id=${uuid(owner.user.id)} and role='owner'`,false);
  deny(await owner.sessionClient.rpc('adjust_inventory',{target_variant:variant,quantity_delta:1,adjustment_reason:'Revoked role verification'}));
 });
 await check('real logout clears the SDK session',async()=>{ok(await other.sessionClient.auth.signOut());assert.equal(ok(await other.sessionClient.auth.getSession()).session,null);});
 results.push({name:'SMTP email delivery and browser PKCE email-link callback',status:'unverified',reason:'Generated links verified Auth tokens without delivering email; full browser email callback not exercised'});
} catch(error) {
 results.push({name:'dependent hosted verification',status:'failed',error:error.code||error.name||'Error'});console.error('Hosted verification stopped; details withheld.');
} finally {
 if(browser)await browser.close();if(server)server.kill('SIGTERM');
 try{await query(`drop trigger if exists ${trigger} on public.inventory_movements;drop function if exists private.${trigger}();delete from public.inventory_movements where variant_id=${uuid(variant)};delete from public.inventory where variant_id=${uuid(variant)};delete from public.product_variants where id=${uuid(variant)};delete from public.products where id in (${uuid(product)},${uuid(draft)});`,false);
 for(const id of users)ok(await admin.auth.admin.deleteUser(id));
 console.log('Disposable development accounts and catalogue/inventory fixtures removed.');
 }catch{results.push({name:'fixture cleanup',status:'failed'});console.error('Fixture cleanup requires investigation; no secrets logged.');}
 writeFileSync('docs/SUPABASE_VERIFICATION_RESULTS.json',JSON.stringify({project_ref:projectRef,verification_scope:'real hosted development Supabase and local development browser',results},null,2)+'\n');
}
const counts=Object.fromEntries(['passed','failed','blocked','unverified'].map(status=>[status,results.filter(r=>r.status===status).length]));console.log('Results:',JSON.stringify(counts));
process.exitCode=counts.failed?1:counts.blocked||counts.unverified?2:0;
