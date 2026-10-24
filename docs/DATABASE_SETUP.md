# Database foundation

This foundation supplies eight public tables, private owner-provisioning audit records, registration profile creation and an inventory adjustment RPC. It is not the full commerce schema. No remote database has been modified.

## Run isolated tests

Requirements: Docker daemon, Python 3 and access to pull the pinned official PostgreSQL 17 image.

```sh
npm run test:db
```

The runner creates a disposable network-isolated container without ports or host mounts, applies every ordered migration, runs SQL assertions and a two-connection concurrency test, then removes its own container on exit. It never reads a database URL or connects to a configured remote database. Test-only auth bootstrap and product/customer fixtures remain under `supabase/tests`; they are not production seeds and are not used by the storefront.

The bootstrap implements only Supabase's `auth.users` foreign-key target, database roles and `auth.uid()` JWT-subject contract. PostgreSQL executes real RLS, constraints, grants and transactions. These tests do **not** exercise GoTrue, signed JWT validation, PostgREST, Supabase Storage, session refresh or hosted platform defaults. Repeat the policies through the actual Supabase API before release.

## Apply to a development Supabase project

1. Create/select a separate development project. Do not use production for tests.
2. Inspect `supabase/migrations/20261024010934_foundation.sql` and confirm its tables do not conflict with an existing schema.
3. Using your installed Supabase CLI and authenticated project access, link the development project and use its migration deployment workflow (`supabase db push --dry-run`, then `supabase db push`). No CLI linking or hosted deployment has been performed in this task.
4. Never apply `supabase/tests/bootstrap.sql` to Supabase. The platform already manages its auth schema and roles.
5. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` securely. Public keys do not authorize schema migrations. Do not put database passwords, secret keys or service-role keys in public variables, source, logs or chat.
6. Validate anonymous/customer/staff policies with real sessions and API calls. Verify platform grants/default privileges and keep `private` out of exposed API schemas. The inventory RPC checks permissions independently of the UI.

## Trusted owner provisioning

Use the operator-only verified-identity procedure in [Auth/security setup](AUTH_SECURITY.md#secure-owner-provisioning). The second ordered migration adds registration profile creation and audited owner provisioning. Do not assign roles from customer registration metadata.

## Inventory contract

`on_hand` includes units physically held, `reserved` includes units unavailable for a second purchase, and generated `available = on_hand - reserved`. Constraints require `0 <= reserved <= on_hand`. Amounts use BDT integer minor units and cannot exceed JavaScript's safe integer range.

`adjust_inventory(uuid, integer, text)` requires `inventory.adjust`, a nonzero integer delta and a reason of 3–500 trimmed characters. It updates a locked stock row and inserts an attributable immutable movement in the same transaction. Direct browser inventory writes and ledger changes are denied. Insufficient/uninitialized stock raises SQLSTATE `22023`; unauthorized use raises `42501`; any ledger failure rolls back the stock mutation. Adjustments are not checkout, reservations, returns or order operations. There is no idempotency key for adjustment retries yet; callers must not automatically retry an ambiguous completed response. No UI calls this RPC yet.

The automated concurrency test deliberately holds one transaction's row lock, confirms the second session is blocked on a lock, then verifies one decrement succeeds and the other fails without negative stock. This tests concurrent **adjustments**, not concurrent checkout.

## Deliberate boundaries

- Public catalogue policies show published products and active variants only; exact stock and movement history are staff-only.
- Profile reads/edits are restricted to the current subject; staff have no customer-profile access yet.
- Staff catalogue mutations, product images, collections, reservations, orders, payment ledgers and audit logs for other privileged actions remain to implement.
- Category parents prevent self-reference but do not yet prevent longer cycles; validate hierarchy in the future management function.
- Trusted migration/database owners bypass RLS by PostgreSQL design. Never expose privileged credentials to browsers.
- A registration trigger creates customer profiles only. Customers may change display_name, but cannot rewrite profile IDs or system timestamps.
- Migration history is managed by the deployment runner; migrations are not intended to be manually rerun against already-created tables. A second test run creates a fresh database.
