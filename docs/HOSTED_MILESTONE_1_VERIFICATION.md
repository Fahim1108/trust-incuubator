# Milestone 1 — Staging security foundation sign-off

**Status: PASSED, 30 October 2026.** Scope: isolated staging admin authentication, MFA, authorization, draft foundation and private Storage. This is not a Production release or full-commerce readiness approval.

- Staging: `jwccyndyaamodxjtjtfo`; Production Supabase was not queried or modified.
- Hosted Preview: https://attires-arena-frontend-preview-3jhjabgw1-fahim-s-projects1.vercel.app
- Deployed application commit: `e279ccc3a39fa58938e514b442d9810cc13ee775`.
- Vercel deployment: `dpl_7Aty6LyTJjuQGb7WzTJEyXqXYXbZ`, READY, staging target, root `frontend/claude`.
- Immutable evidence copied to `artifacts/admin/milestone-1/`. Earlier historical artifacts are not this sign-off's evidence.

## Actual hosted browser checks

| Check | Result |
| --- | --- |
| Unauthenticated protected route | Redirects to staff sign-in |
| Password login | Real temporary Supabase Auth account |
| TOTP enrollment | Real UI button and QR, decoded in memory only |
| Six-digit TOTP verification | AAL2 dashboard access after challenge |
| Session cookies | HttpOnly, Secure over HTTPS, SameSite=Lax |
| Owner dashboard | Actual staging product counts, no fabricated analytics |
| Draft creation | Real persisted unpublished product, tracked for cleanup |
| Imported draft editing | Name, decimal price, measurements and condition survive reload |
| Private PNG upload UI | Actual binary in private bucket, object path returned |
| Audit UI | Persisted catalogue edits visible |
| Logout | Protected route rejects previous browser access |
| Role revocation | Next protected request rejects revoked Owner membership |
| Analyst dashboard | Read allowed; create, upload and audit routes reject restricted access |
| Ordinary customer | Staff login rejected despite forged owner metadata |
| Responsive UI | 360, 390, 430, 768 and 1440px; no horizontal overflow; mobile menu Escape |

All passed in the final hosted run. View the detailed checks in `artifacts/admin/milestone-1/browser-results.json`.

## Real API and database evidence

HTTPS and public Auth settings returned 200; email confirmation required. Real password login, TOTP, customer self-role denial, AAL1 rejection, AAL2 Owner/analyst permissions, draft audit, stale-write conflict and explicit sign-out passed. Storage API checks proved byte-identical upload/download, private/public separation, customer/anonymous denial, own-folder restriction, MIME rejection, signed access and analyst read-only access.

Final read-only inspection: **12 migrations preserved**, 12 RLS public tables, 77 validated constraints, four Storage policies, private draft bucket. **0 Auth users, 0 staff assignments, 0 products and 0 Storage objects** after cleanup. The secure temporary Owner provisioning audit is intentionally retained; no permanent Owner exists. No migrations were run during this increment.

## Fixes and environment changes

- Added `/admin/media`: staging-only private upload foundation; each Server Action rechecks staff, AAL2, role, file size/type/signature and user-owned path. No privileged application key. Current upload cap 768 KiB keeps multipart data under Next's default 1 MiB action limit. This does not attach media to products or publish anything.
- Replaced **Preview-only** `SUPABASE_PUBLISHABLE_KEY` with the verified staging publishable key, preserving Sensitive storage. Existing Preview configuration was rejected by the app and hid the login form. Production variables unchanged. Deployment helper also pins its individual Preview URL/public key and verifies the key against the staging gateway.
- Browser access used a one-hour deployment-scoped share link, explicitly revoked afterward. Project-wide protection was never changed; before/after settings matched.
- Chromium trusted the environment's existing proxy CA; TLS validation remained enabled. No ignored certificate errors. QR secrets/codes, passwords and share links are not stored in screenshots/reports.
- Browser test selector was corrected to distinguish the outer draft editor from its nested SEO details.

## Automated verification

Root lint, TypeScript and 58 tests passed; frontend lint, TypeScript, 124 tests and optimized production build passed; five operator credential/security tests passed. Total: **187 automated tests**, plus real hosted/API checks. No failing final checks.

Reproduce: `npm run lint`, `npm run typecheck`, `npm test`, `npm --prefix frontend/claude run lint`, `npm --prefix frontend/claude run typecheck`, `npm run test:claude`, `npm run build:claude`, `node --test scripts/lib/staging-operator.check.mjs`, `npm run verify:staging`, and `ADMIN_VERCEL_DEPLOYMENT_FILE=artifacts/admin/deployment.json node --use-env-proxy scripts/admin/test-hosted.mjs`. Hosted browser requires Chromium with the environment proxy CA trusted; all operator test keys remain secure environment settings.

## Inspection limitations and release boundaries

The Management API still denies `auth_config_read` and `api_gateway_keys_read`. These are not runtime application dependencies or standalone release blockers: equivalent Auth/MFA/RLS/Storage behavior was tested directly. See `MANAGEMENT_API_LIMITATIONS.md`. Site URL/redirect settings were reviewed manually by the operator; mailbox verification/recovery delivery was not exercised using the disposable confirmed QA accounts.

Product/media association, ordering, complete product CRUD/publishing, application-level media audit, richer inventory workflows and dark admin redesign remain Milestone 2. Orders, payment verification and other unconnected services remain unavailable. No Production deployment, Production database/account/MFA change, DNS modification or paid service was performed. Preview remains Vercel-protected, so its ordinary URL requires authorized Vercel access. Synthetic test accounts are deleted and cannot be used as permanent logins.

## Source/change inventory

Foundation private upload: `frontend/claude/src/app/admin/(workspace)/media/page.tsx`, `src/components/admin/access/DraftMediaForm.tsx`, `src/lib/admin/media-actions.ts`, `src/lib/admin/media-validation.ts` (the latter paths relative to `frontend/claude`), and `frontend/claude/tests/admin-media.check.ts`.

Operator/browser tooling: `scripts/admin/deploy-preview.mjs`, `scripts/admin/hosted-preview-browser.mjs`, `scripts/admin/test-hosted.mjs`, `scripts/admin/verify-browser.mjs`, `scripts/admin/inspect-preview-login.mjs`; root `package.json`/`package-lock.json` add free test-only QR decoding dependencies. No application runtime animation or QR-decoding library was added.

Reports: this sign-off, `MILESTONE_1_REPORT.md`, `MANAGEMENT_API_LIMITATIONS.md`, `PROGRESS.md` and `IMPLEMENTATION_PLAN.md`. Evidence is under `artifacts/admin/milestone-1/`. The subsequent Milestone 2 application revision `97f61fa0b06365dfaad51d8d187a8358fe65a3b3` also passed the full hosted security suite; see `MILESTONE_2_PRODUCT_MANAGEMENT.md`. Both milestones remain Staging only.
