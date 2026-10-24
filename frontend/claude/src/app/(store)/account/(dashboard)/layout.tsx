import { AccountNav } from "@/components/account/AccountNav";
import { DemoNotice } from "@/components/ui";
import { getCurrentCustomer } from "@/services";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Codex: redirect to /account/login when there is no session.
  const customer = await getCurrentCustomer();
  return (
    <div className="container py-6 sm:py-10">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">My Account</p>
        <h1 className="mt-1 font-serif text-4xl text-ink">Hello, {customer?.fullName.split(" ")[0] ?? "there"}</h1>
      </div>
      <DemoNotice className="mb-6">You&apos;re viewing a sample account. Sign-in and account data will be connected to the backend.</DemoNotice>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-10 [&>*]:min-w-0">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
