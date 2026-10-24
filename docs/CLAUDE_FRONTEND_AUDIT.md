# Claude frontend import audit

## Scope and decision

The uploaded `attires-arena-frontend update.zip` is the primary design reference. Its CODEX_HANDOFF.md/README are source documentation, not authorization to replace the backend or publish sample data. Original file SHA-256 hashes are recorded in CLAUDE_SOURCE_MANIFEST.json. Archive extraction rejected traversal, symlinks and oversized members; no uploaded install/generation scripts were executed.

The package already uses Next.js App Router, React, strict TypeScript and Tailwind 3. It contains 162 original source files, 28 page files and 232 local SVGs; SVG scanning found no script/foreignObject/onload/javascript markup. This limited static check is not a general upload sanitizer.

Imported under `frontend/claude` on `feature/claude-frontend-integration`. This is an isolated, explicitly labelled visual-review application, not a replacement for the root application. All source/components/assets are preserved; root storefront/Auth/admin routes and database remain unchanged. After visual approval, migrate components into the root route groups behind verified service adapters; do not deploy this sample application as the business store.

## Feature assessment

| Area | Assessment |
| --- | --- |
| Homepage/branding | Implemented: original Claude logo assets, centered header, hero, category/brand tabs, product rails, editorial sections, newsletter UI. Visually checked at 390/1440px. |
| Catalogue | Implemented against isolated fixtures: filters, sort, URL state, search suggestions, pagination, category and brand views. Not connected to Supabase. |
| Product details | Gallery, zoom, swatches, variant/size selection, size guide, sample reviews and related items implemented. Product images are mostly generated SVG placeholders. No real availability assertion. |
| Cart/wishlist | LocalStorage demonstrations with seeded sample cart, coupon calculations and sample shipping amounts. Browser state is not authoritative inventory/pricing. Keys now use aa.claude-preview.*. |
| Checkout | UI exists; adapter order mutation returns ok:false/not_connected. No payment success or actual orders. Sample delivery charges 80/130 BDT must never become production defaults. |
| Accounts/orders | UI reads mock customer, address and order fixtures; signup/login/reset/profile mutations remain disconnected. Sample order lookup ignores verified contact and uses readable identifiers: unsuitable for private real records. |
| Admin appearance | Components retained, route disabled with notFound until existing server permissions are integrated. Root /admin still fails closed. |
| Animations | Existing hover zoom/secondary image, navigation underline, button transitions, wishlist pop, cart drawer and section reveal retained. Reduced-motion behavior retained; corrected hero hover/manual pause interaction and hydration handling. |
| Security | Preview opt-in gate and Vercel Production rejection; noindex metadata/headers; public admin disabled. No Supabase credentials passed by the isolated launcher. No live payment/provider adapters. |
| Testing | Archive had no executable tests. Added adapter/gate checks and browser smoke/interaction script; existing backend unit/SQL tests retained. |

## Compatibility and dependencies

Original: Next ^15.5.28, React ^19.1.1, TypeScript ^5.9.3, Tailwind ^3.4.19, Lucide ^0.544.0, ESLint 9. The original lockfile is fingerprinted; root package/lockfile was not overwritten.

The isolated package now aligns Next 16.4.3 and React/ReactDOM 19.3.1 with the root, with current Next ESLint configuration. The initial Next 15 dependency audit found a high PostCSS advisory; the aligned dependency audit reports zero production-dependency advisories. This is not a security certification.

Lucide 0.544.0 remains in the preview because the newer root icon package removes the social-brand icon exports used by Claude. This intentional temporary duplicate preserves appearance. Tailwind/PostCSS and strict isolated tsconfig remain local; root tsc/eslint exclude this independently checked package. The Next framework updated its jsx setting to react-jsx. Root engines remain Node 24.

The four approved font families (Cormorant Garamond, Inter, Playfair Display and Allura) are self-hosted through OFL Fontsource packages. No Google font fetch is needed at runtime/build. Package tracing root is explicitly scoped. Local SVG placeholders bypass image optimization; broad optimized-SVG acceptance was removed.

Next.js 16 lint exposed synchronous effect cascades in imported code. Replaced prop resets with guarded render-time adjustments and scheduled external storage/overlay hydration at animation frames with cleanup; no lint/type rules were disabled to hide errors. Fixed stale search state on clear/short input. Retained drawer focus trap and Escape behavior.

## Backend contract gaps

| Existing root backend | Claude frontend expectation | Required adapter/work |
| --- | --- | --- |
| Integer BDT minor units (poisha), validated prices | Money is whole BDT number; browser arithmetic | Keep authoritative totals as integer minor units on server. Explicit display conversion; never accept browser price/discount/shipping. |
| Published products, categories and active variants | Rich product plus mandatory brandId, images, badges, ratings, swatches, featured flags | Map only verified fields; empty/absent data for unsupported fields. Review versioned schema separately. |
| Exact inventory restricted by staff RLS | Variant.stock directly available to browser | Add a scoped public availability contract; never expose private inventory rows or invent stock. |
| Supabase profile id/display_name and auth.uid() | Mock customer/email/phone/addresses/orders | Reuse root authenticated server client/actions; real records require RLS and proper tables. Never use mockCustomer as a session. |
| No verified cart/order/shipping/coupon transaction backend | Local cart, demo coupons, delivery-zone amounts, checkout payload | Trusted persistence, authoritative calculation, idempotent atomic checkout and stock lifecycle must exist before enabling purchasing. |
| Owner provisioning and protected admin boundary | Unauthenticated appearance editor/components | Keep routes unavailable until server permissions, settings validation, media rules and audit writes are implemented. |

No database migration, production setting, payment/courier provider, real signup/reset email or production deployment was performed. Existing hosted Phase 1 email/recovery limitations remain unresolved.

## Integration order after visual review

1. Review the staged Claude screenshots; refine only identified design issues.
2. Port approved UI/components into the root App Router, retaining root Auth/callback/proxy and private routes; unify build tools only when mounting.
3. Implement typed catalogue/category adapters over the verified anonymous public reader; use proper missing-image/brand states and server minor-unit prices.
4. Add reviewed persistence/schema for missing brands/images/featured data and public availability; no production schema change without authorization.
5. Integrate real profile/addresses/wishlist/cart only behind appropriate auth/RLS services.
6. Enable checkout only after the master plan's verified transactional commerce foundation exists; remove all sample fixtures from live entrypoints.

## Verification results for this increment

- Root lint, strict TypeScript, 58 existing unit/component tests and production build passed.
- Imported package lint/typecheck and optimized production build passed after version alignment, icon-export correction and effect refactors; zero lint warnings remain.
- Ten preview adapter/access-gate checks passed. These are isolated contract checks, not hosted Supabase integration.
- Existing Docker PostgreSQL migration/RLS/inventory assertions and two-session concurrency check passed (simulated Auth claims; not hosted Supabase).
- Browser checks passed for 20 routes at 390px and 1440px, white page backgrounds, no horizontal overflow or JavaScript exceptions, original Claude logo loading, cart drawer/Escape, admin 404, wishlist persistence, search and URL sorting. Screenshots use reduced motion for deterministic captures.
- Dependency audit reported zero production-dependency advisories after upgrading the isolated package.
- Root src/, supabase/, next.config.ts and root package-lock.json are byte-for-byte unchanged by this import. No real Auth, orders, payments or private data integration was claimed.
