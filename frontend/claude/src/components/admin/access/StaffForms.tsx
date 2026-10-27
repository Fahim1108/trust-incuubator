"use client";
import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  signInStaff,
  verifyStaffMfa,
  enrollStaffMfa,
} from "@/lib/admin/actions";
import type { AdminActionState } from "@/lib/admin/validation";
export function StaffSignIn() {
  const [state, action, pending] = useActionState(signInStaff, {});
  return (
    <form action={action} className="aa-form">
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          maxLength={254}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          maxLength={256}
        />
      </label>
      {state.error && <p role="alert">{state.error}</p>}
      <button disabled={pending}>
        {pending ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  );
}
export function StaffMfa({ factorId }: { factorId?: string }) {
  const [enrollment, setEnrollment] = useState<AdminActionState>({});
  const [enrolling, start] = useTransition();
  const [state, action, pending] = useActionState(verifyStaffMfa, {});
  const id = factorId || enrollment.factorId;
  return (
    <div className="aa-form">
      {!id && (
        <>
          <p>Set up an authenticator app to protect store administration.</p>
          <button
            disabled={enrolling}
            onClick={() =>
              start(async () => setEnrollment(await enrollStaffMfa()))
            }
          >
            {enrolling ? "Preparing…" : "Set up authenticator"}
          </button>
        </>
      )}
      {enrollment.error && <p role="alert">{enrollment.error}</p>}
      {enrollment.qr && (
        <>
          <p>Scan this QR code in your authenticator app. Keep it private.</p>
          <Image
            src={enrollment.qr}
            alt="Private authenticator enrollment QR code"
            width={220}
            height={220}
            unoptimized
          />
        </>
      )}
      {id && (
        <form action={action} className="aa-form">
          <input type="hidden" name="factorId" value={id} />
          <label>
            Authenticator code
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
            />
          </label>
          {state.error && <p role="alert">{state.error}</p>}
          <button disabled={pending}>
            {pending ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      )}
    </div>
  );
}
