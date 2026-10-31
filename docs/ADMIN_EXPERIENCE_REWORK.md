# Admin experience rework — 31 October 2026

## Audit and implementation decision

The attached master specification and mockup replace the previous dark-dashboard direction. Preserve the storefront's actual #6B0202 maroon, #400000 deep maroon, pure white surfaces, #171717 text, #74706C secondary text, original logo artwork and Inter typography. Mockup numbers and unsupported action buttons are visual references, not business data.

The current application is Next.js 16.4.3 App Router, React 19.3.1, TypeScript, Tailwind and Supabase. Existing secure server actions, sixteen migrations, RLS, MFA, role permissions, private image Storage, audited variant/inventory RPCs and optimistic concurrency are reusable. The product experience was fragmented across a long page, separate library/intake tools and stale dashboard guidance. The dark theme conflicted with the new reference. Orders, payments, customers, financial reporting and notifications do not yet have complete persistence contracts. Public storefront catalogue adapters are not fully synchronized with all admin product fields. Those are genuine gaps, not completed modules.

Read-only Staging foundation check passed: project jwccyndyaamodxjtjtfo, sixteen migrations, fifteen RLS tables, 94 validated constraints, private draft bucket. One existing business product is present and must be preserved. Production Supabase/database/Auth/MFA, DNS and deployment remain outside this increment. No migration is needed for the UX rework.

## Current increment: one coherent working experience

- Maroon sidebar with minimal Lucide icons and grouped, collapsible navigation containing working routes only. Actual product search in the header. No fake notification bell, profile name, import/export or sales menu.
- Mobile bottom navigation for Home, Products, Add, Categories and More according to actual staff roles; safe-area padding, touch targets and accessible native menu dialog.
- White dashboard with real catalogue counts, Dhaka date and meaningful links. Removed stale claims that creation/images were unavailable and removed large placeholder-service cards. No invented revenue or customer figures.
- Server-backed product library with compact desktop table and dedicated mobile cards, existing search/status/sort/pagination and correct Dhaka timestamps.
- A single product workspace organizes existing operations into Details, Images, Organization, Variants and Stock. Keyboard tabs preserve mounted form state. Actual variant edits and stock adjustments expand on demand rather than overwhelming the page.
- Create a persisted draft, then continue directly to that product's workspace. Each operation retains its genuine server-side pending/error/success and authorization behavior. No misleading global Save/Publish action that implies an atomic operation which does not exist.

The mockup style is adopted without copying its sample data. All images remain the existing official assets. Customer storefront design is unchanged. Production is not deployed.

## Cohesive delivery roadmap and acceptance gates

1. **Validate this experience:** actual Owner/MFA and permission checks, create/open/edit flow, keyboard navigation, form-state retention, images, variants and inventory at mobile/tablet/desktop widths. Obtain real screenshots and verify existing business records remain intact.
2. **Complete one product-to-storefront lifecycle:** a versioned product contract for metadata/SEO, actual attribute combinations, measurements, images and costs; atomic validation and publication; correct staging public catalogue reads/cache invalidation; test edit-to-public-page synchronization. Avoid parallel disconnected editors. Costs remain staff-private. No inferred physical facts for real garments.
3. **Inventory as the source of stock truth:** derive parent availability from variant rows, never maintain a second independently editable total; idempotent stock operations, movement history and concurrency/failure tests. Existing row locks/reservation bounds are retained. Extend current size/color uniqueness to other attributes through reviewed migrations only.
4. **Order and payment lifecycle before order screens:** transactions for stock holds/release, explicit allowed transitions, immutable line-price snapshots, idempotent submissions, activity events, COD/advance/manual verification, shipping addresses and payment reconciliation. Partial cancellation/returns restore only eligible quantities once. Courier providers remain unconfigured until a real supported integration is verified; manual tracking can be genuinely persisted first.
5. **Customers, marketing and settings:** actual customer/guest-order relationships, BD phone normalization, granular staff permissions, auditable configuration changes, shipping/payment destinations and coupon eligibility/usage enforced by database transactions. Preserve production accounts and credentials.
6. **Reporting and notifications from real events:** distinguish gross sales, discounts, refunds, net sales and collected/recognized revenue; profit unavailable without reliable cost snapshots. Define timezone-aware date windows, comparisons, CSV formula escaping, repeat-customer/AOV/cancellation definitions. Notification records need read state and a unique event key; realtime may deliver events but must not create duplicates. No sample charts.
7. **Release gate:** hosted workflows, all-role checks, concurrency/rollback/idempotency tests, accessible mobile interactions and actual staging storefront synchronization; documented recovery, migration and promotion plan. Production changes require separate approval.

Bangladesh conventions apply throughout: exact integer-poisha money displayed as ৳, Asia/Dhaka date boundaries, accepted Bangladesh mobile formats, location-appropriate addresses and configured shipping/COD/payment terms. No invented fees, payment confirmations or courier results. Budget remains $0.

## Verification status

**Experience increment verified on Staging.** Application source: `ae768fc6704fa122f8e3f4ab62f1e49a90fc04c7`.

Preview: https://attires-arena-frontend-preview-jz54oieg4-fahim-s-projects1.vercel.app/admin/login

- Root/frontend lint and TypeScript, optimized frontend build and **210 automated tests** passed (58 root, 143 frontend, 9 operator/security tests).
- Full real signed-session role matrix passed on `f2a581ec428393f34f99f863c7daf4f9d7fd1508`: Owner/Product Manager allowed; customer/analyst mutations and AAL1 admin access rejected. The subsequent changes are touch-form/branding presentation; database functions, RLS and authorization are unchanged.
- Final exact-source Owner browser regression passed password/TOTP, persisted creation with a database-confirmed destination, details edits, keyboard tabs, unsaved Details retention across another-tab save, stale-write rejection, taxonomy, multi-image upload/cover/removal, SKU pricing, Add/Remove stock, negative-stock rejection, actual photo/price/derived-inventory list data, header search, filters and logout/protected routes.
- Overflow checked at 360, 390, 430, 768, 1024 and 1440px. Desktop uses a table; tablet/mobile use dedicated cards. Screenshots at 390/1440px were visually compared with the supplied reference. Final mobile logo is original white artwork on a centered maroon badge; its original wordmark and aspect ratio remain intact.
- Touch-emulated Chrome verified tab navigation, quantity input focus, Add/Remove selection, More/drawer controls and reduced motion. Existing global reduced-motion suppression is 0.01ms; the test checks that effectively-zero duration. No storefront global CSS was changed. Physical iOS/Android keyboard testing remains a release check, not a claimed executed test.
- Initial hosted testing found and fixed the regenerated draft-ID navigation bug. Visual review found and fixed the invisible mobile derivative logo. A literal-zero reduced-motion test was corrected to match the existing global rule; the complete final regression passed.
- Temporary accounts, products, terms and image bytes were removed. Permanent Owner/MFA and the existing product IDs/saved versions compared unchanged. Read-only foundation verification retains sixteen migrations, fifteen RLS tables and 94 validated constraints. No schema change, reset, Production modification, paid service or production deployment.
- Deployment-only automation access revoked; project-wide protection unchanged. Screenshots contain isolated QA records, subsequently removed.

Evidence: `artifacts/admin/experience/security-matrix/` (full role run), `artifacts/admin/experience/final/` (final Owner run/deployment identity), and the dashboard/details/images/products/stock screenshots in `artifacts/admin/experience/`.

The list's price ranges and unreserved units come from the same variant/inventory rows edited in the workspace. Missing inventory is not displayed as zero. A bounded read over 100 variants suppresses incomplete totals. Private thumbnails use short-lived signed URLs and an explicit no-preview icon when unavailable; no replacement product photos are fabricated. Stock adjustments offer Add/Remove plus a positive numeric quantity for mobile keyboards.

This signs off the current experience rework only. Full product CRUD/publishing, multi-attribute variants, cost/SEO/size-chart fields, staging public-storefront synchronization and the other business modules remain incomplete. Imported garment editing still uses the verified intake editor. Existing upload and taxonomy-picker limits in PRODUCT_MANAGEMENT_OPERATIONAL_REPORT.md remain. Next is the integrated product-to-storefront lifecycle in roadmap step 2.

Reproduce: `npm run check:claude`, `npm run test:claude`, root `lint`/`typecheck`/`test`, operator checks and `npm run build:claude`. Full hosted role/workflow run: `ADMIN_VERCEL_DEPLOYMENT_FILE=... node --use-env-proxy scripts/admin/test-generic-draft-staging.mjs --gallery --variants --taxonomy`. A subsequent presentation-only Owner regression adds `--owner-ui-only` and records that restricted scope explicitly.
