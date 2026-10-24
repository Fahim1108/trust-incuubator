import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-center font-serif text-4xl text-ink">Create account</h1>
      <p className="mb-7 mt-2 text-center text-sm text-ink-muted">Faster checkout, order tracking and a saved wishlist.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
