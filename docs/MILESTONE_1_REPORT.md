# Admin 2.0 Milestone 1 — 30 October 2026

**Status: database/Storage foundation implemented and verified; full Milestone 1 acceptance remains blocked by Auth/API credentials permissions.** No next milestone has started. This is not a full e-commerce/admin completion or launch claim.

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
