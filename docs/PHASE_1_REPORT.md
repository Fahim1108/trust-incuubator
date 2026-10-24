# Phase 1 verification report — 2026-10-24

**Status: INCOMPLETE. The database/Auth foundation is substantially verified against the real development project; public email signup/delivery and the full browser email callback still need verification. Phase 2 has not started and its detailed plan is deferred until Phase 1 passes.**

## Environment and project identity

- Runtime bindings for project URL, publishable key, Management API token, database password and site URL are present. Values were not printed.
- The configured project origin matches authorized development reference `euoannuvovsbwxjqnriw`. Auth health and authenticated Management API requests returned 200; project access was confirmed.
- Ignored `.env.local` contains only the three application bindings, mode 0600. No migration/admin credentials were copied into application configuration or committed.
- The configured site is loopback HTTP and matches Supabase Auth. Code now permits this **only in development**. Production still requires a clean HTTPS origin. Node startup explicitly honors the cloud's environment proxy.

## Migration review, rehearsal and deployment

Before deployment, read-only inspection found no public/private tables, custom Auth-user triggers or migration history. Required Auth columns were present. Both migrations were reviewed for conflicts/destructive statements and successfully executed inside an explicit remote transaction that was rolled back. The schema and history remained unchanged after that rehearsal.

CLI linking succeeded, but direct database history access timed out. A CLI `db push --dry-run` was therefore not executed. The actual remote rollback rehearsal above was the dry-run evidence; it is not represented as a successful CLI run.

The supported Supabase Management API migration endpoint applied both migrations and recorded their history:

| Migration | Actual deployed version |
| --- | --- |
| foundation | 20261024010934 |
| auth_security | 20261024010940 |

The API assigns versions. Local filenames were aligned to those recorded versions without changing SQL bytes; original names/hashes are preserved in `supabase/development-deployment.json`. No fake history entries were inserted. Read-only comparison confirms all local migrations are applied and none remain pending. Source: Supabase's management API types and MCP implementation of `/v1/projects/{ref}/database/migrations`.

No remote reset, RLS disabling, destructive schema operation or production deployment occurred. Temporary test records/triggers were removed; private provisioning audit records intentionally retain the record of disposable test-owner grants.

## Hosted structural verification

`npm run verify:supabase:development` verifies:

- Eight expected public tables, all with RLS enabled, plus the private owner-provisioning audit table.
- All 42 public-table constraints and both private-audit constraints present and validated; four explicit query/history indexes present.
- Expected public/profile/staff policies, with permission mappings denied by default.
- Five security-sensitive functions with expected definer/invoker modes and fixed search paths.
- Customer-profile registration trigger; denied customer role, price and stock writes; denied public/customer owner provisioning.
- Private audit-table/sequence denial and exact local/remote migration-history and SQL-hash correspondence.

## Actual Auth, API and browser results

`docs/SUPABASE_VERIFICATION_RESULTS.json` records **14 passing hosted scenarios**, one blocked scenario and one unverified scenario. No failed functional scenario remains in that run. These are real hosted Auth/PostgREST requests and Chromium/local development-app checks, not mocked SDK tests.

Passed:

- Generated signup-token flows enforce unconfirmed-login denial and verify confirmation tokens against real Auth. These generated links bypass SMTP delivery; they do not prove the public email signup journey.
- Actual customer profile reads/writes are isolated; cross-customer reads and updates are denied.
- User-editable role/admin metadata cannot grant staff permissions; public owner provisioning and role assignment are unavailable.
- Anonymous catalogue restrictions, staff draft reads, customer price/stock-write denial and analyst mutation denial.
- Concurrent last-unit adjustments commit exactly once; ledger failure rolls back stock. This is inventory adjustment testing, not checkout testing.
- Real refresh tokens, forged-signature rejection, SDK session persistence, role revocation and logout.
- Browser password login, HttpOnly cookies, page-reload persistence and real proxy refresh after locally expired session metadata with valid signed tokens.
- Browser logout, unsigned password-page denial, and admin 404.
- Recovery OTP verification with Auth, followed by a real protected browser password update; the old password then fails and the new one succeeds.

Blocked/unverified:

- Supabase rejected the synthetic public signup address with `email_address_invalid`. Public email registration/delivery is **not passed**. The runner now supports a dedicated `SUPABASE_TEST_SIGNUP_EMAIL` mailbox and refuses to touch an already-existing account at that address.
- Real SMTP delivery, opening a received message and completing the full browser PKCE email-link callback were not executed. Admin-generated verification/recovery links were used for token verification; no success is claimed for delivery or the complete email callback.
- The first runner emitted a passing signup label after recording its block. That reporting bug was corrected, and the inaccurate passing row removed. The artifact records this correction; no additional signup attempt was disguised as passing.

All six staff-role mappings passed a separate real Auth/PostgREST matrix (6/6); see `SUPABASE_STAFF_VERIFICATION_RESULTS.json`. Staff fixtures use explicitly confirmed administrative test accounts; that is not email-verification coverage.

## Local checks

- Lint, strict TypeScript, **42 unit tests across 7 files**, isolated PostgreSQL checks and production build passed.
- PostgreSQL suite: **53 assertions plus the independent-session concurrency scenario**. It executes actual RLS/transactions with simulated claims and remains distinct from the hosted tests above.
- Unit Auth tests use mocks and are not counted as real integration evidence.
- The optional full local Supabase Docker stack remains capacity-blocked on this VFS machine; hosted integration was used instead. Its unrun scenarios are not added to passing counts.

## Security boundaries and remaining risks

- Public registration only creates a customer profile. Owner provisioning is operator-only, requires matching confirmed identity, rejects anonymous accounts, and writes an audit record atomically. Disposable test owners were removed; no permanent owner was created.
- Owner production MFA/reauthentication gates, broader audit-controlled staff lifecycle and production abuse/rate-limit controls remain work. Provisioning audit identifies the database principal and reason; external operator approval records are still needed for human attribution.
- CSP permits inline scripts/styles; compatible ESLint 9 remains deprecated.
- Production HTTPS site/callback/SMTP settings and deployed-browser behavior are unverified. Development HTTP is restricted to loopback and never enabled in production.
- Inventory retry idempotency/reservations, full commerce/storage schema/policies, backup/recovery and production deployment remain out of scope/incomplete. No payment-status API exists.
- Hosted test-admin credentials are fetched only in test-process memory using existing authorized Management access. They are not app dependencies, logged values or committed configuration. Browser traces/storage files containing tokens are not written.

## Required next action

Configure an owned, disposable, previously unused signup test mailbox as `SUPABASE_TEST_SIGNUP_EMAIL` and ensure the Supabase email provider permits delivery to it (or configure appropriate SMTP). Verify receipt and the real confirmation/recovery callback in the initiating browser; do not disable email confirmation or RLS. Use a canonical HTTPS app origin for staging/production verification.

After the remaining email/browser/security gates pass, prepare the detailed Phase 2 storefront plan. Do not begin storefront, checkout, management or dashboard implementation in this task.
