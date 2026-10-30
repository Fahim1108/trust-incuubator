'use client';
import {useActionState,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {acceptSetupSession,setInitialStagingPassword,type SetupState} from '@/lib/admin/setup-actions';
import {setupFragment} from '@/lib/admin/setup-validation';
export function AcceptInviteForm(){
 const started=useRef(false);const [session,setSession]=useState<SetupState|null>(null);
 const [state,action,pending]=useActionState(setInitialStagingPassword,{});
 useEffect(()=>{
  if(started.current)return;started.current=true;
  const parsed=setupFragment(window.location.hash);
  // Remove credentials before any navigation; never use localStorage or logs.
  window.history.replaceState(null,'',window.location.pathname);
  const request=parsed?acceptSetupSession(parsed):Promise.resolve({error:'Open the secure invitation from your email. If the link expired, request a new invitation.'});
  void request.then(setSession).catch(()=>setSession({error:'Secure setup is unavailable. Please retry with a fresh invitation.'}));
 },[]);
 if(!session)return <p role="status">Verifying your Staging invitation…</p>;
 if(session.error)return <><p role="alert">{session.error}</p><Link href="/admin/login">Staff sign-in</Link></>;
 return <><p>Set a separate Staging password for <strong>{session.email}</strong>. Do not reuse your Production password.</p>
 {state.success?<><p role="status">{state.success}</p><Link href="/admin/login">Continue to Staging sign-in</Link></>:<form action={action} className="aa-form">
 <label>New Staging password<input type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password"/></label>
 <label>Confirm Staging password<input type="password" name="confirmPassword" required minLength={12} maxLength={128} autoComplete="new-password"/></label>
 {state.error&&<p role="alert">{state.error}</p>}
 <button disabled={pending}>{pending?'Saving securely…':'Set Staging password'}</button>
 </form>}
 <p>Owner access is assigned separately by an authorized operator. Administration requires TOTP MFA.</p></>;
}
