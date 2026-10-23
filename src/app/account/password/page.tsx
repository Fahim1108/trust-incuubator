import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/config/public-env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PasswordForm } from "../auth-forms";
export const dynamic = "force-dynamic";
export default async function PasswordPage() {
  if (!getSupabaseConfig()) redirect("/account");
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/account");
  return <main id="main" className="account"><Link href="/account">Back to account</Link><h1>Change password</h1><PasswordForm/></main>;
}
