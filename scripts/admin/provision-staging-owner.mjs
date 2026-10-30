// Explicitly authorized permanent STAGING identity only. No passwords generated.
import {createClient} from '@supabase/supabase-js';
import {projectRef,projectUrl,query,literal,uuid,getTestAdminKey} from '../lib/supabase-development.mjs';
const email='attiresarena664@gmail.com';
const redirectTo='https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/accept-invite';
const modes=process.argv.slice(2);if(modes.some(m=>!['--invite','--activate'].includes(m))||modes.length>1)throw new Error('Choose status, --invite or --activate');
async function status(){
 const rows=await query(`select id,email,email_confirmed_at is not null as email_confirmed,(encrypted_password is not null and encrypted_password<>'') as has_password,invited_at is not null as invited,last_sign_in_at,(select coalesce(array_agg(role::text),'{}') from public.user_roles where user_id=u.id) as roles,exists(select 1 from auth.mfa_factors f where f.user_id=u.id and f.factor_type='totp' and f.status='verified') as totp_verified from auth.users u where lower(email)=${literal(email)}`);
 if(rows.length>1)throw new Error('Ambiguous designated staging email; refusing all changes');
 return rows[0]||null;
}
let account=await status();
if(modes.includes('--invite')){
 if(account){console.log('Existing Staging account retained; no duplicate or additional invitation created.');}
 else{
  const client=createClient(projectUrl,await getTestAdminKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  const result=await client.auth.admin.inviteUserByEmail(email,{redirectTo});
  if(result.error){console.log(JSON.stringify({invitationAccepted:false,errorCode:result.error.code,status:result.error.status}));process.exitCode=1;}
  else console.log('Staging invitation accepted by Supabase. Check the designated mailbox; delivery is not yet confirmed.');
  account=await status();
 }
}
if(modes.includes('--activate')){
 if(!account?.email_confirmed||!account.has_password)throw new Error('Complete the email invitation and set your own Staging password before Owner activation');
 await query(`select private.provision_owner(${uuid(account.id)},${literal(email)},'User explicitly approved permanent Staging Owner activation via secure email setup; Production untouched')`,false);
 account=await status();
 if(!account.roles.includes('owner'))throw new Error('Owner assignment could not be verified');
}
console.log(JSON.stringify({projectRef,designatedEmail:email,account,productionAccessed:false}));
