# Review-ready increment: audited basic draft editing

**Current status: Staging migration applied and real Auth/PostgREST permissions verified.** The user's subsequent operational-management instruction authorized continuing Staging database-backed implementation. Migration 20261030000300 passed the existing rolled-back dry run and was applied once, preserving the earlier 12 migrations. Real temporary AAL2 Owner/Product Manager edits, stale-write rejection, validation, no-op auditing and customer/analyst/AAL1 denial passed. Permanent Owner/MFA remained unchanged after fixture cleanup. Hosted verification is tracked separately in PROGRESS.md; historical preparation details below describe the pre-activation checkpoint. Production remains untouched.

## Proposed exact database change

File: `supabase/migrations/20261030000300_generic_draft_metadata.sql`.

Adds one new function, `public.admin_update_product_draft(uuid,timestamptz,text,text)`, revokes default PUBLIC/anonymous execution and grants authenticated execution subject to the existing trusted permission/MFA checks. It creates no table, changes no existing function/policy/constraint, grants no direct product write access and modifies no business rows during migration. The previous 12 migration files are preserved.

At invocation, only an actual Owner/product manager with AAL2 and `catalogue.manage` may update a non-intake product whose status is already draft. It locks the target row, compares the exact saved timestamp, returns HTTP 409 for a stale edit, validates text limits, and changes only name/description. It cannot change publication, category, slug, prices, variants, measurements or inventory. Imported garments retain their existing dedicated editor. The before/after audit and metadata change are a single transaction; audit failure rolls back the edit. An unchanged payload performs no write/audit duplication.

## Prepared frontend

- `src/lib/admin/basic-draft-validation.ts`: typed target/version/text validation; ignores unrelated caller-supplied privileged fields.
- `src/lib/admin/basic-draft-actions.ts`: rechecks Staging-only flag, real identity/MFA/role, validation and returned saved timestamp; calls only the new RPC; handles conflict/error honestly and revalidates relevant admin pages.
- `src/components/admin/access/BasicDraftEditor.tsx`: genuine pending/error/success states, duplicate-click prevention and unsaved-edit protection. Remounts on the fresh database version after save.
- `src/app/admin/(workspace)/products/[id]/page.tsx`: eligible editors are rendered only for managers of non-intake drafts and only after activation. Default-off state explains the pending migration and provides no misleading Save button.

Paths above are relative to `frontend/claude`. Enable `STAGING_GENERIC_DRAFT_EDITOR=1` only for Preview after the approved migration and real integration tests. It defaults off; even a forged action request while off cannot call the new RPC. Production rejects the action regardless of the flag. No live feature activation or Preview variable changes have been performed for this increment.

## Actual verification

- Root lint, TypeScript and **58 tests** passed.
- Frontend lint, TypeScript, **134 tests** and optimized production build passed.
- **9** operator/migration preparation/security tests passed.
- Total: **201** JS/TS/operator tests.
- Disposable network-isolated PostgreSQL 17 applied all 13 source migrations locally and passed **138 SQL permission/validation/audit assertions**. This uses simulated `auth.uid()`/JWT claims, not real Supabase Auth or signed JWT verification.
- Two independent PostgreSQL connections explicitly demonstrated row-lock contention for generic-draft edits: the first saved; the waiting stale editor received PT409; winning metadata and exactly one audit row persisted.
- Existing real two-connection inventory negative-stock test passed unchanged.
- Container cleanup is automatic. No real customer, Owner or business data was used in the local tests.
- Log: `artifacts/admin/generic-draft/local-db.log`.

Reproduce: `npm run test:db`, `npm run lint`, `npm run typecheck`, `npm test`, `npm --prefix frontend/claude run lint`, `npm --prefix frontend/claude run typecheck`, `npm run test:claude`, `npm run build:claude`, `node --test scripts/lib/staging-operator.check.mjs scripts/lib/staging-migrations.check.mjs`.

Read-only remote confirmation: Staging still has **12 applied migrations**, and the new RPC is absent. No remote DDL or migration dry run has been executed. The new function and editor have NOT been verified against real Staging Auth/PostgREST or in a hosted browser; do not count local SQL simulation as those tests.

## After explicit approval only

1. Recheck that Preview uses the isolated Staging project and Production differs; reread migration history/digests and confirm this is the only pending version.
2. Execute the existing migration tool's Staging-only transaction-rolled-back dry run and review output.
3. Apply this one additive pending migration to Staging, preserving the 12 existing versions. Never reset a database.
4. Use temporary Staging test accounts to verify real AAL1/AAL2 Owner/product-manager/analyst/customer permissions, persistence, conflicts and audit rollback; preserve the permanent Owner and TOTP.
5. Enable the private flag for Preview only; deploy verified source and test actual UI save/reload/conflict/audit behavior, then clean only test fixtures. No Production deployment or business-data mutation.

The user previously required explicit authorization before running migrations again. This review is the concrete result for that approval; it is not authorization to apply or enable anything itself. No broader Management API scopes, paid services or Production changes are required.
