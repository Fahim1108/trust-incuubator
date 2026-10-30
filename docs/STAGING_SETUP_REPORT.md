# Isolated staging setup — 30 October 2026

Historical pre-bootstrap report. See [Milestone 1 report](MILESTONE_1_REPORT.md) for the subsequent staging database/Storage apply and current Auth/API-key permission blockers.

## Verified, read-only

- Vercel project: `attires-arena-frontend-preview`; root `frontend/claude`.
- Preview `SUPABASE_URL` resolves to **jwccyndyaamodxjtjtfo**.
- Production `SUPABASE_URL` remains **euoannuvovsbwxjqnriw**.
- The bindings have separate Preview/Production scopes. The Preview publishable-key binding exists and remains Sensitive; its correctness has not been connection-tested.
- Encrypted URL configuration was read through Vercel's individual environment-variable endpoint, without printing values/credentials. List responses alone contain encrypted values and are insufficient for this check.
- Actual Vercel safety preflight passed for the staging target.
- Production deployment remains `dpl_C6Y28xh9JNFcDqvJ92GUcvFweixi`. No aliases, environment settings, database, Owner assignment or MFA were modified.

## Actual blocker

The configured `SUPABASE_ACCESS_TOKEN` is valid (project-list HTTP 200), but the staging project is not visible to it. Staging project and database requests return **HTTP 403**. A migration-runner attempt stopped at the initial read-only history check, before executing any DDL or mutation. Staging database connectivity, schema, RLS and Storage state therefore remain unverified.

A separate direct health request to the new staging hostname was denied by the execution proxy; the escalated retry was cancelled by the user and was not repeated. No TLS validation was disabled and no network/approval bypass was used.

## Required manual configuration

1. In Codex Cloud's secure environment settings, update `SUPABASE_ACCESS_TOKEN` using a Supabase account/token with project visibility and database migration access to **jwccyndyaamodxjtjtfo**. Prefer staging-specific access. Do not paste the token into chat or repository files. A Vercel publishable-key binding does not grant operator SQL/migration access.
2. Enable outbound execution access to `jwccyndyaamodxjtjtfo.supabase.co` if the network policy continues to deny it. Management requests also require `api.supabase.com` (currently reachable).
3. Leave Production variables/accounts/settings unchanged. No database password, existing Owner password or MFA code is needed in chat.

These steps require no new paid service or subscription. No paid resource was created or enabled by this task.

## Prepared locally

- One version-controlled reference map: `frontend/claude/src/config/supabase-projects.json` (public project references only).
- Application public/anon clients accept only the staging project in Preview/development and the existing Production project in Production. Privileged keys remain rejected. No application deployment was performed.
- Operator tools now target staging, ignore historical Production browser-key defaults and reject explicit conflicting staging URLs. Hosted QA obtains only staging public/test credentials. SQL/API mutations require a fresh Vercel isolation check.
- Isolation checks now require the exact applicable Preview target, reject Production/shared/unknown/conflicting targets, and decrypt only URL records when required. A Preview-looking name/domain alone is insufficient.
- Migration runner discovers **all repository migrations**, including baseline schema, for a fresh staging project. It plans only missing versions, rejects unknown/duplicate history and strips transaction wrappers even when preceded by comments. Default dry run rolls back; `--apply` remains explicit. No second schema was invented.

## Verification results

Passed locally:

- Frontend lint, explicit TypeScript, **122 tests**, optimized production build.
- Root lint and **58 tests**.
- **14 operator/isolation/migration-planning tests**.
- Disposable network-isolated PostgreSQL migration/RLS/inventory concurrency suite. Auth/JWT helpers there are simulated; this is not actual staging Auth/PostgREST verification.

Blocked/not executed:

- Actual staging database connection: HTTP 403.
- Staging migration dry run/application: stopped at read-only history lookup, **zero applied**.
- Hosted Auth/MFA/RLS/Storage/browser checks: not run.
- Storage bucket setup, QA users/data and QA cleanup: no resources/fixtures created; nothing to clean.
- No new Preview deployment or Production deployment.

## Existing Preview warning

The latest READY Preview is still source `a14fa59de02cf9ab5edd6d402141c1621c0f919a`, deployment `dpl_8ssJhwNU1Wx39mL9yi7eJTdqrNVW`. It predates the new Preview Supabase bindings. Existing deployments retain their environment snapshots: **do not use that old Preview admin for staging writes**. Once access is available, bootstrap staging, verify it and create a fresh staging Preview before testing.

## Resume commands (after operator/network access is fixed)

```sh
node --test scripts/lib/deployment-isolation.check.mjs scripts/lib/staging-migrations.check.mjs scripts/lib/staging-operator.check.mjs
node --use-env-proxy scripts/admin/migrate-development.mjs
node --use-env-proxy scripts/admin/migrate-development.mjs --apply
```

The first remote command verifies isolation and performs a rolled-back staging dry run. Review its pending versions before the explicit apply. Do not run old Production-targeted standalone scripts or copy real Auth/customer/order/private records. Continue staging-only Auth/RLS verification and full product-management work only after successful bootstrap.
