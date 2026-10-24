# Implementation plan

Use small reviewable increments. Existing task checkouts are isolated; do not create worktrees unless requested. Preserve user work. Never run destructive production migrations or publish without authorization.

## Phase 0 — audit
- [x] Inspect checkout, history, remote refs, environment binding names and available tools.
- [x] Record missing capabilities and architecture risks.

## Phase 1 — foundation
- [x] Create strict Next.js project, brand tokens, environment example, unavailable admin route and money primitives.
- [ ] Complete normalized Supabase migrations. First increment: eight foundation tables, constraints, indexes, update triggers and RLS implemented and tested in PostgreSQL; remaining commerce/storage schema is pending.
- [x] Add disposable PostgreSQL migration/RLS/inventory/concurrency test harness with isolated fixtures.
- [ ] Add full development seed data and hosted Supabase/API tests.
- [ ] Verify Supabase auth, refresh/session flow, account pages and server permission checks. Integration code and operator-only audited owner provisioning are implemented; real application/hosted verification remains required.
- [x] Test customer isolation and currently defined staff permissions against real development Auth/PostgREST (plus isolated PostgreSQL tests); see hosted result artifacts.
- [ ] Add CI, Tailwind/shared UI primitives and comprehensive environment validation.

## Phase 2 — persisted storefront
- [ ] Published catalogue queries, pagination, URL search/filter/sort, categories and collections.
- [ ] Product gallery, variants, accurate availability, size guides and related products.
- [ ] Persisted wishlists; mobile and accessibility E2E tests. No hardcoded production stock or reviews.

## Phase 3 — essential COD journey
- [ ] Persistent guest/customer carts and secure merge after authentication.
- [ ] Configurable Bangladesh shipping zones and rates, validated phone/address forms.
- [ ] Atomic checkout RPC: server prices, coupon constraints, locked inventory, idempotency, immutable item snapshots and unguessable tracking tokens.
- [ ] Explicit reservation lifecycle: reserve on accepted checkout; COD confirmation commits reservation; cancellation/expiration releases it transactionally; define and test expiration worker before enabling checkout.
- [ ] Separate order, payment and fulfillment transitions; refunds/returns ledger.
- [ ] Mandatory tests for last-item concurrency, rollback, duplicate requests, coupon races and unauthorized operations.

## Phase 4 — admin operations
- [ ] Database-backed metrics that distinguish placed orders from collections.
- [ ] Permission-controlled product, variant, image, CSV, inventory, order, customer and coupon operations.
- [ ] Upload validation, movement history, privileged audit logging and safe exports.

## Phase 5 — content management
- [ ] Validated homepage sections, banners, theme options, navigation, policies, size guides and SEO content; no arbitrary HTML/scripts.

## Phase 6 — external integrations
- [ ] Select payment/courier/notification providers with business authorization. Read official docs and verify sandbox before activation.
- [ ] Verify callbacks cryptographically, enforce amount/currency/order matching and deduplicate payment events.
- [ ] Optional consent-controlled analytics, newsletters and notification outbox; failures cannot duplicate orders.

## Phase 7 — launch readiness
- [ ] Production security headers/CSP, durable rate limits, backup/restore drill and deployment runbook.
- [ ] Unit, database integration and Playwright suites covering all 24 mandatory scenarios from the brief.
- [ ] Lint, strict typecheck, build, dependency review, mobile accessibility and measured performance.
- [ ] Vercel staging, Supabase migration/RLS validation, SEO metadata/sitemap/robots and launch checklist.
- [ ] Obtain explicit production deployment approval only after concrete launch review evidence.

## External prerequisites

A development Supabase project and public URL/publishable key are needed for real Auth/database validation. Configure public values in environment settings, never send credentials in chat. Do not request a privileged key until a specific server operation needs it; no privileged key is used in the initial shell. Providers, production domain, business shipping rules and policies remain undecided. These do not block independent schema and test development.

Current security verification boundary and required configuration: [Phase 1 report](PHASE_1_REPORT.md). Do not begin checkout, management or dashboard work before those foundation gates pass.

Hosted migrations and core Auth/browser sessions are now verified. Public email signup/delivery and the complete browser email callback remain Phase 1 gates; do not start Phase 2 until the final report passes.

## Current direct-code storefront checkpoint

The user authorized homepage implementation before completing the outstanding public-email Auth verification. The homepage now uses the approved white/maroon design on feature/attires-arena-premium-storefront. This changes frontend sequencing only; Phase 1's unresolved public-preview/email recovery gate is still open and no commerce readiness is claimed.

- [x] Initial responsive header/search/navigation, editorial hero and promotions, category cards, brand empty state, catalogue empty/error states, story and footer.
- [x] Anonymous published catalogue reads with URL search/category/newest/name controls; bounded to 24 items, not a complete paginated catalogue.
- [x] Local mobile/tablet/desktop screenshots and browser interaction checks.
- [x] Exact official logo and original cover integration from the uploaded files.
- [ ] Homepage user visual review.
- [ ] Next increment after review: persisted catalogue cards with validated variant prices, approved image data integration, pagination and accurate public availability; review schema separately before expanding it.
- [ ] Brand discovery remains an empty state until business-approved records/schema exist; do not publish example labels as real stock.
- [ ] Product detail, wishlist, cart and checkout remain later increments, subject to the required backend/security foundations.

### Homepage price-card follow-up

- [x] Add reusable published-product cards with integer-poisha BDT/sale formatting and anonymous active-variant price reads; verified query against development PostgREST (empty catalogue).
- [x] Add Featured Products section with an honest empty state while curated-selection persistence is absent.
- [x] Integrate the uploaded original logo file with its embedded wordmark/font and the full official cover.
- [ ] Integrate real product-image/featured/brand records; these remain required for a fully populated homepage.
- [ ] Await homepage visual review before starting the remaining storefront pages.
