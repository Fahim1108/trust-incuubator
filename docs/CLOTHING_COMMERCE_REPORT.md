# Clothing browse and commerce boundary increment — 2026-10-26

Application: `frontend/claude`; branch `feature/claude-frontend-integration`. Root storefront, Supabase configuration, existing migrations/RLS and production are preserved. No new SQL migrations or remote database writes.

## Review and scope

Both Next applications and the two versioned migrations were inspected. The root has Supabase session/Auth services, public catalogue reads and tested permission-checked inventory adjustment. Its schema has profiles/RBAC/categories/products/variants/inventory/movements and owner-provisioning audit, but **no orders, reservations, coupons, eligibility, redemption or payment workflow**. Anonymous visitors cannot read protected inventory counters. The separate Claude adapter still supplies clearly disclosed catalogue fixtures and local cart/wishlist; it is not a live Supabase commerce adapter.

No physical inventory, measured thrift garments, discounts, shipment events or successful transactions were invented. Existing multi-size fixtures are retained as multi-size fixtures; they are not reclassified as real single-piece inventory.

## Implemented by requested phase

1. **Classification/navigation (typed catalogue boundary):** separate multi-valued pattern, occasion, fabric, design and sleeve dimensions. Known classification options are centralised, avoiding duplicate categories. Fixture classifications use only exact explicit metadata tags, never product names. Shirt shortcuts appear only for published/available entries with matching explicit attributes. Real database persistence/editor remains unconnected.
2. **Homepage:** homepage brand section removed even from older saved homepage configurations. Brand data and bookmarked listing routes retained; brand discovery links removed from main/footer navigation. Replaced by inventory-derived Shop by Size. Seven canonical size options are supported; unavailable options are hidden, counts never invented. XXL/XXXL aliases map to 2XL/3XL; Over Size stays distinct. Raw SKU/variant sizes remain unchanged. Winter tile routes to explicit winter collection membership only, with an honest empty state if none are available; no duplicate product records.
3. **Official chart:** central exact inches/ranges, unspecified Over Size length, garment-variation note, accessible existing guide modal. Actual chest/length fields are separate optional DTO fields and visible when supplied. No reference measurement is stored as an actual physical garment measurement.
4. **Reusable ProductSizeBadge:** #800020/white, compact fixed-size labels or honest multi-size count with full available-size accessible label. Shared ProductCard covers homepage, search, listings, rails and recommendations; no apparel badge for accessories/shoes.
5. **Recommendations:** same canonical in-stock size, same category preference, published only, current product excluded, unique IDs. Fixed-size products resolve automatically; multi-size products update after a real size selection. Section hidden when no eligible size/candidates. Operates on adapter records, currently fixtures.
6. **Filters:** color controls/chips removed, legacy color URL values ignored and dropped on updates. Product color variants and gallery selections preserved. Brand/category/clothing-size/in-stock/sort/search/pagination/reset retained; price controls remain absent.
7. **Skeletons:** shared primitives plus all nine requested layout components. Customer search, sorting/filter transitions, pending buttons/newsletter, route fallbacks and cart/checkout hydration no longer mount logo/ring loaders. Old loader demos remain isolated outside customer flows. Genuine pending/error state logic remains; reduced-motion disables shimmer. No runtime loading delay added.
8. **Guest checkout:** no sign-in requirement for browsing/cart/delivery/payment review. Existing COD 70/130 policy and manual bKash/Nagad panels are preserved. Orders/payments remain disabled because there is no secure order backend; successful authenticated/guest checkout is not claimed. No anonymous order-table access added.
9. **Coupons:** removed accepted local demo discounts. Coupon action rechecks the trusted adapter's customer session and fails closed. A guest sees “Please sign in to redeem your coupon.” and an inline sign-in modal. Cart and checkout state remain mounted on cancellation/failure. Reward configuration is disabled with no invented discount or qualifying milestone. **Issuance, redemption, expiration/usage enforcement, guest claiming and atomic double-redemption are not implemented**; they require the missing secure order/customer association infrastructure and business-approved offer/milestone.
10. **WhatsApp:** one global floating green/white control, central configuration shared with footer, soft ripple, reduced motion, keyboard/focus labels, safe-area offsets and input/critical-button collision handling. Removed duplicate checkout-only mount. Footer original logo/wordmark/socials/credit remain.

## Required trusted backend increment

Implement the order/reservation/payment foundation first: immutable quote snapshots, integer minor-unit totals, trusted shipping calculation, rate-limited idempotent guest order service, atomic stock reservation/commit/release and private guest tracking capabilities. Existing `adjust_inventory` serialization is not a checkout reservation engine.

Then add versioned classification/collection relations and validated measurement metadata to the existing products (not a parallel product table), with RLS and a narrowly scoped public availability projection. Connect the Claude adapter to these records; do not expose staff inventory policies or service credentials to browsers.

Rewards must be issued by a trusted, business-approved successful lifecycle event. Define the actual offer and refund/cancellation rules before enabling it. Enforce unique qualifying order/beneficiary grants, idempotent lifecycle events, account-specific entitlements and transactional redemption locks/constraints. No email/phone string equality may claim a guest order: require a signed, expiring single-use order capability plus verified ownership tied to the authenticated identity, with audit and replay protection. Notification delivery must be independent from entitlement issuance.

## Verification commands and limits

- `npm run check:claude`
- `npm run test:claude`
- `npm run build:claude`
- `npm run lint && npm run typecheck && npm test`
- `npm run test:db` — disposable network-isolated PostgreSQL, simulated Supabase JWT/Auth claims, actual RLS/transactions and independent-session concurrent stock adjustments. Not a real hosted Supabase checkout test.
- `npm run test:claude:browser`
- `node scripts/test-clothing-browse.mjs` — 360/390/430/768/1440px, explicit Winter membership, available clothing sizes/aliases, no brand showcase/color/price controls, badge, guide focus/Escape, same-size results, genuine search skeleton with a controlled request hold, reduced motion, guest coupon cancellation/state preservation and unchanged disabled advance panel.

The auth-pending check in `test-ui-refinement.mjs` now expects skeleton feedback. Old explicit loader demonstration routes remain gated, and older ring-specific scripts are not counted as current customer-loading verification; the clothing browser suite verifies current skeleton behavior. No live coupon redemption, email, guest claim, concurrent order placement or successful payment tests are reported. Screenshots and final results live under `artifacts/clothing-browse/` and `docs/PROGRESS.md`.
