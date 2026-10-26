# Order reference and first-order reward foundation

The repository currently has no transactional `orders`, `payments`, coupon issuance/redemption, or order state-machine schema. This increment does not create orders, confirm payments, grant rewards, or enable checkout. The separate Claude frontend still needs its authenticated customer session/service integration before an account-bound reward can be used safely.

## Implemented: dormant private order-number allocator

Migration `supabase/migrations/20261027000100_order_number_foundation.sql` adds:

- `private.customer_order_numbers`: permanent UUID-to-numeric-reference mapping, unique order UUID and unique numeric reference, with assignment timestamp.
- `private.customer_order_number_sequence`: non-cycling integer sequence from 10000 through 99999.
- `private.assign_customer_order_number(target_order uuid)`: operator/future trusted-order-transaction function with empty search path and parameterized SQL. It refuses to allocate when the real `public.orders` table is absent, the input is NULL, or no matching UUID exists. The future transaction must create its real order before calling it. It locks that order row and returns an existing mapping on retries, skips existing numeric collisions, and fails closed on namespace exhaustion.

No HTTP endpoint, PostgREST RPC, client grant, or service-role grant was added. Anonymous and authenticated callers—including an owner role expressed through a customer JWT—cannot read mappings, execute allocation, or consume the sequence. RLS is enabled on the private ledger with no client policies. The internal UUID remains the actual order identity. Numeric references are display identifiers, never authorization credentials.

No remote migration was applied. No production schema/data was modified. This is a version-controlled database foundation for later development integration only. The operator can inspect it locally, but actual allocation is currently blocked because the order service does not exist.

### Capacity and future integration requirements

Five digits provide at most **90,000 lifetime assignments** in this design; transaction rollbacks/sequence gaps consume capacity, so usable committed order count can be lower. References are never reused. Before production ordering, use an appropriately larger namespace, preferably at least eight digits, or an explicit year-plus-sequence format. Do not reset the sequence, cycle it, or silently truncate longer references.

Before connecting the allocator to a real order transaction, add a restrictive foreign key from the private reference ledger to the actual order table, validate the order schema, and keep numbering within atomic order creation. Retain immutable order snapshots and separate payment/fulfillment state machines. Guest tracking requires an unguessable token or verified contact; authenticated order reads require customer isolation. Never expose a private order by its short number alone.

## Executable tests

`supabase/tests/order-number.sql` is included by `scripts/test-db.sh` and `npm run test:db`. It uses an isolated transaction-only `public.orders` test double, not real commercial orders. It covers absent service, NULL/nonexistent UUID, deterministic initial assignment, retry idempotency, unique constraint enforcement, collision skipping, final allowed reference, exhaustion without reference creation, anonymous denial, authenticated owner denial, and sequence access denial. The test double is rolled back. The suite also retains prior migration/RLS/auth/inventory tests and independent inventory concurrency checks.

These tests execute against disposable PostgreSQL with simulated Supabase Auth claims. They do not verify actual hosted GoTrue/JWT sessions or real checkout. Parent verification records the final command result in `docs/PROGRESS.md`.

## Not implemented: first-order coupon reward

A real 10% first-order coupon cannot be issued securely before a trusted order lifecycle and payment/confirmation contract exist. No coupon code, first-order claim, or success message is fabricated.

The implementation prerequisite is an authenticated customer identity, an atomic order/payment state machine, and a trusted administrative confirmation action. The future reward transaction should serialize per customer, identify the first qualifying confirmed order, and issue exactly one account-bound unique coupon under a database uniqueness constraint. Discount must be fixed at 10%, with admin-configurable expiry, minimum subtotal and optional maximum discount. Issuance and redemption require append-only attribution/audit records. Redemption must lock the coupon, validate customer ownership/eligibility/expiry against server-priced totals, and commit exactly once inside order creation. Browser prices or local-storage coupon state are not trusted.

Guest checkout remains available without a coupon. Sign-in should be requested only for redemption, preserving checkout form/cart context, and validated by a real server session. The current frontend's unconnected coupon boundary remains fail-closed; no reward issuance, redemption, verified customer coupon eligibility, or real success state is claimed.
