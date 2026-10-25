# COD advance payment: Preview UI and required backend

This increment changes only the isolated Claude frontend and its typed integration boundary. It does **not** enable live payments, apply a migration, create orders, verify a TrxID, or modify Supabase/production/root-storefront code.

## Current implementation

- Checkout Payment step: bKash/Nagad keyboard-accessible tabs, account-specific instruction slot, recipient/amount copy controls, transaction ID, sender mobile number, optional note, real server-action pending/error feedback and immediate duplicate-submit guard.
- Advance rule: Dhaka division + Dhaka district = ৳70; every other valid division/district pair = ৳130. Invalid/mismatched selections produce no quote. This is explicitly a **Dhaka-district classification**, including its listed thanas; it is not a verified city/courier boundary. Confirm the operational zone definition before connecting a courier or accepting payment.
- Advance is credited **against the complete order total**, not added to it. Existing shipping fees/free-shipping behavior are preserved. `remaining = total - advance`; the delivery charge already inside total is never added again. These displays are estimates from the existing sample cart, not trusted payable quotes.
- New payment DTOs use integer minor units (100 paisa = ৳1). Existing preview cart whole-Taka amounts are converted only for display. No browser amount is included in payment-submission input. Live server pricing must use its own minor-unit quote.
- `getManualPaymentConfiguration()` uses the existing service/adapter interface and currently returns `available: false`, owner-authorised Personal destinations from the central temporary configuration, and the user-requested policy defaults. No merchant number, account type or transfer instruction is invented. Copy Number works only for an authorised configured destination; Copy Amount works. Transfers are explicitly prohibited until configured.
- Submission validates on client and server, trims the TrxID, accepts general alphanumeric/dot/hyphen/underscore formats without a provider-specific length, normalizes Bangladesh numbers and bounds fields against abuse. UUID idempotency stays stable for retries of identical details, changes when details change, and a synchronous in-flight guard prevents duplicate UI requests.
- The current server action fails closed while configuration is unavailable, before calling any mutation adapter. Direct action calls only return an unavailable response; **no payment details are saved**. The current UI additionally disables Submit Payment and Place Order and prevents even synthetic form submissions from sending a request.
- `Payment Details Submitted` / `Your payment is awaiting verification` render only from a successful typed server receipt. A receipt only allows `submitted` or `under_review`, never verified. The current adapter cannot produce that success.
- `AdvanceOrderConfirmation` is a prepared component with a reduced-motion-aware SVG checkmark. It requires a consistent confirmed/advance-verified receipt. It has no public query-string/localStorage activation route and is **not connected** to any order-completion route. Its guard is presentation validation, not backend authorization. Existing COD checkout also cannot treat the old generic order-created result alone as proof of advance verification.
- WhatsApp support links to https://wa.me/8801632915921. No message is sent automatically. The 44px control hides during mobile input/keyboard focus or overlap with fields/buttons/help, and uses safe-area spacing.

## Required secure backend work (not implemented or deployed)

The inspected migrations provide the Phase 1 profile/RBAC/catalogue/inventory foundation; they do not yet provide manual payment submissions, order payment verification, destination configuration or this payment audit workflow. Do not interpret existing frontend order fixtures as those tables/services.

1. **Authorized account configuration:** owner/payment-admin-managed receiving accounts, provider, actual account type and approved transfer instructions. Validate the provider/account combination, numeric destination and instruction text. Return only the public destination DTO to an authorized pending-order payment session; never return gateway secrets or private configuration. Version the policy/destination used for each order. No browser/environment flag may activate collection.
2. **Pending order and quote:** authenticated customer or unguessable, scoped, expiring guest-order capability; server recomputes variants, stock, coupons, shipping, total, required advance and remainder. Atomically create the pending order and reserve stock. Return an actual order reference and immutable quote, not a client-created ID. Define reservation expiry/late-payment reconciliation.
3. **Submission:** validate order ownership/capability, allowed state, destination, provider, expiry and required amount on the server. Accept a scoped idempotency key with payload hash and unique constraint. Store only necessary sender/TrxID/note data. Enforce rate limits, origin checks and customer isolation/RLS; never permit client writes to verified statuses, roles, amounts or audit records. Never collect PINs/OTPs.
4. **Duplicate TrxIDs:** provider-aware canonicalization plus a database uniqueness constraint on `(provider, normalized_transaction_id)` and a canonical payment ledger. Use a transaction/locking for concurrent submissions; do not rely on a browser check. Queue conflicts for staff review. An exception requires a reason, actor and immutable audit record; it must not credit the same incoming money to multiple orders. Resolve erroneous submissions or use explicitly audited allocation bounded by the actual verified settled amount, never silently bypass uniqueness.
5. **Manual verification:** a distinct `payments.verify` permission, deny-by-default RLS and trusted server operation. Staff must check actual incoming funds, receiving account, amount, provider and TrxID. Evidence and decision are audited. TrxID entry or a customer redirect is never proof of payment. The current Phase 1 role permission list must be extended via a reviewed migration before enabling this operation.
6. **Atomic confirmation:** under row locks, verify the recorded advance, credit it once, validate inventory and transition the order to confirmed. Duplicate review requests are idempotent. Roll back all financial/inventory/state effects on failure. Keep order, payment and fulfillment state machines separate. A browser cannot confirm an order.
7. **Tracking:** private authorized status reads only. Guest lookups require the order capability or verified contact, not a predictable reference alone. Return actual timestamps; no fabricated shipment stages. Audit access and minimize personal data.

Suggested progression:

| Customer-visible stage | Trusted transition |
| --- | --- |
| Order Pending Payment | Actual pending order/quote created |
| Payment Submitted | Details persisted once, pending verification |
| Payment Under Review | Authorized reviewer claims the submission |
| Advance Verified | Actual incoming funds checked and audit recorded |
| Order Confirmed | Required advance and inventory atomically committed |
| Processing → Shipped → Out for Delivery → Delivered | Authorized fulfillment events, independently tracked |

Include explicit rejected, cancelled, expired, refunded and late-payment reconciliation branches. None is activated by this frontend increment.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm --prefix frontend/claude run lint
npm --prefix frontend/claude run typecheck
npm run test:claude
npm run build:claude
npm run start:claude
node scripts/test-manual-advance.mjs
npm run test:claude:browser
```

Unit checks cover integer amounts, location mapping, invalid totals/locations, TrxID/phone/field bounds, forged browser configuration, unavailable/repeated submissions and refusal to display unverified confirmations. Browser checks cover 360/390/430/768/1440px, provider switching and keyboard tabs, real clipboard success/denial, authorised recipient copying, shared COD/full-payment preview, disabled live submission with zero POST requests, safe reference input and WhatsApp position/keyboard behavior. Slow responses exist only in Playwright interception, not runtime timers.

Broader UI refinements in the accompanying attachment (global typography/filter/product/auth/tracking changes) are outside this focused checkout increment. Existing sample-data disclosures remain necessary until live catalogue/auth/commerce integration is verified. The separate Preview remains the only deployment target.

## Temporary recipient refinement

See docs/PAYMENT_RECEIVING_CONFIGURATION.md. Account authorisation controls display/copy only; collection remains unavailable. The UI label now accepts “Transaction ID / Last 4 digits of number”. A sender-number suffix is an unverified matching hint, not a unique provider transaction ID. Before enabling submission, distinguish raw submitted references and their kinds from the actual verified provider transaction identifier in the backend; never put a last-four-digit hint into the canonical transaction-ID uniqueness column or use it as proof of payment. Current reference entry is UI-only while submission is disabled.
