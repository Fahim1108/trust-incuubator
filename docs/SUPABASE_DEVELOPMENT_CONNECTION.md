# Development Supabase connection — 2026-10-24

Target project reference: `euoannuvovsbwxjqnriw`.
Expected API origin: `https://euoannuvovsbwxjqnriw.supabase.co`.
This authorization is for development only, not production, reset, RLS disabling or destructive operations.

## Current status

Bindings and network access are now working. The intended project returned Auth health and Management API 200 responses. Both migrations were remotely rehearsed with rollback, then applied through the supported migration API after direct CLI database history access timed out. Current schema/history and real Auth/PostgREST/browser verification are in PHASE_1_REPORT.md. Public signup/email delivery and the browser email callback remain pending; the missing-credential observations below describe the earlier attempt.

## Earlier observations (historical)

- `.env.local` contains the supplied project URL, is ignored by Git and has mode 0600. It does not contain a publishable key because none is available to the current machine.
- The process has no `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `DATABASE_URL` or `SITE_URL` binding. Saved configuration requirements do not contain runtime values.
- No existing Supabase CLI project link or saved access-token file was found. A real read-only `supabase projects list` returned “Access token not provided.”
- A keyless project health request failed at the configured proxy with `Tunnel connection failed: 403 Forbidden`; an outside-sandbox retry also failed. This does not establish whether the Supabase project is paused, healthy or authorized.
- The current restricted allowlist had no custom domains. Exact project/API domain additions were saved to the configuration draft, preserving selected package-manager presets: `euoannuvovsbwxjqnriw.supabase.co` and `api.supabase.com`. Draft saving does not activate network access or inject values.

## Earlier configuration prerequisites (now supplied)

Enter values securely through environment settings, never chat, tracked source or command-line flags:

1. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the existing project publishable key, not a secret/service-role key. Once injected, copy it to the ignored `.env.local` without printing it, or let Next.js read the environment directly.
2. `SUPABASE_ACCESS_TOKEN`: an authorized Supabase account access token for CLI management access to this development project (or complete an authenticated CLI login).
3. `SUPABASE_DB_PASSWORD`: this development project's database password for a linked CLI database connection. A publishable key cannot authorize migrations. An explicitly supplied development database connection is an alternative; do not invent region, pooler or connection details.
4. `SITE_URL`: the actual canonical HTTPS application origin for email-confirmation/recovery callbacks. Configure exact callback URLs and email-confirmation/SMTP settings in Supabase Auth.

Review/save the pending environment settings and network domains so they reach the runtime. If required by the environment UI, publish the updated **development environment snapshot**; this is not production application deployment. Database connections may need additional exact database/pooler destinations after the real connection details are known; no wildcard database allowlist was invented.

No privileged key is needed by the application. Do not put migration credentials in `NEXT_PUBLIC_` variables or copy them into `.env.local` as application configuration.

## Reviewed migration scope

- `202610240001_foundation.sql`: creates eight public tables, permission maps, indexes/constraints, timestamp triggers, RLS/read policies and inventory adjustment RPC.
- `202610240002_auth_security.sql`: creates the customer-profile registration trigger, backfills profiles for existing Auth users, restricts editable columns, creates private audited owner provisioning and denies anonymous Auth staff access.

Neither resets the database or disables RLS. They contain unconditional object creation and permission changes, so an empty-database rehearsal cannot establish that they are safe against an unknown existing schema. Before hosted application, inspect migration history and existing public/private objects, Auth triggers, grants and policies. Stop on conflicts; do not reset, drop objects or mark migrations applied just to force deployment.

## Resume procedure after access is configured

1. Verify the configured project origin/reference match this document; test the API with the supplied public key without printing it.
2. Check CLI authorization and initialize repository CLI configuration only if missing. Link **this reference only** with `supabase link --project-ref euoannuvovsbwxjqnriw`. Use environment credentials rather than password/token command-line flags.
3. Inspect `supabase migration list` and the real schema before planning pending migrations.
4. Run `supabase db push --dry-run`. This is a hosted pending-migration check, not a substitute for reviewing statements and live conflicts. Run `supabase db lint --linked` where available to inspect database functions; no schema reset is needed.
5. Apply only the reviewed, safe pending migrations with `supabase db push`, then recheck migration history, RLS, grants and Auth trigger behavior. Never run `supabase db reset` against the linked project.
6. Verify real signup/confirmation/login/logout, refreshed and persisted cookies, two-customer isolation, metadata privilege injection and staff denial using controlled test accounts. Email access/confirmation and Auth security configuration are prerequisites; never disable confirmation/RLS to make tests pass.
7. Update the Phase 1 report with exact hosted/API/browser outcomes. Local PostgreSQL claims simulation does not count as signed-JWT/Auth verification.

That earlier attempt could not run hosted checks. The later successful deployment and partial hosted verification supersede this historical blocker; see PHASE_1_REPORT.md.
