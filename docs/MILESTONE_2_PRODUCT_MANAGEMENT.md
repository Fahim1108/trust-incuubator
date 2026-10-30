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

No Production database migration, environment update, DNS change, account/MFA change, live publication or Production deployment is authorized by this milestone. A permanent staging Owner still requires explicit approval. Management inspection permissions are not required for these runtime services; use the existing direct evidence and Dashboard verification documented in `MANAGEMENT_API_LIMITATIONS.md`.
