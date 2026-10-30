import {rejectLegacyRemoteTool} from './lib/legacy-remote-tool.mjs';
rejectLegacyRemoteTool();
// Interactive customer-only test. No Management API, admin key, SQL or admin methods.
// Password and session remain in process memory; nothing sensitive is printed or saved.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';

for (const name of ['SUPABASE_ACCESS_TOKEN','SUPABASE_DB_PASSWORD','DATABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY']) delete process.env[name];
const expected='https://euoannuvovsbwxjqnriw.supabase.co';
if(process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'')!==expected)throw new Error('Refusing a different project');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!key?.startsWith('sb_publishable_'))throw new Error('A public publishable key is required');
if (!process.stdin.isTTY) { console.error('INTERACTIVE_TERMINAL_REQUIRED: start this customer test in a persistent TTY; no signup was attempted.'); process.exit(2); }
const lines=createInterface({input:process.stdin,terminal:false});
const iterator=lines[Symbol.asyncIterator]();
const read=async()=>{const next=await iterator.next();if(next.done)throw new Error('Customer test input closed');return next.value.trim();};
let email=process.env.SUPABASE_TEST_SIGNUP_EMAIL?.trim();
if(!email){console.log('WAITING_FOR_TEST_EMAIL: send only a dedicated, previously unused email address you control on stdin.');email=await read();}
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('A valid test mailbox is required');
const client=createClient(expected,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const password=randomBytes(32).toString('base64url');
try {
 const signup=await client.auth.signUp({email,password});
 if(signup.error){console.error('SIGNUP_BLOCKED: '+(signup.error.code||'auth_error')+'. No signup success is claimed.');process.exitCode=1;}
 else if(!signup.data.user || signup.data.user.identities?.length===0){console.error('SIGNUP_NOT_CONFIRMED: this may already be an existing account; use a fresh dedicated mailbox. No password reset or administrator operation was performed.');process.exitCode=2;}
 else {
  console.log('SIGNUP_ACCEPTED: public customer Auth request accepted; no staff role or metadata requested.');
  if(!signup.data.session){
   console.log('EMAIL_VERIFICATION_REQUIRED: open the confirmation message in your mailbox and select Confirm. Do not send its link, code, or tokens. After clicking, send VERIFIED on stdin. A failed localhost redirect does not by itself mean confirmation failed.');
   let confirmed=false;
   while(!confirmed){
    const command=(await read()).toUpperCase();
    if(command==='CANCEL'){console.log('TEST_CANCELLED: no login success claimed.');process.exitCode=2;break;}
    if(command!=='VERIFIED'){console.log('WAITING_FOR_VERIFICATION: send VERIFIED after opening the confirmation email, or CANCEL.');continue;}
    const login=await client.auth.signInWithPassword({email,password});
    if(login.error){console.log('LOGIN_NOT_VERIFIED: '+(login.error.code||'auth_error')+'. No success claimed. Check confirmation before another attempt.');continue;}
    confirmed=true;
   }
   if(!confirmed){lines.close();process.exit(process.exitCode||2);}
  }else{
   console.log('EMAIL_CONFIRMATION_NOT_REQUIRED_BY_PROJECT: signup returned a session; email verification is not counted as tested.');
   const login=await client.auth.signInWithPassword({email,password});if(login.error)throw new Error('Customer password login failed');
  }
  const identity=await client.auth.getUser();
  if(identity.error || identity.data.user?.id!==signup.data.user.id)throw new Error('Validated customer identity did not match signup');
  console.log('PASS: real customer password login and Auth-validated identity');
  console.log('Email confirmation verified by Auth:',Boolean(identity.data.user.email_confirmed_at));
  const roles=await client.from('user_roles').select('role');
  if(roles.error || roles.data.length!==0)throw new Error('New customer role isolation did not pass');
  console.log('PASS: dedicated customer has no assigned staff roles');
  const refresh=await client.auth.refreshSession();if(refresh.error || !refresh.data.session)throw new Error('Customer session refresh failed');
  console.log('PASS: real customer session refresh');
  const logout=await client.auth.signOut();if(logout.error)throw new Error('Customer logout failed');
  console.log('PASS: customer logout. Test account remains a customer; no admin credentials were used.');
 }
}catch{console.error('CUSTOMER_TEST_INCOMPLETE: operation failed; sensitive details withheld.');process.exitCode=1;}
finally{lines.close();}
