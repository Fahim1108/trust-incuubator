'use server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminClient} from './supabase';
import {publicSupabaseConfiguration} from '../supabase-public';
import {isProductionStorefront} from '../storefront-policy';
import projects from '@/config/supabase-projects.json';
import {setupSessionSchema,setupPasswordSchema} from './setup-validation';
export type SetupState={error?:string;email?:string;success?:string};
const intentCookie='aa-staging-password-setup';
function stagingOnly(){return !isProductionStorefront()&&publicSupabaseConfiguration()?.url===`https://${projects.staging}.supabase.co`;}
export async function acceptSetupSession(input:unknown):Promise<SetupState>{
 if(!stagingOnly())return {error:'Account setup is available only in Staging.'};
 const parsed=setupSessionSchema.safeParse(input);
 if(!parsed.success)return {error:'The invitation is missing or invalid. Request a new invitation.'};
 const client=await adminClient(true);
 const result=await client.auth.setSession({access_token:parsed.data.accessToken,refresh_token:parsed.data.refreshToken});
 if(result.error)return {error:'This invitation has expired or is invalid. Request a new invitation.'};
 const verified=await client.auth.getUser();
 const user=verified.data.user;
 if(verified.error||!user||user.is_anonymous||!user.email_confirmed_at){
  await client.auth.signOut({scope:'local'});
  return {error:'A confirmed, non-anonymous Staging identity is required.'};
 }
 const assurance=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(assurance.error||assurance.data.nextLevel==='aal2'&&assurance.data.currentLevel!=='aal2'){
  await client.auth.signOut({scope:'local'});
  return {error:'This account already requires MFA. Sign in and verify your authenticator before changing its password.'};
 }
 (await cookies()).set(intentCookie,user.id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/admin/accept-invite',maxAge:900});
 return {email:user.email};
}
export async function setInitialStagingPassword(_:SetupState,form:FormData):Promise<SetupState>{
 if(!stagingOnly())return {error:'Account setup is available only in Staging.'};
 const parsed=setupPasswordSchema.safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:'Use matching passwords of 12–128 characters.'};
 const client=await adminClient(true);
 const verified=await client.auth.getUser();const user=verified.data.user;const store=await cookies();
 if(verified.error||!user||user.is_anonymous||!user.email_confirmed_at||store.get(intentCookie)?.value!==user.id)return {error:'Your setup session expired. Reopen your invitation or request a new one.'};
 const assurance=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(assurance.error||assurance.data.nextLevel==='aal2'&&assurance.data.currentLevel!=='aal2')return {error:'Authenticator verification is required before changing this account password.'};
 const result=await client.auth.updateUser({password:parsed.data.password});
 if(result.error)return {error:'Password could not be saved. Use a stronger password or request a new setup link.'};
 store.set(intentCookie,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/admin/accept-invite',maxAge:0});
 const roles=await client.from('user_roles').select('role').eq('user_id',user.id);
 if(!roles.error&&roles.data?.length)redirect('/admin/mfa');
 return {success:'Password saved. Your confirmed account is awaiting authorized Staging Owner activation. After activation, sign in and enroll your authenticator.'};
}
