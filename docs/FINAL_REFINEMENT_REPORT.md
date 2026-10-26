# Attires Arena refinement — 27 October 2026

Scope: `frontend/claude`, branch `feature/claude-frontend-integration`, separate Vercel project `attires-arena-frontend-preview`. The two uploaded request files are identical and end mid-sentence after section 11 (`If`); this report addresses all complete requirements supplied. No production changes or remote database writes are included.

## Implemented storefront changes

- Homepage order: compact hero, Categories, Size, New Arrivals, Featured Picks, footer. Removed standalone shirt rail and homepage brands. Normal Shirts listing retains all 18 supplied originals.
- New Arrivals/Featured Picks explicitly curate 8 + 8 distinct supplied shirts; source ordering is not a claimed publication date, sale ranking, or verified arrival timestamp. Mobile shows four per rail, with collection links for the remaining curated items; all 18 remain in Shirts.
- Seven compact size groups, Over Size separate from 3XL. Only published, stocked, verified catalogue records enable links. Temporary Preview M SKUs cannot populate size facets or satisfy typed size/style/collection filter URLs.
- Multi-dimensional classifications remain supported without duplicate product rows; links appear only with matching published metadata. No invented fabrics or Winter membership. Future categories show Coming Soon.
- Official Size Guide directly under Quantity for every applicable shirt, responsive modal/bottom sheet, exact chart and requested note, Escape/close/focus restoration.
- Manual-only hero: original artwork contained without cropping, 220–300px mobile / 380–460px desktop frame, arrows/dots/swipe/keyboard. This replaces the previous three-second autoplay as requested in the latest brief.
- Segment-aware compact headers suppress search on account/auth/profile/checkout/order/payment routes, retaining shopping search/navigation/logo.
- Exact Bangla COD message and shared five-step Bangla Personal-account payment instructions in COD/full-payment UI. Approved receiving details and original logos/copy controls retained; merchant accounts retain their own configured instructions.
- Confirmed-order component renders only verified/confirmed server receipts. Optional typed item/delivery snapshots and financial breakdowns render only when supplied; malformed, inconsistent and unsafe amounts suppress the confirmation. Customer reference displayed instead of internal UUID. No new public confirmation route or fabricated order is created.

## Preserved shopping and security boundaries

All 18 original shirt photos and supplied prices remain; Preview Add to Cart, one-per-item quantity cap, Buy Now and checkout review remain testable. Temporary M sizes are still marked provisional on details and are not written to Supabase as actual measurements. Physical sizes/essential details require owner confirmation before live publication.

COD advance remains ৳70/৳130, credited against the total once. Existing shipping figures are Preview estimates, not a new verified server shipping service. Live order/payment submissions remain disabled. Submitting a TrxID does not verify payment. Guest coupon attempts open sign-in in place and retain cart/address context; no local coupon discount or fake reward is issued.

## Order reference / reward status

See `ORDER_REWARD_FOUNDATION.md` for the additive private allocator migration and reproducible tests. It is a dormant foundation, not an integrated order-number service. It is not applied to the hosted development database by this increment.

There is no actual `orders`, payment, coupon, redemption or order-state-machine schema yet. Therefore short references cannot currently be attached to real orders, guest tracking is not enabled, and the 10% first-confirmed-order reward is **not implemented end-to-end**. Existing disabled reward configuration and authenticated, fail-closed action remain. Claude application Auth integration, a trusted order/payment lifecycle, identity-bound coupon issuance/redemption/audit storage and admin approval workflow are prerequisites. No fake success or coupon is shown. A five-digit namespace supports only 90,000 lifetime references and must be expanded before exhaustion.

## Verification

Root lint/typecheck/58 unit tests passed. Frontend lint/typecheck/82 unit tests and optimized build passed. Browser checks passed at 360/390/430/768/1440px: homepage order, no autoplay, no cropping, manual wraparound, official guide position/content/Escape/focus restore, search policy, COD/full payment tabs/instructions, disabled submissions, guest context retention, actual-size filter isolation and no horizontal overflow. Source: `scripts/test-final-refinement.mjs`; artifacts: `artifacts/final-refinement/`. Screenshots were visually reviewed.

The first browser attempts caught test-selector issues (responsive hidden search inputs, hidden mobile extra product rows, transient streamed DOM); the final suite waits for completed content and targets visible controls. These were not reported as passing runs. Database and hosted deployment results are appended to `PROGRESS.md` after execution, rather than assumed here.
