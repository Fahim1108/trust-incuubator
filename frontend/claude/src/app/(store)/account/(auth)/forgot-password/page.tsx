import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-center font-serif text-4xl text-ink">Reset password</h1>
      <p className="mb-7 mt-2 text-center text-sm text-ink-muted">Enter your email or mobile and we&apos;ll send you a reset link.</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/account/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
