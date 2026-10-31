import Image from "next/image";
import Link from "next/link";
import { StaffSignIn } from "@/components/admin/access/StaffForms";
import { adminConfiguration } from "@/lib/admin/supabase";
import {ShieldCheck,LockKeyhole,ArrowLeft} from 'lucide-react';
export default function StaffSignInPage() {
  return (
    <main id="main" className="aa-login-layout"><section className="aa-login-panel" aria-labelledby="staff-welcome">
      <div className="aa-login-access"><ShieldCheck size={16} strokeWidth={1.6} aria-hidden="true"/>Staff Access Only</div>
      <Image
        src="/brand/logo-maroon.png"
        alt="Official Attires Arena logo"
        className="aa-login-logo"
        width={132}
        height={127}
        unoptimized
      />
      <header className="aa-login-heading"><h1 id="staff-welcome">Welcome back</h1><p>Sign in to your store administration panel</p></header>
      {adminConfiguration() ? (
        <StaffSignIn />
      ) : (
        <p role="alert">
          Development Supabase configuration is missing. Contact the project
          operator.
        </p>
      )}
      <div className="aa-login-security"><LockKeyhole size={19} strokeWidth={1.6} aria-hidden="true"/><p>Secure staff access. Customer accounts cannot access administration. Authenticator verification is required.</p></div>
      <Link className="aa-login-return" href="/"><ArrowLeft size={14} aria-hidden="true"/>Return to the store</Link>
    </section></main>
  );
}
