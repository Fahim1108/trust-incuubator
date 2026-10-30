# Milestone 1 verification access — supported options

Staging only: `jwccyndyaamodxjtjtfo`. No Production credential, account, role, environment, DNS or deployment change is required. Both options below use existing services; do not upgrade a plan or enable paid services.

## Exact diagnostic evidence

The Supabase Management API returned:

| Read operation | Result | Provider message |
|---|---|---|
| Staging project metadata | 200 | Accessible |
| Staging database SELECT | Successful | Read access works |
| `/config/auth` | 403 | `Missing required permission(s): auth_config_read` |
| `/api-keys` | 403 | `Missing required permission(s): api_gateway_keys_read` |
| `/api-keys?reveal=true` | 403 | `Missing required permission(s): api_gateway_keys_read` |

These are explicit resource permissions reported by Supabase, not an assumption that the project reference/account/token is wrong. API-key metadata and revealed-key requests are both denied; changing the reveal flag does not bypass this permission.

Reproduce safely:

```sh
node --use-env-proxy scripts/admin/diagnose-staging-access.mjs
```

This command only reads; no key values or full Auth configuration are printed. It reports only allowlisted permission errors.

## Option 1 — existing scoped token

In the Supabase account/token configuration, authorize **Auth configuration read** (`auth_config_read`) and **API gateway keys read** (`api_gateway_keys_read`) for the staging project. Preserve its staging-only resource restriction. If token scopes cannot be edited, replace it with an appropriately scoped token. Configure `SUPABASE_ACCESS_TOKEN` through secure Codex environment settings and ensure the running environment reloads it.

Do not paste tokens here. These are the currently reported missing permissions; any additional provider restriction must be diagnosed separately, not assumed resolved.

## Option 2 — supported Supabase Dashboard + testing credentials

Open https://supabase.com/dashboard/project/jwccyndyaamodxjtjtfo and verify the staging project before viewing settings.

### Auth configuration

Use Authentication settings to manually inspect:

- Site URL and allowed redirects: staging only; no Production callbacks.
- Email/signup/confirmation settings and password requirements.
- TOTP enrollment/verification availability and MFA limits.
- Existing provider/rate-limit settings; do not change them merely to make tests pass.

Report only non-secret settings or a redacted screenshot. Never include SMTP passwords, provider client secrets, JWT signing secrets, recovery links or MFA QR/secret values. A manual Dashboard review can be recorded as manual evidence; it is not an automated Management API success.

### API access for the temporary test harness

In the staging project's API Keys settings, configure these in **secure Codex execution settings**, not chat or repository files:

- `SUPABASE_STAGING_PUBLISHABLE_KEY` — staging publishable/anon key.
- `SUPABASE_STAGING_SECRET_KEY` — staging-only server secret for disposable Auth-user creation/cleanup; a legacy staging service-role key may use `SUPABASE_STAGING_SERVICE_ROLE_KEY` instead. Do not configure both with differing values.

The privileged test key is read only by operator-side scripts, used in memory and never forwarded to application/browser code or NEXT_PUBLIC variables. All verification requests remain pinned to staging and checked against Vercel isolation. Legacy service-role JWTs must match the staging reference. Opaque `sb_secret_` keys cannot have their project proven offline; the fixed staging gateway must validate them. Never supply a Production key.

If you do not want to supply a staging server test key, supported manual creation/confirmation/deletion of temporary Auth users is possible in the staging Dashboard, with private test credentials supplied only through secure settings. That requires coordinating fixture identities/cleanup; the existing automatic harness is not yet a manual-user harness. Do not invent or claim automated cleanup in that mode. No permanent Owner should be created or promoted without separate explicit approval.

## Remaining checks after access is available

Run real temporary Auth signup/login/session/refresh/logout, TOTP and role rejection tests; real binary private Storage uploads/downloads/unauthorized requests/limits; then a fresh staging Preview browser test. Do not substitute SQL-created credentials or database claim simulation for real GoTrue/PostgREST verification. Do not obtain secrets from database internals or add an endpoint to expose Sensitive Vercel configuration.

Latest inspected Preview remains deployment `dpl_8ssJhwNU1Wx39mL9yi7eJTdqrNVW`, source `a14fa59...`, predating the staging foundation. It is not a verified Milestone 1 deployment. Do not run staging writes through an old environment snapshot. Creating/testing a new Preview remains pending; no Production promotion is authorized.

## Preserved state

Read-only comparison confirmed all 12 applied migration SQL digests match their source files. Staging still has zero Auth users, staff assignments, products and Storage objects; the private bucket and four policies remain. No new migration, account, role, upload, deployment or paid resource was created during this investigation.
