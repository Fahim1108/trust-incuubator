"use client";
import { useActionState } from "react";
import { signIn, register, requestPasswordReset, updatePassword, type AuthState } from "@/lib/auth/actions";
const empty: AuthState = { message: "" };
function CredentialsForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState(mode === "login" ? signIn : register, empty);
  return <form action={action} className="auth-form"><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 12 : 1} maxLength={128} required/></label>{mode === "register" && <p>Use at least 12 characters.</p>}<button disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}</button><p role="status" aria-live="polite">{state.message}</p></form>;
}
export function AuthForms() {
  const [state, action, pending] = useActionState(requestPasswordReset, empty);
  return <><div className="auth-grid"><CredentialsForm mode="login"/><CredentialsForm mode="register"/></div><form action={action} className="auth-form"><h2>Reset your password</h2><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label><button disabled={pending}>{pending ? "Please wait…" : "Send reset instructions"}</button><p role="status">{state.message}</p></form></>;
}
export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, empty);
  return <form action={action} className="auth-form"><label>New password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128}/></label><button disabled={pending}>{pending ? "Please wait…" : "Update password"}</button><p role="status">{state.message}</p></form>;
}
