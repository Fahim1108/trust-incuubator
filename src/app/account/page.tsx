import Link from "next/link";
import { getSupabaseConfig } from "@/lib/config/public-env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { AuthForms } from "./auth-forms";
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  if (!getSupabaseConfig()) return <main id="main" className="account"><Link href="/">ATTIRE ARENA</Link><h1>Your account</h1><p>Account access is not available yet. Please check back soon.</p></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return <main id="main" className="account"><Link href="/">ATTIRE ARENA</Link><h1>Your account</h1><AuthForms/></main>;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  return <main id="main" className="account"><Link href="/">ATTIRE ARENA</Link><h1>Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}.</h1>{profileError && <p>Your profile is temporarily unavailable.</p>}<p>You are signed in.</p><p><Link href="/account/password">Change password</Link></p><form action={signOut}><button>Sign out</button></form></main>;
}
