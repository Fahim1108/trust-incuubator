import Image from "next/image";
import Link from "next/link";
import { StaffSignIn } from "@/components/admin/access/StaffForms";
import { adminConfiguration } from "@/lib/admin/supabase";
export default function StaffSignInPage() {
  return (
    <main id="main" className="aa-auth">
      <Image
        src="/brand/logo-maroon.png"
        alt="Attires Arena"
        width={94}
        height={90}
      />
      <p className="aa-eyebrow">Store administration</p>
      <h1>Welcome back</h1>
      <p>Staff access only. Customer accounts cannot access administration.</p>
      {adminConfiguration() ? (
        <StaffSignIn />
      ) : (
        <p role="alert">
          Development Supabase configuration is missing. Contact the project
          operator.
        </p>
      )}
      <Link href="/">Return to the store</Link>
    </main>
  );
}
