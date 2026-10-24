import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-center font-serif text-4xl text-ink">Welcome back</h1>
      <p className="mb-7 mt-2 text-center text-sm text-ink-muted">Sign in to track orders and save your favourites.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Attires Arena?{" "}
        <Link href="/account/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
