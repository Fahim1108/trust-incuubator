// Disposable verification only. Never invokes email delivery or touches Production.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {chromium} from '@playwright/test';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {projectUrl,getStagingPublishableKey,getTestAdminKey,query,uuid,literal} from '../lib/supabase-development.mjs';
import {verifyHostedPreview} from './hosted-preview-browser.mjs';
import {totpCode} from './verify-browser.mjs';
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const publicKey=await getStagingPublishableKey();
const operator=createClient(projectUrl,await getTestAdminKey(),options);
const auth=createClient(projectUrl,publicKey,options);
const email=`attires-setup-test-${randomUUID()}@example.com`;
const password=randomBytes(32).toString('base64url');
let id;const checks=[];let cleaned=false;
function ok(result){if(result.error)throw new Error('Staging provider rejected operation: '+(result.error.code||result.error.status||'unknown'));return result.data;}
function pass(message){checks.push(message);console.log('PASS: '+message);}
try{
 const invite=ok(await operator.auth.admin.generateLink({type:'invite',email}));
 id=invite.user.id;
 const session=ok(await auth.auth.verifyOtp({token_hash:invite.properties.hashed_token,type:'invite'})).session;
 assert(session);pass('real disposable invitation verified without sending email');
 await verifyHostedPreview({},async({baseURL,accessURL,proxy})=>{
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,...(proxy?{proxy}:{})});
  const context=await browser.newContext({baseURL});const page=await context.newPage();
  try{
   await page.goto(accessURL);
   await page.goto('/admin/accept-invite#'+new URLSearchParams({type:'invite',access_token:session.access_token,refresh_token:session.refresh_token}));
   await page.getByLabel('New Staging password',{exact:true}).waitFor();
   assert.equal(new URL(page.url()).hash,'');
   const cookies=await context.cookies();assert(cookies.some(c=>c.name==='aa-staging-password-setup'&&c.httpOnly&&c.secure&&c.sameSite==='Strict'));
   await page.setViewportSize({width:390,height:844});
   await mkdir('artifacts/admin/owner-setup',{recursive:true});
   await page.screenshot({path:'artifacts/admin/owner-setup/setup-390.png',fullPage:true});
   await page.getByLabel('New Staging password',{exact:true}).fill(password);
   await page.getByLabel('Confirm Staging password',{exact:true}).fill('different-but-long-password');
   await page.getByRole('button',{name:'Set Staging password',exact:true}).click();
   await page.getByRole('alert').filter({hasText:'Use matching passwords'}).waitFor();
   await page.getByLabel('Confirm Staging password',{exact:true}).fill(password);
   await page.getByRole('button',{name:'Set Staging password',exact:true}).click();
   await page.getByRole('status').filter({hasText:'Password saved.'}).waitFor();
   ok(await auth.auth.signInWithPassword({email,password}));
   assert.equal((await query(`select count(*)::int n from public.user_roles where user_id=${uuid(id)}`))[0].n,0);
   pass('browser password setup succeeds; URL credentials removed; no automatic role grant');
   await query(`select private.provision_owner(${uuid(id)},${literal(email)},'Disposable staging invitation and TOTP verification only')`,false);
   await page.goto('/admin/login');
   await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);
   await page.getByRole('button',{name:'Sign in securely'}).click();await page.waitForURL('**/admin/mfa');
   await page.getByRole('button',{name:'Set up authenticator',exact:true}).click();
   const image=page.getByAltText('Private authenticator enrollment QR code');await image.waitFor();
   const png=PNG.sync.read(await image.screenshot());const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert(decoded);
   const secret=new URL(decoded.data).searchParams.get('secret');assert(secret);
   await page.getByLabel('Authenticator code').fill(totpCode(secret));await page.getByRole('button',{name:'Verify and continue',exact:true}).click();
   await page.waitForURL(u=>u.pathname==='/admin');await page.getByRole('heading',{name:'Store overview',exact:true}).waitFor();
   pass('invited account with secure Owner assignment must enroll and verify real TOTP before dashboard');
   // Existing MFA cannot be sidestepped by presenting a lower-assurance setup session.
   const aal1=ok(await auth.auth.signInWithPassword({email,password})).session;assert(aal1);
   await page.goto('/admin/accept-invite#'+new URLSearchParams({type:'recovery',access_token:aal1.access_token,refresh_token:aal1.refresh_token}));
   await page.getByRole('alert').filter({hasText:'This account already requires MFA.'}).waitFor();
   assert.equal(await page.locator('input[type=password]').count(),0);
   pass('setup route cannot bypass already enrolled MFA using an AAL1 session');
  }finally{await context.close();await browser.close();}
 });
}catch(error){console.error('Owner setup verification failed: '+String(error.message).split('\n')[0].replace(/#.*$/,'#[redacted]').replace(/([?&]_vercel_share=)[A-Za-z0-9_-]+/g,'$1[redacted]').replaceAll(password,'[redacted]'));process.exitCode=1;}
finally{
 if(id){const result=await operator.auth.admin.deleteUser(id);if(result.error){console.error('Disposable setup account cleanup failed');process.exitCode=1;}else cleaned=true;}
 await mkdir('artifacts/admin/owner-setup',{recursive:true});
 await writeFile('artifacts/admin/owner-setup/results.json',JSON.stringify({scope:'real disposable staging invite, own-password setup and TOTP browser flow',checks,cleaned,success:!process.exitCode},null,2)+'\n');
}
