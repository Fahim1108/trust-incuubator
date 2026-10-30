# Milestone 2 — Full Product Management

Milestone 1 staging security foundation passed before implementation started. Production is unchanged. Budget remains $0. No existing migrations are rerun; no new migration has been applied in this increment.

## First implemented increment

- `/admin/products/library`: actual PostgreSQL product records through the authenticated user's publishable-key client and existing AAL2 RLS, including basic drafts created through the existing audited RPC.
- Server-backed literal name search, persisted status filters, allowlisted sorting, exact counts, deterministic 24-record pagination and truthful empty/error states.
- `/admin/products/[id]`: validated UUID, actual saved description/status/category ID, garment intake facts and verification flags, integer-poisha pricing, real variant activation state and persisted on-hand/reserved/available quantities. Missing variants, sizes and inventory remain missing, never fabricated.
- Existing garment editor, draft creation and staging private-upload tool remain connected. These routes do not publish products, verify sizes or enable buying.
- Staging-only navigation for the new library/media tools. Production access to the new pages is rejected. Existing public storefront and Production navigation remain unchanged.
- Validation tests cover malformed/repeated filters, status/sort allowlists, literal wildcard escaping, encoded Bangla search links and exact large integer price formatting.

This is **the first functional increment**, not completion of Full Product Management. The library is read-only except for links to the already verified creation/garment-edit workflows. New generic drafts still cannot be fully edited/published or receive persistent product-media associations.

## Remaining implementation order

1. **Complete product draft editing contract.** Reuse `products`, `product_variants`, `inventory` and `thrift_intake`; add narrowly granted AAL2 RPCs where the current schema has no safe write interface. Validate full metadata, money and physical garment facts, record audit changes, enforce idempotency and optimistic concurrency. Do not add direct authenticated table write grants.
2. **Persistent product-media association.** Version-controlled proposed migration for private media ownership, product references, ordering/alt text, lifecycle and immutable application audit. Review separately before any authorized Staging apply. Link only actual existing objects; no arbitrary cross-account paths. Improve upload size beyond the foundation's 768 KiB action limit using supported signed upload boundaries; never a privileged browser key. Verify deletion and orphan cleanup.
3. **Size, measurements and inventory management.** Preserve a single actual thrift size/color; no artificial variants. Add explicit verification controls with audit. Use row-locked inventory transactions and reserved-stock constraints; never overwrite stock through generic metadata updates.
4. **Category/brand/pricing operations.** Inspect existing category RLS and absent brand support before proposing schema changes. Real editable records, validation, integer prices and permitted-role checks. No example brands published as stock.
5. **Validated publication/archive workflow.** Refuse publication without real required facts, approved image and valid active SKU/inventory. Preserve Production catalogue safeguards and avoid enabling new generic-product publication until public adapters are explicitly updated and tested. Prefer reversible archiving; do not delete products referenced by orders.
6. **Dark admin design and full workflow QA.** Scope style tokens/components to admin; preserve storefront design. Verify product-manager permissions alongside Owner/analyst/customer; stale edits, duplicate submission, upload failure/cleanup, audit, database isolation and responsive browser flows.

No Production database migration, environment update, DNS change, account/MFA change, live publication or Production deployment is authorized by this milestone. A permanent Staging Owner was explicitly approved and is now confirmed with verified TOTP and user-confirmed dashboard access; see STAGING_OWNER_ACCESS.md. Management inspection permissions are not required for these runtime services; use the existing direct evidence and Dashboard verification documented in `MANAGEMENT_API_LIMITATIONS.md`.

## Final verification of the first increment

**PASSED** against application commit `97f61fa0b06365dfaad51d8d187a8358fe65a3b3`, deployment `dpl_5MhkBwzeYbC6WPTPWT73mfxdg8B1`:
https://attires-arena-frontend-preview-k0on81mdt-fahim-s-projects1.vercel.app/admin/login

Hosted browser created a real unpublished draft through the existing UI, found it using server-backed draft/name filters, opened its saved description and honest missing-variant state, verified published-only filtering excludes it, and captured 390px/1440px library/detail screenshots. All Milestone 1 browser checks passed again, including QR enrollment, TOTP, Owner/analyst/customer restrictions, private image UI, persisted edits/audit, logout and role revocation. Screenshot capture waits for visible images and fonts; original logo verified visually. Screenshots show temporary synthetic staging records, all subsequently removed.

Root lint/TypeScript/58 tests, frontend lint/TypeScript/129 tests/optimized build and five operator security tests passed: **192 automated tests**, plus real API/hosted tests. The initial TypeScript BigInt-literal target error was corrected by using the supported BigInt constructor; no compiler target or security setting was weakened. No remaining final failures.

Final read-only verification: 12 migrations unchanged, 12 RLS tables, 77 validated constraints, four Storage policies; zero Auth users, staff assignments, products and Storage objects. Security provisioning audit retained. Test cleanup now also discovers only the generated fixture-user folders so a lost upload response cannot leave an untracked binary. Deployment-only share access was revoked and project-wide protection matched before/after. No permanent Owner, migrations, Production changes or paid services.

Evidence: `artifacts/admin/milestone-2/` (fresh screenshots and machine-readable results). Test-only capture/cleanup refinements and reports may be committed after the application deployment; the deployed application source SHA above is the exact browser-verified revision. The default Preview key was repaired as Sensitive staging configuration; no Production key was read or changed. Ordinary Preview access still requires authorized Vercel access. There are no permanent test login credentials.

### Exact application files for this increment

- `frontend/claude/src/lib/admin/library-validation.ts`
- `frontend/claude/src/lib/admin/product-library.ts`
- `frontend/claude/src/app/admin/(workspace)/products/library/page.tsx`
- `frontend/claude/src/app/admin/(workspace)/products/[id]/page.tsx`
- `frontend/claude/src/app/admin/(workspace)/layout.tsx`
- `frontend/claude/src/components/admin/access/AdminShell.tsx`
- `frontend/claude/tests/admin-library.check.ts`

Remaining tasks and restrictions above still apply: this is the verified library/detail increment, **not complete Full Product Management**. Next: audited generic-draft editing and persistent private-media association, with separately reviewed version-controlled Staging database changes where required. Do not apply migrations or enable live publication without the necessary authorization.

## Next increment prepared — basic draft metadata editing

Permanent access is now verified. Added the validated frontend, default-off Staging activation gate, additive migration 20261030000300 and executable SQL/concurrency tests for basic name/description editing. Local checks passed: 201 JS/TS/operator tests, 138 SQL assertions, true overlapping draft edit conflict handling and the existing concurrent inventory test. **Not applied to Staging or enabled in Preview**; the existing 12 remote migrations remain intact and the new RPC is absent. The required exact approval and verification procedure is documented in [GENERIC_DRAFT_MIGRATION_REVIEW.md](GENERIC_DRAFT_MIGRATION_REVIEW.md). Full product management remains incomplete.
