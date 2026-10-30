# Product Management operational increments

All implementation and database changes in this report target **Staging `jwccyndyaamodxjtjtfo`**. Production database, Owner/MFA, storefront, DNS and environment settings remain unchanged. No paid services or external payment/courier integration enabled.

## Verified hosted product core

Application revision: `30be3260937391f89957f68c23defaa05ae3f558`.

Preview: https://attires-arena-frontend-preview-mjwloivfn-fahim-s-projects1.vercel.app/admin/login

Actual browser tests passed for password/TOTP login; draft name/description editing and reload persistence; multiple original shirt photo uploads into the private bucket; image descriptions, cover ordering and gallery removal; SKU creation with exact regular/sale BDT prices; zero initial stock; positive stock adjustment; negative-stock rejection; logout and protected-page rejection. Captured 390px/1440px screenshots were visually reviewed. These screenshots show disposable synthetic product records, not published business inventory. Those records, accounts and uploaded bytes were cleaned up. Permanent Owner and verified MFA factors compared unchanged.

Evidence is preserved in `artifacts/admin/product-core/`, independently from subsequent taxonomy testing.

Implemented database changes, applied once after successful rolled-back Staging dry runs:

- `20261030000300`: permission/MFA-checked draft metadata update, row lock, version conflict, audit transaction.
- `20261030000400`: private `product_media` associations, image order/alt text, actual object/own-folder validation, immutable linked files, restrictive Storage policies and reference FK.
- `20261030000500`: generic draft SKU/pricing writes with zero-stock inventory creation; versioned stock adjustments through the existing row-locked inventory function, movement ledger and audit. Generic variant editor refuses physical thrift intake.

The first twelve migrations were not edited, reset or recreated. No public table write grants, privileged browser credentials, RLS/MFA bypass or fabricated inventory introduced.

## Taxonomy increment

Migration `20261030000600` applied once to Staging after the local suite and rolled-back Staging dry run passed. Reuses `categories`; adds RLS-protected `catalogue_terms` (brand/collection/tag) and `product_catalogue_terms`. Narrow audited RPCs support create/edit, version-checked unused/unpublished deletion and draft product assignments. Referenced records cannot be deleted; at most one brand may be assigned. Brand publication alone does not expose an unoffered brand publicly: the public read policy also requires an associated published product.

Frontend: `/admin/taxonomy` provides real name search, type selection, deterministic 24-record pagination, creation, editing and deletion. Product details provide persisted category, brand, collection and tag selection. Actions recheck actual staff identity, MFA, role and exact Staging configuration. Activation flag is Preview feature-branch only; navigation is omitted while disabled.

Latest local validation: root/frontend lint and TypeScript; 58 root tests, 140 frontend tests and 9 operator tests (**207 total**); optimized frontend build; **172 local SQL assertions**, plus genuine two-connection inventory and stale-edit concurrency tests. Local PostgreSQL simulates Auth claims; real signed Supabase sessions and hosted browser results are recorded separately. Taxonomy real API/hosted verification is in progress at this report checkpoint; do not count build readiness as a browser pass.

## Current limits and next work

- Full Product Management is **not signed off**. Remaining: complete metadata/SEO/slug editing, generic measurements and size charts, physical intake verification, safe publication/archive/delete workflows, bulk editing and comprehensive final workflow QA.
- Product image uploads currently accept 8 files and 768 KiB combined per request, up to 20 images per product. Gallery removal detaches; unlinked bytes remain private until explicit media lifecycle cleanup. Test cleanup removes all fixture bytes.
- SKU management permits generic draft variants; physical thrift variants require the separate verification workflow, with real confirmed size/color. No actual shirt sizes are invented.
- Product taxonomy picker stops safely above 500 available categories/terms instead of silently dropping assignments; scalable searchable selection remains necessary before that volume.
- Admin taxonomy persistence is connected. Existing public discovery adapters are preserved and are not silently rewritten to expose new draft/review records.
- Real checkout/order persistence, payment verification, Customers, Marketing, Analytics and Settings are subsequent work. No fake sales, revenue, profit, orders or payments are added.

Reproduce local checks with the commands in `package.json`; remote verification uses `node --use-env-proxy scripts/admin/test-generic-draft-staging.mjs --gallery --variants --taxonomy`. Hosted verification additionally uses `ADMIN_VERCEL_DEPLOYMENT_FILE` pointing at the exact Preview deployment record. It creates only disposable Staging fixtures and revokes deployment-specific automation access afterward.
