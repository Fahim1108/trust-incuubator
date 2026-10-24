"use client";

import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, Checkbox, DemoNotice, Input } from "@/components/ui";
import { isValidBdPhone, isValidEmail, type FieldErrors } from "@/lib/validation";
import { registerAction, requestPasswordResetAction, signInAction } from "@/services/actions";

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <DemoNotice force>{message}</DemoNotice>;
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} leftIcon={<Lock className="h-4 w-4" />} className="pr-11" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-[26px] flex h-9 w-9 items-center justify-center rounded text-ink-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"identifier" | "password">>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!isValidEmail(identifier) && !isValidBdPhone(identifier)) errs.identifier = "Enter your email or mobile number";
        if (password.length < 6) errs.password = "Password must be at least 6 characters";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await signInAction({ identifier, password });
          setMessage(r.ok ? null : r.message);
        });
      }}
    >
      <Input label="Email or Mobile" leftIcon={<Mail className="h-4 w-4" />} autoComplete="username" placeholder="you@example.com or 01XXXXXXXXX" value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={errors.identifier} />
      <PasswordInput label="Password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" />
        <Link href="/account/forgot-password" className="text-xs text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Notice message={message} />
      <Button type="submit" size="lg" fullWidth loading={pending}>
        Sign In
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<keyof typeof form | "agree">>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (form.fullName.trim().length < 3) errs.fullName = "Enter your full name";
        if (!isValidEmail(form.email)) errs.email = "Enter a valid email";
        if (!isValidBdPhone(form.phone)) errs.phone = "Enter a valid mobile number (01XXXXXXXXX)";
        if (form.password.length < 8) errs.password = "Use at least 8 characters";
        if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
        if (!agree) errs.agree = "Please accept the terms";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        start(async () => {
          const r = await registerAction({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
          setMessage(r.ok ? null : r.message);
        });
      }}
    >
      <Input label="Full Name" leftIcon={<User className="h-4 w-4" />} autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Input label="Mobile Number" type="tel" leftIcon={<Phone className="h-4 w-4" />} autoComplete="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      <PasswordInput label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} hint="At least 8 characters" />
      <PasswordInput label="Confirm Password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
      <div>
        <Checkbox
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" className="text-primary underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>
            </>
          }
        />
        {errors.agree && <p className="mt-1 text-xs text-danger">{errors.agree}</p>}
      </div>
      <Notice message={message} />
      <Button type="submit" size="lg" fullWidth loading={pending}>
        Create Account
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValidEmail(identifier) && !isValidBdPhone(identifier)) return setError("Enter your email or mobile number");
        setError(undefined);
        start(async () => {
          const r = await requestPasswordResetAction({ identifier });
          setMessage(r.ok ? null : r.message);
        });
      }}
    >
      <Input label="Email or Mobile" leftIcon={<Mail className="h-4 w-4" />} autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={error} />
      <Notice message={message} />
      <Button type="submit" size="lg" fullWidth loading={pending}>
        Send Reset Link
      </Button>
    </form>
  );
}
