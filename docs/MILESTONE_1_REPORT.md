# Admin 2.0 Milestone 1 — 30 October 2026

**Current status: PASSED — staging admin security foundation signed off.** Real hosted browser, Auth, QR/TOTP, role restrictions, draft persistence/audit and binary Storage UI/API tests passed on `e279ccc3a39fa58938e514b442d9810cc13ee775`. Cleanup is verified. Milestone 2 has started with a staging-only product library; full product management and Production release are not complete. See [current sign-off](HOSTED_MILESTONE_1_VERIFICATION.md).

The original bootstrap assessment and subsequent dated entries below are historical; their earlier blockers/deployment statements are superseded by the current sign-off.

## Scope and safety

All database changes targeted staging `jwccyndyaamodxjtjtfo`. Vercel isolation was verified before mutation. Production `euoannuvovsbwxjqnriw`, its products, customer/order/account data, Owner, MFA, DNS, environment variables and live deployment were not changed. No Production database requests were made. No deployment, paid resource, subscription or paid image/email service was created/enabled.

No permanent Owner was provisioned. No real customer/order/private data or live 18-product catalogue was copied. Only disposable SQL test fixtures were used and rolled back. The public storefront design remains unchanged.

## Changes applied to staging

1. Applied the ten existing repository migrations, in order, from `20261024010934_foundation.sql` through `20261028000300_draft_attributes_seo.sql`.
2. Applied `20261030000100_privileged_mfa_and_draft_storage.sql`:
   - revokes direct authenticated intake INSERT/UPDATE and removes the two write policies, keeping audited/stale-protected RPCs as the write boundary;
   - requires database permission and AAL2 in legacy stock-adjustment and review-moderation RPCs;
   - creates private `attires-product-drafts` Storage bucket, 5 MiB maximum, JPEG/PNG/WebP only;
   - adds four metadata/object RLS policies: AAL2 catalogue readers can read; AAL2 catalogue managers can mutate within their own UID folder. Path changes to another user's folder are rejected.
3. Applied `20261030000200_staff_permission_mfa.sql`: all staff-only capability/read policies now require AAL2 through `private.has_permission`; customer-owned records and own-role lookup before MFA remain available for enrollment. User-editable metadata never grants staff authority.

Each apply was preceded by a successful transaction-rolled-back migration dry run. Existing migration files were not rewritten after application. The two security migrations are additive new versions; no Production apply was attempted.

Read-only verification: **12 application tables, all RLS enabled; 12 migration versions; 77 validated constraints; private bucket and four Storage policies present.** Privileged RPCs retain security-definer authorization with locked search paths; public owner provisioning and direct role/intake writes are denied.

## Local code and operational changes

- Added `/admin/login` compatibility route to existing staff sign-in. Auth/MFA is reused, not replaced. This is source-only until an approved deployment.
- Blocked five historical remote tools before network operations: old inventory importer, interactive customer-auth test, legacy development/staff test scripts and old eight-table verifier. Their source remains for review, but they cannot accidentally target old Production bindings.
- Added `verify:staging`, `migrate:staging` and `test:staging:sql` commands, a read-only schema verifier and isolated rollback-only staging SQL tests.
- Extended local SQL tests with MFA denials, media path isolation and maintained row-lock concurrency checks.
- Updated staging environment example/access documentation; prepared the same-domain Production release plan. No real environment secret was written or copied.

## Verification executed

Passed:

- Frontend lint, explicit TypeScript, **122 unit/security tests**, optimized build (including `/admin/login`).
- Root lint, TypeScript and **58 unit tests**.
- **19 operator/guard/migration/legacy-tool safety tests**.
- Disposable PostgreSQL migration/RLS/audit/storage-policy/inventory-concurrency tests. Auth and Storage are explicitly simulated in that harness.
- Actual staging read-only schema/grant/policy/constraint verification.
- Actual staging transactional SQL tests: customer isolation, metadata cannot promote staff, direct role/intake mutation denial, AAL1 staff denial for privileged data and mutations, AAL2 product-manager access, audited draft creation, stock-ledger update and private Storage metadata RLS/path isolation.
- Staging SQL cleanup confirmed: zero users, products, staff assignments, audit rows and Storage objects before and after. Test schema absent after rollback.

One local negative test initially selected a pending review hidden by the new AAL2 read policy, so it invoked no function and failed its denial assertion. Corrected it to call the privileged RPC directly; the final full suite passed. No failed check is concealed.

**Not verified / blocked:**

- Staging `/config/auth`: HTTP 403.
- Staging `/api-keys?reveal=true`: HTTP 403.
- No staging application public key is present in the execution environment; the Vercel key remains Sensitive. No secret extraction workaround was used.
- Real signed Auth signup/login/logout/session refresh, TOTP enrollment/challenge, real PostgREST sessions, actual binary Storage upload/download/limit validation and hosted-browser login tests have not run. SQL claim tests do not count as signed Auth verification.
- Storage's byte-signature/dimension checks, complete upload UI, media audit workflow and published-image delivery belong to full product management; no binary file has been uploaded under this milestone.

Required to finish this milestone: authorize staging-only Auth-configuration/API-key read access (or equivalent securely configured staging-only verification credentials), ensure staging hostname network access, then run disposable real Auth/MFA/PostgREST/Storage and browser checks with cleanup. Do not send credentials in chat. A permanent Owner remains a separate explicit approval/designation.

## Final staging state

- Auth users: 0
- Staff assignments: 0
- Products: 0
- Audit business rows: 0
- Private draft bucket: 1, not public
- Storage objects / uploaded bytes: 0 / 0

No fake order/payment, guessed physical measurement, automatic product publication, Production fixture or permanent test account was created.

## What remains for later milestones

Premium dark admin redesign and complete product/image/price/category/measurement/inventory/publishing management; then real orders, customers, payments, discounts, shipping and staff-management workflows. Existing source foundations are preserved. Do not start those milestones or claim the whole business platform finished before approval and the required security gates.

Future target URLs and HTTPS/SSL, backup, migration compatibility, exact-commit promotion and rollback gates are documented in `PRODUCTION_RELEASE_PLAN.md`. Production DNS/env/schema changes and releases require separate explicit authorization. An old Preview URL is not evidence of this milestone's deployed code.

## Remaining-permission investigation

The provider now gives exact evidence: `/config/auth` requires `auth_config_read`; both API-key metadata and revealed-key requests require `api_gateway_keys_read`. Project metadata and database access work. Supported Dashboard/manual configuration and secure operator test-key alternatives are documented in [STAGING_VERIFICATION_ACCESS.md](STAGING_VERIFICATION_ACCESS.md). These permissions were not changed or bypassed.

A read-only digest check confirmed every one of the 12 applied migrations matches source. No new Auth user, staff assignment, product or Storage object was created. Real Auth/MFA, binary upload and hosted verification remain blocked; no success is claimed for them. Operator-only test helpers now support explicitly supplied staging test keys from secure execution settings as an alternative to Management API key retrieval; Production legacy JWTs and public keys are rejected for that privileged use.

### 30 October 2026 — Secure Dashboard keys present; network blocker reproduced

- Both operator-only staging test key variables are present (values not logged). User reports TOTP enabled and Site/Redirect URLs configured; these are manual evidence, not API-verified settings.
- Read-only staging SQL succeeds and confirms 12 migration records. Management Auth configuration still returns HTTP 403 with `auth_config_read`; API-key metadata still requires `api_gateway_keys_read`. Dashboard keys avoid key retrieval, not the separate network restriction.
- Real Auth harness attempted. Anonymous RPC rejection is NOT valid authorization evidence in this run: the staging data-plane hostname is blocked by the execution network proxy. A direct Auth settings request reproduced `Proxy response (403) !== 200 when HTTP Tunneling`; an escalated retry failed identically. No successful Auth response was received, so email-confirmation settings, login, TOTP and signed-session authorization are unverified. No binary Storage upload was attempted.
- The temporary SQL product fixture was cleaned up. Read-only post-test counts: 0 Auth users, 0 staff assignments, 0 products and 0 Storage objects. No permanent Owner provisioned. No migrations, Production access/modifications, deployment or paid resources.
- Required unblock: allow HTTPS access from the Codex execution network to `jwccyndyaamodxjtjtfo.supabase.co` (Auth, PostgREST and Storage). Do not weaken RLS/MFA or rotate keys merely to resolve this proxy denial. Milestone 1 remains incomplete; Milestone 2 has not started.

### 30 October 2026 — Fresh-session retry after reported network allowlist update

- Started fresh Node execution and retried the exact fixed staging `/auth/v1/settings` endpoint using the configured publishable key, without logging credentials. Still blocked before Supabase by `Proxy response (403) !== 200 when HTTP Tunneling`.
- Escalated independent HTTPS health check reproduced `HTTP/1.1 403 Forbidden`, `server: envoy`, and `curl: (56) CONNECT tunnel failed, response 403`. This is execution-network CONNECT rejection, not an Auth/RLS response. No proxy bypass attempted.
- Management SQL read remains accessible: 12 migration records; staging test keys present. Management Auth settings remain HTTP 403 `auth_config_read`; API-key metadata remains HTTP 403 `api_gateway_keys_read`.
- Email confirmation, real login, TOTP enrollment/verification, signed-session Owner/Staff authorization and binary Storage tests remain blocked and were not claimed passed. No account/fixture creation or database writes in this retry; no cleanup required. Production untouched; no deployment or paid resources; Milestone 2 not started.
- Required action: make the staging HTTPS allowlist effective for the actual Codex execution proxy/environment (exact host `jwccyndyaamodxjtjtfo.supabase.co`, port 443), or have environment support investigate the CONNECT denial. Management API scopes are a separate optional Dashboard verification issue.

### 30 October 2026 — Real staging Auth, MFA and binary Storage verification passed

The published HTTPS allowlist is now effective. A fresh process received HTTP 200 from the fixed staging `/auth/v1/settings` endpoint: email login enabled, `mailer_autoconfirm=false` (email confirmation required). No credentials were logged. TOTP enabled is now independently demonstrated by real enrollment/challenge verification, rather than relying only on Dashboard evidence.

Executed `node --use-env-proxy scripts/admin/test-hosted.mjs` successfully. Used disposable admin-created, email-confirmed accounts only (no actual mailbox verification-link delivery tested). Real password login, six-digit TOTP enrollment/verification to AAL2, explicit logout, AAL1 staff denial, AAL2 Owner read/edit with audit and stale-update conflict, read-only analyst permissions, customer metadata/self-role escalation denial all passed. Temporary Owner was created through existing secure provisioning solely for this test and deleted; no permanent Owner was created.

Extended `scripts/admin/test-hosted.mjs` with reproducible real binary PNG Storage API checks: AAL1 uploads denied; AAL2 Owner upload/download byte equality; anonymous/public URL and AAL2 customer reads denied; foreign UID folder and text MIME upload denied; signed URL returns identical bytes; analyst can read but cannot upload. Deleted test binary via Storage API and verified download absence. No schema or Storage policy modifications.

Final read-only `verify:staging`: 12 public tables with RLS, 12 existing migrations, 77 validated constraints, four Storage policies, private draft bucket. Cleanup counts: 0 Auth users, 0 staff assignments, 0 products, 0 Storage objects. Provisioning security audit retained intentionally; generated product-edit audit removed with fixtures.

Verification: root lint, TypeScript and 58 tests passed; frontend lint, TypeScript, 122 tests and optimized production build passed; five operator security tests passed; `git diff --check` passed. Frontend unit tests emit existing Tailwind content configuration warning; production build succeeded. No migrations rerun, Production changes, paid resources or Milestone 2 work.

Remaining: Management `/config/auth` still HTTP 403 `auth_config_read`; API-key metadata HTTP 403 `api_gateway_keys_read`. Direct Auth public settings and configured operator keys permit tested operations without these optional reads. Full Auth Site URL/redirect allowlist remains Dashboard-reported, not API-inspected. Hosted browser verification has NOT run: latest read-only Vercel Preview remains `a14fa59de02cf9ab5edd6d402141c1621c0f919a` at `https://attires-arena-frontend-preview-6aj4cqn5v-fahim-s-projects1.vercel.app`, predating current staging changes. No browser bypass credential configured; existing automation would mutate project-wide protection shared with Production, so it was not used. Milestone 1 remains pending current-code staging Preview/browser verification; do not represent backend API checks as browser completion.

### 30 October 2026 — Milestone 1 signed off; Milestone 2 authorized

Final hosted browser verification passed on e279ccc / dpl_7Aty6LyTJjuQGb7WzTJEyXqXYXbZ after correcting Preview public configuration and the test selector. All synthetic users, roles, products and Storage objects removed; provisioning audit retained. Twelve migrations preserved; no migrations rerun or Production changes. Detailed sign-off and current evidence: [HOSTED_MILESTONE_1_VERIFICATION.md](HOSTED_MILESTONE_1_VERIFICATION.md). The two Management API read-scope restrictions are documented inspection limitations, not runtime security blockers. Milestone 2 may now start under the user's authorization, Staging only, $0. Production release remains separately gated.
