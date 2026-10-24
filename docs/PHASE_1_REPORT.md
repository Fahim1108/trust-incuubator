# Phase 1 verification report — 2026-10-24

**Status: INCOMPLETE. Do not start checkout, product management or dashboards.**

## Implemented capabilities

- Ordered PostgreSQL migrations for the first eight public foundation tables, with RLS, grants, constraints, indexes and timestamps.
- Database-backed staff permission checks; no role assignment from customer registration or editable metadata.
- Automatic customer-profile creation and column-restricted profile edits.
- Transaction-safe stock adjustments with row locking, reserved-stock protection, actor/reason movement history and atomic rollback.
- Operator-only owner provisioning requiring matching UUID, confirmed email and non-anonymous identity, with an atomic private audit record.
- Supabase application integration for login, customer signup, logout, recovery request, password update, PKCE callback and session refresh. Account routes are unavailable without configuration; admin remains 404.
- Reproducible unit, simulated-claims PostgreSQL and separate real-local-Supabase test runners. No production payment or other commerce endpoint was introduced.

## Locally verified

- Lint and strict TypeScript checks pass.
- 39 unit tests in seven files pass. Auth SDK calls are mocked in relevant unit tests.
- 53 SQL assertions plus a two-session inventory concurrency test pass in isolated PostgreSQL 17. Database grants, RLS, constraints, locks and rollback execute for real; role/claim inputs are simulated.
- SQL coverage includes JSON and legacy JWT subject resolution; missing subjects; user-metadata privilege injection; customer/staff isolation; denied role, price and inventory mutations; all defined staff-role mappings; and anonymous Auth denial.
- Owner tests cover unconfirmed/mismatched identities, anonymous accounts, public execution denial, idempotency and rollback when audit logging fails.
- Production build passes. HTTP checks preserve the prelaunch page, show no account forms without configuration, deny the admin route and reject an unavailable auth callback. These are not successful-login browser tests.
- Dependency audit reports zero known vulnerabilities; this is not a security certification.

## Real Supabase verification

Real local Supabase integration **did not run**. CLI 2.122.0 initialized an isolated project; the default ECR image registry returned Forbidden. The supported Docker Hub override downloaded images, but the Supabase database image failed extraction with “no space left on device” on this 32 GB filesystem using Docker VFS. Startup was stopped; no real Auth/PostgREST test scenarios passed. Downloaded optional service images from this attempt were removed. The setup runner now checks VFS free space before pulling images. A larger/overlay-backed environment or configured hosted development project is required.

Only an actual successful run of `test:supabase:local` counts as Auth/PostgREST verification. The plain PostgreSQL tests above must never be described as real Supabase authentication tests.

Hosted Supabase, deployed Next.js sessions, email-link delivery, password-reset browser flow, cross-device PKCE behavior and cookie persistence/refresh in a real browser remain unverified. No hosted database was modified.

## Missing environment configuration

The development project is now identified as `euoannuvovsbwxjqnriw`; its URL is saved in ignored, mode-0600 `.env.local`. The publishable key, migration credentials and canonical site URL are not available to this machine. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SITE_URL` securely in environment settings. Public keys alone cannot deploy migrations; a trusted operator must apply the reviewed migrations to a separate development Supabase project. Enable email confirmation and configure exact callback URLs, SMTP and Auth security settings as described in AUTH_SECURITY.md. No privileged key is required by application code.

Variable requirements and reusable install/start instructions were saved to the cloud draft. Saving does not apply runtime values or publish a snapshot. Review/save the environment settings and publish the development environment when appropriate; this is not production release approval.

## Remaining security risks and missing work

- Browser/deployed-app Auth integration, owner MFA/reauthentication gates, production abuse controls and durable application rate limits need verification/implementation. Supabase's own Auth limits do not establish application-wide rate limiting.
- CSP still permits inline scripts/styles; compatible ESLint 9 is deprecated.
- General staff-role lifecycle/revocation audit workflows remain pending. The private owner-provisioning log is not a complete privileged-action audit system.
- Inventory retry idempotency, reservations and reservation expiration are not implemented. Current concurrency tests exercise adjustments, not checkout.
- Full commerce/storage schema and Storage policies are incomplete. No payment table or payment-status API exists: payment isolation is not claimed as tested.
- Backup/recovery, browser E2E/mobile accessibility review and production deployment remain pending.

## Next increment

Configure development Supabase, apply migrations through a trusted operator, and test the application account flows with real sessions. Then add server-enforced staff access and owner MFA checks with browser/API integration tests. Keep `/admin` unavailable until those gates pass. Do not activate commerce or management surfaces yet.

## Git provenance

The prior tasks left an unborn `work` branch and untracked application files. Historical progress statements were corrected. The verified foundation is recorded in local repository commit `4a621e8`, including the preserved prelaunch site and ordered migrations. Use `git log -1 --oneline` and `git status --short` to verify the current state. No push or production publication was performed. Historical unborn/untracked statements remain as records of earlier tasks.


## Development-project connection follow-up

See [connection status and resume procedure](SUPABASE_DEVELOPMENT_CONNECTION.md). CLI read access confirmed missing account authorization; project health was blocked by a proxy 403 before any Auth check. Exact API domains and missing binding requirements were saved to the environment draft. No key was printed or committed; no hosted migration, signup/login/logout, RLS or session-persistence test was performed. Phase 1 remains incomplete.

Local migration rehearsal was repeated successfully in this follow-up: 53 SQL assertions and the independent-session inventory concurrency check passed. This does not establish hosted schema compatibility or pending migration history.
