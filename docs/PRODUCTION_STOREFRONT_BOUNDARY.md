# Production-capable storefront boundary

28 October 2026, Asia/Dhaka. Preview verification release only; no production deployment authorized.

## Data boundary

- Production (including a standalone optimized server with no Vercel environment) never enables review inventory. `CLAUDE_DESIGN_PREVIEW=1` cannot override this.
- Explicitly enabled Vercel Preview/development retains the existing 18-piece review workflow. Unknown environment names fail closed.
- All catalogue surfaces use the same server-only adapter: homepage collections, listing/search, suggestions/actions, IDs/wishlist/cart, detail/metadata, category/brand/collection pages and recommendation candidates. No active adapter inherits from `mockDataSource` or imports mock inventory/customer/order records.
- Public products come exclusively from the existing `published_thrift_catalogue` RPC, using only a publishable/anon credential. Its existing database publication/verification, matching active SKU and inventory joins remain authoritative. No direct privileged table query, role credential or inferred publication.
- The response decoder also checks UUIDs, prices, size/color, dates and image identity. Until generic media/publication management is verified, the supplied physical-intake manifest's slug/image pairs are the supported public identities. Arbitrary QA/new records cannot become public merely by resembling a garment. Supporting additional intake identities requires an intentional change to this allowlist/verified publication contract; this release does not implement generic product creation/publishing.
- Network/configuration failures return no products, never fixture fallbacks. All reads are uncached (`no-store`). Unpublished detail URLs get an early HTTP 404 and the page/metadata lookup independently uses the same boundary.
- Public reviews are requested only for a product returned by the verified public projection. Customer/order/seed-cart reads remain empty, with explicitly unavailable mutations. Temporary Preview payment destinations are not returned in Production.
- Browser-persisted cart display data is reconstructed from the server-approved catalogue; obsolete review IDs and fabricated cached names/prices are discarded. This is display hygiene, not a transactional checkout implementation.
- With the current 18 drafts and zero public RPC rows, Production mode shows an honest coming-soon state. No garment status/facts were changed.

## Access and configuration

Production no longer has a global 404. `/admin` still uses actual Supabase getUser, trusted database membership, AAL2, scoped HttpOnly/Secure/SameSite cookies, protected layouts/actions and existing RLS/audit RPCs. No role, password, MFA factor or policy was changed.

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` work for both Preview and Production; existing NEXT_PUBLIC fallbacks remain supported. Shared server-only configuration rejects privileged keys and unintended project origins. The currently authorized project remains pinned; changing projects requires a deliberate reviewed configuration change.

`/motion-preview` and `/loader-preview` remain Preview-only, enforced both by Proxy and server pages. The existing noindex posture is retained; this is not a complete SEO/commerce launch.

## Deployment safety

The current Vercel project owns the live domains and shares its database between Production and Preview. No remote database migration, QA fixture, user/role mutation, Storage change or hosted login test may run against it under this task.

The deployment script supports an explicitly requested **code-only Preview** release from a reviewed baseline SHA. It checks ancestry and refuses migration/inventory/operator-database changes in that diff. The ordinary migration/test mutation isolation guards remain active. The deployment always uses `target: staging`, with no alias assignment or production promotion. This narrow code-only path is not permission to apply migrations to the shared production database.

Baseline for this release: `7a4a29c`. Before push, read-only Vercel inspection confirmed this project has no Git connection (so pushing this branch cannot trigger its Production build). Production deployment before release: `dpl_C6Y28xh9JNFcDqvJ92GUcvFweixi`.

## Verification

- Frontend lint, explicit TypeScript, 111 unit/security tests, optimized build passed.
- Root lint and 58 unit tests passed; six deployment-isolation tests passed.
- Disposable network-isolated PostgreSQL migration/RLS/inventory/audit/security suite passed. Its Auth helpers are simulated, not real hosted Auth.
- Real read-only public Supabase RPC succeeded and returned zero published products. Read-only database inspection returned 18 drafts.
- Actual local optimized server with `VERCEL_ENV=production` and the review flag deliberately enabled: homepage HTTP 200, coming-soon state, no product links at 390/1440, real original draft URL HTTP 404, empty search/category results, Preview routes HTTP 404, staff sign-in accessible and unauthenticated admin redirected to sign-in. Browser and screenshots: `artifacts/production-boundary/local-production/`.
- Authorized Owner + AAL2 acceptance and anonymous/customer/AAL1/error denials are tested against the real access function with mocked Auth/DB responses. A new real Owner password/MFA login was not attempted: this would require the user's interactive authentication; no credentials were requested or account modified.
- Published-item accessibility is tested with isolated RPC-response fixtures and the existing local database publication tests. No real product was fabricated or published for hosted verification.
- Hosted Preview verification and source/deployment receipts are recorded after deployment; do not infer them from local screenshots.

## Remaining limits / promotion decision

This change can support an honest coming-soon Production storefront with protected admin; it does not make checkout, payments, customer accounts or full product management production-ready. Legacy privileged APIs' MFA/audit hardening and separate staging-database configuration remain outstanding. Preserve noindex until the broader launch/SEO decision. Production promotion requires user approval after Preview review; a fresh real Owner sign-in/MFA check should be performed interactively. No automatic promotion.
