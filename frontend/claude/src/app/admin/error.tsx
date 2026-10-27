"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="aa-auth">
      <h1>Administration unavailable</h1>
      <p>
        The session or development database could not be verified. No changes
        have been confirmed. Retry or sign in again.
      </p>
      <button onClick={reset}>Retry</button>
      <a href="/admin/sign-in">Staff sign-in</a>
    </main>
  );
}
