"use client";
import Image from "next/image";
import { useActionState, useState, useTransition,useSyncExternalStore,useId } from "react";
import {Mail,LockKeyhole,Eye,EyeOff,ArrowRight} from 'lucide-react';
import {
  signInStaff,
  verifyStaffMfa,
  enrollStaffMfa,
} from "@/lib/admin/actions";
import type { AdminActionState } from "@/lib/admin/validation";
const rememberedEmailKey='aa-admin-remembered-email';
function readRememberedEmail(){try{const value=localStorage.getItem(rememberedEmailKey)||'';return value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?value:'';}catch{return '';}}
function subscribeRememberedEmail(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener('aa-admin-email-change',callback);return ()=>{window.removeEventListener('storage',callback);window.removeEventListener('aa-admin-email-change',callback);};}
function storeRememberedEmail(value:string){try{if(value)localStorage.setItem(rememberedEmailKey,value);else localStorage.removeItem(rememberedEmailKey);window.dispatchEvent(new Event('aa-admin-email-change'));return true;}catch{return false;}}
export function StaffSignIn() {
  const [state, action, pending] = useActionState(signInStaff, {});
  const storedEmail=useSyncExternalStore(subscribeRememberedEmail,readRememberedEmail,()=> '');
  const [typedEmail,setTypedEmail]=useState<string|null>(null);const [remember,setRemember]=useState<boolean|null>(null);
  const [visible,setVisible]=useState(false);const [help,setHelp]=useState(false);const [storageError,setStorageError]=useState('');const fieldId=useId();
  const email=typedEmail??storedEmail;const rememberEmail=remember??Boolean(storedEmail);
  return (
    <form action={action} className="aa-form aa-login-form" onSubmit={()=>{if(!storeRememberedEmail(rememberEmail?email.trim():''))setStorageError('This browser could not save your email preference. You can still sign in.');}}>
      <div><label htmlFor={fieldId+'-email'}>Email</label><div className="aa-login-input"><Mail size={18} strokeWidth={1.5} aria-hidden="true"/>
        <input
          id={fieldId+'-email'}
          name="email"
          type="email"
          value={email}
          onChange={event=>setTypedEmail(event.target.value)}
          placeholder="Enter your email address"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoComplete="username"
          maxLength={254}
          disabled={pending}
        />
      </div></div>
      <div><label htmlFor={fieldId+'-password'}>Password</label><div className="aa-login-input"><LockKeyhole size={18} strokeWidth={1.5} aria-hidden="true"/>
        <input
          id={fieldId+'-password'}
          name="password"
          type={visible?'text':'password'}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          maxLength={256}
          disabled={pending}
        />
        <button type="button" className="aa-login-eye" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(value=>!value)} disabled={pending}>{visible?<EyeOff size={18} strokeWidth={1.5}/>:<Eye size={18} strokeWidth={1.5}/>}</button>
      </div></div>
      <div className="aa-login-options"><label><input type="checkbox" checked={rememberEmail} onChange={event=>{setTypedEmail(email);setRemember(event.target.checked);if(!event.target.checked&&!storeRememberedEmail(''))setStorageError('Your browser could not clear the email preference.');}}/>Remember email</label><button type="button" className="aa-login-help-trigger" aria-expanded={help} aria-controls={fieldId+'-help'} onClick={()=>setHelp(value=>!value)}>Forgot password?</button></div>
      {help&&<p id={fieldId+'-help'} className="aa-login-help">Contact your store Owner to start the approved account-recovery process. Password recovery does not remove authenticator requirements. Never share your password or authenticator codes.</p>}
      {storageError&&<p role="status" className="aa-login-help">{storageError}</p>}
      {state.error && <p role="alert">{state.error}</p>}
      <button className="aa-login-submit" disabled={pending}>
        {pending ? "Signing in…" : <>Sign in securely <ArrowRight size={16} aria-hidden="true"/></>}
      </button>
    </form>
  );
}
export function StaffMfa({ factorId }: { factorId?: string }) {
  const [enrollment, setEnrollment] = useState<AdminActionState>({});
  const [enrolling, start] = useTransition();
  const [state, action, pending] = useActionState(verifyStaffMfa, {});
  const id = factorId || enrollment.factorId;
  return (
    <div className="aa-form">
      {!id && (
        <>
          <p>Set up an authenticator app to protect store administration.</p>
          <button
            disabled={enrolling}
            onClick={() =>
              start(async () => setEnrollment(await enrollStaffMfa()))
            }
          >
            {enrolling ? "Preparing…" : "Set up authenticator"}
          </button>
        </>
      )}
      {enrollment.error && <p role="alert">{enrollment.error}</p>}
      {enrollment.qr && (
        <>
          <p>Scan this QR code in your authenticator app. Keep it private.</p>
          <Image
            src={enrollment.qr}
            alt="Private authenticator enrollment QR code"
            width={220}
            height={220}
            unoptimized
          />
        </>
      )}
      {id && (
        <form action={action} className="aa-form">
          <input type="hidden" name="factorId" value={id} />
          <label>
            Authenticator code
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
            />
          </label>
          {state.error && <p role="alert">{state.error}</p>}
          <button disabled={pending}>
            {pending ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      )}
    </div>
  );
}
