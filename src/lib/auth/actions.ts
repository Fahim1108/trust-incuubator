"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/config/public-env";
import { credentialsSchema, emailSchema, passwordSchema } from "./validation";
import { getAuthSiteOrigin } from "./site-url";
export type AuthState = { message: string };
const unavailable = { message: "Account access is temporarily unavailable." };
export async function signIn(_previous: AuthState, form: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return unavailable;
  // Login accepts existing passwords shorter than the new-registration policy.
  const input = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).safeParse(Object.fromEntries(form));
  if (!input.success) return { message: "Enter a valid email and password." };
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  const { error } = await supabase.auth.signInWithPassword(input.data);
  if (error) return { message: "Unable to sign in. Check your details and email confirmation." };
  redirect("/account");
}
export async function register(_previous: AuthState, form: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return unavailable;
  const input = credentialsSchema.safeParse(Object.fromEntries(form));
  if (!input.success) return { message: "Use a valid email and a password of 12–128 characters." };
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  // Explicit allowlist: role, permissions and user-supplied metadata are never forwarded.
  const origin = getAuthSiteOrigin();
  if (!origin) return unavailable;
  const { error } = await supabase.auth.signUp({ email: input.data.email, password: input.data.password, options: { emailRedirectTo: `${origin}/auth/callback` } });
  if (error) return { message: "Unable to process registration. Please try again later." };
  return { message: "If registration is available for this email, check your inbox to continue." };
}
export async function signOut(): Promise<void> {
  if (!getSupabaseConfig()) redirect("/account");
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Unable to sign out. Please retry.");
  redirect("/account");
}
export async function requestPasswordReset(_previous: AuthState, form: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return unavailable;
  const email = emailSchema.safeParse(form.get("email"));
  const origin = getAuthSiteOrigin();
  if (!origin) return unavailable;
  if (!email.success) return { message: "Enter a valid email address." };
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  // Always use configured canonical origin, never the incoming Host header.
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${origin}/auth/callback?next=/account/password` });
  return { message: "If this account exists, password reset instructions will be sent." };
}
export async function updatePassword(_previous: AuthState, form: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return unavailable;
  const password = passwordSchema.safeParse(form.get("password"));
  if (!password.success) return { message: "Use a password of 12–128 characters." };
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  const { data: { user }, error: identityError } = await supabase.auth.getUser();
  if (identityError || !user) return { message: "Sign in using your password reset email first." };
  const { error } = await supabase.auth.updateUser({ password: password.data });
  return { message: error ? "Unable to update your password. Please request a new reset link." : "Your password has been updated." };
}
