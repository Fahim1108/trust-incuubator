# Proposed Production release plan — approval required

Target public site: https://www.attiresarena.com/
Target admin: https://www.attiresarena.com/admin
Target login: https://www.attiresarena.com/admin/login

This is a plan, not authorization or a completed launch. No Production deployment, DNS, environment or database change is performed by Milestone 1.

## Architecture and isolation

Retain the existing Next.js application at `frontend/claude`, served by the existing Vercel project. Public and admin routes share HTTPS origin; staff routes use authenticated Supabase SSR sessions, database roles, AAL2, RLS and audited RPCs. `/admin/login` is a compatibility entry to the existing `/admin/sign-in` flow, not a second authentication system. Preserve the original storefront design; a scoped dark admin design is a later milestone.

Production uses `euoannuvovsbwxjqnriw`; Preview uses `jwccyndyaamodxjtjtfo`. Application credentials are publishable/anon only. Operator Management API/test credentials remain outside application/Vercel runtime configuration. Never copy Production users, passwords, MFA factors, orders or private records into staging.

## Gates before any release request

1. Finish real staging Auth/MFA/PostgREST and binary Storage API verification using disposable accounts. Designate a permanent staging Owner separately if desired; no account is implicitly promoted.
2. Complete the full admin product lifecycle, secure media pipeline and stale-edit/audit tests. Catalogue adapters must support approved persisted images/products instead of the original-intake allowlist only.
3. Complete and verify transactional inventory, checkout, orders, payments, shipping, customers, discounts and staff management before calling the business platform complete. No fake order/payment success or dashboard metrics.
4. Finish scoped dark admin UI, mobile/accessibility checks at 360/390/430/768/1440, recovery runbook, CSP/rate-limit/security review and restore drill.
5. Produce an exact tested feature-branch commit, staging browser evidence, permissions matrix, migration diff and unresolved-risk list. Obtain user release approval. An empty/coming-soon storefront is a separately scoped release, not a full commerce launch.

## Future authorized Production preparation

- After explicit approval, perform a fresh read-only Production schema/history audit. Do not assume Production matches staging or blindly reapply all baseline migrations. Compare versions and prepare only compatible pending changes.
- Take and verify an encrypted backup through existing/free tooling and a recovery procedure. Do not enable a paid backup/PITR plan or external service without approval. Test restore in an isolated environment without exposing private records.
- Preserve all Production product/customer/order IDs, prices, inventory and accounts. Do not reset, truncate, reseed or run staging QA against Production. Do not publish any original shirt until actual physical facts are verified.
- Preserve the existing Production Owner and MFA. Reuse the account/role; do not bootstrap another Owner, reset its password or remove factors as part of deployment.
- Verify framework Next.js, root `frontend/claude`, supported Node version, exact lockfile/install/build commands and environment scoping. Do not deploy the root legacy application by mistake.
- Keep Production `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` on Production only; Preview retains its own project. Never expose privileged keys using `NEXT_PUBLIC_*`.

## HTTPS, domain and Auth routing

Keep the current domain/project association and DNS unchanged unless a separate reviewed change is necessary and explicitly approved. Use Vercel-managed HTTPS certificates on the existing plan; no paid certificate subscription. Verify certificate validity, hostname, HTTPS redirects and the canonical www host during the authorized release smoke test. These were not changed or checked against the live site by this milestone.

Configure Production Auth Site URL/redirect allowlist only during separately approved release preparation. Restrict callbacks to the actual supported routes; do not invent a Claude password-recovery callback until integrated. Staging callbacks must remain on staging. No broad redirect wildcard across unrelated domains.

Public product queries must use only verified, legitimately published inventory. Customer/guest private records require proper ownership or secure tracking tokens. Staff pages remain private/no-store/noindex, signed-in role checked and MFA protected; customer metadata cannot grant staff access. Remove public noindex only as a deliberate SEO launch decision; keep private and experiment pages excluded.

## Controlled promotion and rollback

Promote only the reviewed exact staging commit after approval. Apply reviewed compatible migrations under a separate explicit Production authorization, then deploy code; do not auto-run migrations in the Vercel build. Run a minimal authorized smoke test of public products, admin sign-in/MFA and transactions without creating fictional real orders or modifying customer data.

Record the previous deployment and release receipt. If code fails, restore the previous code deployment. Do not drop newly added database columns/history or destructively roll back user data; use a reviewed forward correction/recovery plan. Monitor actual errors and ledger consistency without logging sessions, payment secrets or unnecessary personal data.

Milestone 1 has not performed any of these Production actions.
