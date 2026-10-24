# Authentication and authorization foundation

Phase 1 remains incomplete while public signup/email delivery and the full browser email callback are unverified; real hosted API and local development-browser sessions are now tested. No admin/dashboard, checkout, product-management or payment endpoint is enabled.

## Authorization model

Supabase Auth verifies credentials and JWT signatures; PostgREST selects the database role from the signed JWT. `auth.uid()` resolves the authenticated subject. Anonymous Auth users also have the `authenticated` database role, so `private.has_permission` explicitly denies JWTs with `is_anonymous: true`.

Staff permissions come only from `public.user_roles` joined to `role_permissions`. Neither user-editable registration metadata nor JWT `user_metadata.role`, `is_admin` or a role name supplied by a form grants staff authority. Browser roles cannot write those mappings. Changes to database role membership take effect on the next permission query without waiting for JWT expiry.

The SQL test bootstrap mirrors Supabase's published helpers including the JSON `request.jwt.claims` format and legacy `request.jwt.claim.sub` format. SQL tests deliberately set role/claim settings themselves; this simulates authorization inputs and does not test JWT verification. The application uses `auth.getUser()` for validated identity and never authorizes from `getSession()` alone.

Sources consulted:
- https://github.com/supabase/auth/blob/master/migrations/20220224000811_update_auth_functions.up.sql
- https://github.com/supabase/auth/blob/master/migrations/20220531120530_add_auth_jwt_function.up.sql
- https://supabase.com/docs/guides/auth/server-side/nextjs

## Application integration

- `/account`: server-rendered signed-in account or real login/registration/reset forms; displays an unavailable message and no forms when Supabase public configuration is absent.
- `/account/password`: requires an Auth-validated user; server action revalidates identity before updating password.
- `/auth/callback`: exchanges a PKCE code through Auth, rejects failed/expired exchanges and permits only fixed local redirect destinations.
- `src/proxy.ts`: refreshes identity on account/auth paths and propagates SDK cookies to both request and response with private/no-store caching.
- The current server-only Auth integration uses HttpOnly, SameSite=Lax cookies with Secure in production; no browser Supabase client needs token access. Revisit that boundary explicitly if introducing browser-side Supabase later.
- Cookie writes occur only in the proxy, Route Handler or Server Action. Read-only Server Components do not attempt cookie writes.
- Server Actions use Next.js's same-origin POST protections. No auth mutation is exposed as GET. PKCE callback is a code exchange, not proof of staff access.
- Passwords and tokens are not logged or stored by application code. Only the public publishable key is used by application clients. Registration forwards only email/password plus a configured redirect URL.
- `/admin` remains 404. No administrative UI or arbitrary role-provisioning route was added.

## Development Supabase configuration

Set through environment settings or an ignored `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: clean HTTPS project origin.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public `sb_publishable_…` key, never a secret or service-role key.
- `SITE_URL`: canonical HTTPS application origin without a path/query/credentials; HTTP loopback origins are accepted only when NODE_ENV is development. Production always requires HTTPS.

Apply the ordered migrations through an authenticated trusted operator connection to a separate development project. Keep `private` out of exposed API schemas. Public keys alone do not authorize migrations.

In Supabase Auth settings enable email confirmation, configure the Site URL, allow the exact `/auth/callback` and `/auth/callback?next=/account/password` redirect URLs, configure trustworthy SMTP, password/security policies, rate limits and production abuse protection. Configure secure password-change/reauthentication controls. Do not broaden redirect wildcards for convenience. Password reset messages intentionally avoid account enumeration; delivery is not guaranteed by a returned message. PKCE links require the initiating browser's verifier cookie; cross-device links may fail safely.

Before release verify registration/confirmation, login failure/success, reset email and password update, expired links, refresh-cookie propagation, logout, missing/forged/expired tokens, cross-customer isolation and staff denial through the deployed app and hosted API. Unit tests mock SDK calls and cannot establish these behaviors.

## Secure owner provisioning

Migration `20261024010940_auth_security.sql` creates an operator-only SECURITY INVOKER function in the unexposed private schema. No execute permission is granted to `anon` or `authenticated`. It requires the exact verified Auth UUID and matching confirmed email, rejects anonymous accounts, and writes a private operator/reason audit record atomically. Public signup creates a customer profile only; it never assigns roles.

An authorized operator must verify the intended identity in Auth and execute through a trusted SQL administration connection to the intended environment:

```sql
begin;
select private.provision_owner(
  'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid,
  'REPLACE_WITH_VERIFIED_CONFIRMED_EMAIL',
  'REPLACE_WITH_APPROVAL_REFERENCE_AND_REASON'
);
commit;
```

Repeated provisioning is idempotent. If the audit insert fails, the role assignment rolls back. Do not execute this via public PostgREST, a browser, a registration hook or a customer-supplied email/UUID. No production owner has been provisioned by this task. Restrict SQL/admin credential access and require explicit operational approval for production grants. General role revocation/audit workflows and owner MFA enforcement are still pending; no privileged application endpoint is active.

## Verification levels

1. `npm test`: unit tests with mocked Auth/SSR SDK where relevant. No real login or JWT signature verification.
2. `npm run test:db`: real PostgreSQL RLS, constraints, row locks, transactions and simulated Auth claims. Not GoTrue or PostgREST.
3. `npm run test:supabase:local`: real local Supabase Auth/PostgREST and signed JWT tests; see local setup below. Test-only local admin confirmation prepares disposable accounts; SMTP/email-link UI and Next.js browser flows are not covered.
4. Hosted Supabase and deployed Next.js browser tests: required before Phase 1 completion; unavailable without project configuration.

## Reproduce real local Supabase tests

Use Supabase CLI **2.122.0**, Docker and Node 24. A full Supabase database image exceeds this cloud machine’s practical VFS storage budget; setup requires at least 64 GiB free when using VFS (a conservative preflight, not a capacity guarantee). Use a larger or overlay-backed environment, or configure a hosted development project. The attempted real local stack did not start here and its integration scenarios remain unrun. `SUPABASE_CLI` points to the installed CLI executable. The CLI needs normal access to its own configuration directory; cloud sandbox permissions may need to permit that directory. Its npm wrapper can be installed with your standard npm tooling. Do not disable TLS/checksum verification.

```sh
export SUPABASE_CLI=/absolute/path/to/supabase
npm run setup:supabase:local
npm run test:supabase:local
```

The setup command refuses to overwrite `/tmp/attire-supabase-verification`, enables email confirmation, disables development seeds, copies migrations and starts only database/API/Auth/mail services. It uses Supabase's supported `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io` override because the default ECR registry is blocked in this cloud environment. Service output and keys are withheld. Required image pulls need Docker Hub access. Local services contain test credentials and must not be exposed publicly or reused for production.

The integration runner refuses non-loopback endpoints and any API port other than 54321. It creates disposable `.invalid` users and unique product/variant fixtures only in this named local project, tests real Auth/API access, and deletes its fixtures. It uses a local admin key only in the test process; keys and passwords are not printed or saved to source. No hosted project can be selected by this runner.

Stop only this test stack when finished:

```sh
"$SUPABASE_CLI" stop --workdir /tmp/attire-supabase-verification
```

Stop is not production deployment or a hosted reset. Inspect and archive/remove the disposable directory yourself before preparing a new isolated project; setup never deletes user files. Do not claim a local run verifies hosted configuration or the deployed application.

## Remaining risks

CSP still permits inline scripts/styles. Production SMTP/CAPTCHA/rate-limit/MFA and session-hardening settings require real environment verification. Profile editing, owner MFA gates, auth browser E2E, audit-controlled role revocation, inventory retry idempotency, complete commerce/storage schema and recovery controls remain pending. Payments and payment statuses do not exist yet; there is no browser payment mutation surface and no claim of tested payment RLS. Never add that surface before server-only financial state transitions and tests.


## Current hosted verification

The authorized development project now has both migrations deployed and history verified. Run `npm run verify:supabase:development` for read-only schema checks. `npm run test:supabase:development` runs real hosted Auth/PostgREST plus Chromium against the configured loopback development site; `npm run test:supabase:staff` checks all six roles. These commands create/remove disposable development fixtures and must never be repointed to production. They require Node 24 proxy support, Management authorization and a local Chromium executable (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, default `/usr/bin/chromium`). Do not record traces, passwords, cookie storage or token-bearing links.

The runner fetches a test-only admin key in memory through authorized Management access. It never puts that key in `.env.local` or app code. The default synthetic public signup address is rejected by hosted Auth; use `SUPABASE_TEST_SIGNUP_EMAIL` only for a mailbox you control and approve for test messages. Existing accounts at that address cause a block rather than modification/deletion. Generated signup/recovery tokens verify real Auth behavior but do not prove SMTP delivery or a browser PKCE email callback. See PHASE_1_REPORT.md and the JSON result artifacts for exact executed outcomes.

Migration deployment used the supported Management API endpoint after CLI database transport timed out. The API assigned the initial development versions, so local files were aligned once, preserving their SQL hashes and provenance. For future staging/production targets, preserve these versions and use a functioning CLI/direct database transport; do not keep renaming deployed migrations or manufacture history entries. This task does not authorize staging/production deployment.
