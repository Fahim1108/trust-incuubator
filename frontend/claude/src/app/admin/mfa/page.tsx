import { redirect } from "next/navigation";
import { staffSession } from "@/lib/admin/access";
import { StaffMfa } from "@/components/admin/access/StaffForms";
import { signOutStaff } from "@/lib/admin/actions";
export default async function MfaPage() {
  const session = await staffSession(false);
  if (session.aal === "aal2") redirect("/admin");
  const factors = await session.client.auth.mfa.listFactors();
  if (factors.error)
    throw new Error("Authenticator settings unavailable. Please retry.");
  return (
    <main id="main" className="aa-auth">
      <p className="aa-eyebrow">Attires Arena / Security</p>
      <h1>Two-step verification</h1>
      <StaffMfa factorId={factors.data.totp[0]?.id} />
      <form action={signOutStaff}>
        <button className="aa-secondary">Sign out</button>
      </form>
    </main>
  );
}
