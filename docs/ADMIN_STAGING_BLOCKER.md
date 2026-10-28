# Milestone 2 — production isolation blocker

28 October 2026 (Asia/Dhaka). Milestone 2 remains incomplete.

## Read-only evidence

The Vercel API reports:

- Project: `attires-arena-frontend-preview` (`prj_QgA6P7BJr74v5GbojhBXyxkXRZAA`).
- Root Directory: `frontend/claude`.
- Assigned domains include both `www.attiresarena.com` and `attiresarena.com`.
- Its `SUPABASE_URL` binding targets **both Preview and Production**, and points to `euoannuvovsbwxjqnriw`.

Therefore the previous "fixed development project" assumption is no longer a sufficient safety boundary. A Preview deployment does not isolate its shared database. New migrations, Storage configuration and disposable hosted test mutations could affect the live site's database. This is a configuration blocker, not completion of the requested admin work. No deployment, database mutation, account/role modification, or production configuration change was performed during this review.

## Required configuration

1. Create or designate a **separate staging Supabase project**, without moving or changing production. If creating it would incur a charge, obtain approval first.
2. Configure its URL and publishable key as **Preview-only** Vercel environment bindings. Keep the existing Production bindings unchanged. Use secure environment settings; never paste tokens, passwords or privileged keys into chat.
3. Provide operator access to the staging project through the existing secure environment mechanism so migrations and disposable authorization tests can run there. The hardcoded development-project guards must then be deliberately updated to that verified staging identity. Do not simply remove the guards.
4. Apply the version-controlled migrations to staging and configure staging-only Auth redirects. Provision staging access through the documented secure process; do not clone customer passwords, sessions, production roles or MFA secrets.
5. Resume the full Milestone 2 implementation and hosted acceptance test against staging. Deploy with `target: staging` only. Do not assign live domains to a new project or change the production deployment.

A separate Vercel project is optional for database isolation: environment bindings scoped only to Preview can isolate this project's Preview builds. A misleading project name alone provides no protection. No need to change the GitHub default branch or the current production website.

## Safety guard added locally

`scripts/lib/deployment-isolation.mjs` performs a read-only Vercel preflight. For the project serving the live domains, it refuses an operation against a production Supabase origin, or when production isolation cannot be verified. Domain/environment pagination fails closed. No values or credentials are printed.

The guard is connected to:

- shared `query(..., false)` operator database mutations (including migration dry runs, which execute DDL before rollback);
- test-only privileged-key acquisition before disposable hosted Auth/database tests;
- the existing admin Preview deployment script.

These are operator-tool protections, not application authorization replacements or a comprehensive guard on every historical standalone script. Existing RLS/MFA/application code is unchanged. Do not run other remote mutation scripts against the shared database.

Reproduce the deterministic tests:

```sh
node --test scripts/lib/deployment-isolation.check.mjs
```

The actual read-only preflight was also executed and correctly refused the currently shared database before any mutation. No bypass switch is provided.

## Still required for Milestone 2

Polished admin/editor; full details for new products; real Storage-backed multiple images/cover/order/delete/replace; audited publication/unpublication/archive; SKU-safe edits and stock handling; category/size/readiness filters; product preview; public catalogue/gallery/SEO integration; legacy mutation MFA/audit hardening; full hosted creation-to-publication-to-cleanup verification at all five widths.

Original 18 garments, Owner account, MFA, customer storefront and production deployment have not been modified by this safety change. There are no new screenshots or deployed commit for this change. Existing screenshots and earlier API-only test results do not prove the requested completed workflow.
