# Temporary Personal payment receiving configuration

- Edit `frontend/claude/src/config/payment-receiving.ts`. It has separate `bkashNumber` and `nagadNumber` fields, currently referencing one shared temporary number. The owner explicitly confirmed authorisation for both Personal accounts in this session. This is owner confirmation, not a provider/API account verification.
- Per-provider authorisation flags control whether each destination is published to the checkout DTO. Components never hardcode the number. Copy Number reads the selected destination.
- Authorising a recipient does **not** activate collection: `previewPaymentConfiguration()` always returns `available: false`. Submit Payment and Place Order are disabled. The client handler also refuses synthetic submission; the existing server action independently fails closed. No PIN/OTP is requested, no gateway added, and no payment/order is saved or confirmed.
- The same payment panel handles COD advance and full online-payment **UI preview**. The full-payment selector is explicitly marked preview-only. COD is still credited against the total; full payment uses the whole total with zero remaining balance. Neither mode is payable.
- The reference label is “Transaction ID / Last 4 digits of number”. The hint refers to the sender's number. Four digits are not proof of funds or a unique transaction ID. Before live submission is enabled, the backend must distinguish a submitted reference hint from a canonical provider transaction ID verified against incoming funds. Current inputs remain local UI state.
- Future owner/admin editing must use authenticated, permission-controlled backend configuration, validated numbers/account types/instructions and an audit trail. Return only public receiving fields to an authorised pending-order session. Add the order/payment backend described in `MANUAL_ADVANCE_PAYMENT.md` before changing availability; do not rely on browser approval flags.

## Provider assets

- `public/payments/bkash.png` and `public/payments/nagad.png` are the unchanged PNG files from the owner-supplied `Attires_Arena_Payment_Logos (1).zip`. Both are rendered with preserved aspect ratio through Next Image.
- `src/config/payment-brands.ts` centralises provider names and the new PNG paths. No attribution text or third-party credit is displayed for these replacement assets, as requested.
- The previously supplied Vecteezy JPG and its licence remain archived in the repository; that JPG is no longer rendered. Its licence is not evidence of rights for the replacement PNGs.

Verification: `npm run test:claude` covers separate numbers/authorisations, no availability activation, direct-call rejection and advance/full-payment arithmetic. `node scripts/test-manual-advance.mjs` checks both modes at 360/390/430/768/1440px, exact clipboard content, reference label, amount copying, clipboard denial, logo loading, keyboard tabs, no overflow and zero payment/order POSTs. Prior enabled-attempt tests were updated to assert the newly requested disabled state; no fake endpoint is used.
