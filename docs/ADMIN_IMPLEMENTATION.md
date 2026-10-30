# Admin audit and incremental delivery

Historical implementation record. Current Admin 2.0 staging foundation status and blockers: [Milestone 1 report](MILESTONE_1_REPORT.md). Do not treat the historical development project reference below as a staging target.

Scope: Claude frontend; development Supabase project euoannuvovsbwxjqnriw; Preview only. Existing root Auth, inventory, reviews and storefront are preserved.

| Module | Audit result | Next step |
|---|---|---|
| Auth/RLS/inventory | Existing tested root foundation; Claude customer Auth unconnected | Reuse Supabase SSR for staff, require database roles and MFA |
| Staff/owner | No permanent accounts in development role audit | Operator-only provisioning of a confirmed, explicitly designated owner |
| Appearance | UI only; saves unavailable; admin deliberately returned 404 | Preserve editor, keep unavailable until real CMS persistence |
| Products | 18 real intake drafts, sizes unverified; Preview uses temporary test sizes | Real intake editor; never write guessed sizes into database |
| Categories | Existing normalized table/RLS; no management RPC | Add authorized audited management later |
| Reviews | Real submission/moderation RPCs and audit; no management UI | Connect authorized moderation UI |
| Orders/payments/customers | No transactional order/payment schema; no real revenue | Commerce engine before management; no fictional metrics |
| Coupons/rewards | Missing; no qualifying real orders | Transactional order/payment foundation first |
| CMS/media/SEO/marketing | Mostly source configuration or unconnected adapters | Validated versioned CMS and safe storage after catalogue |

Sequence: (1) staff sign-in/MFA, protected shell, real catalogue overview and audited intake editing; (2) full product creation, storage, category management, review UI; (3) atomic orders/manual payment verification and shipping; (4) coupons/rewards; (5) versioned CMS; (6) optional consent-aware marketing.

Existing role vocabulary is preserved: owner/product_manager/order_manager/customer_support/marketing_manager/analyst. Do not infer privilege from registration metadata. No public owner registration or service-role application credential.

New admin RPCs require signed authenticated AAL2 claims and database permissions. Legacy catalogue-read/inventory RPC policies retain their original behavior; a comprehensive legacy MFA policy migration is a separate hardening task. Do not claim the whole requested management system is complete.

## Delivered increment (27 October 2026)

Implemented real staff password sign-in, namespace-isolated HttpOnly sessions, MFA enrollment/challenge, protected workspace with mobile dialog navigation, catalogue overview, searchable four-step imported-draft editing and read-only audit history. All data access/actions check database membership. New admin RPCs independently enforce signed AAL2 claims and permissions. The former disconnected appearance editor is preserved in source but its routes explicitly report CMS unavailability behind staff protection.

Draft saves are transactional and optimistic: stale updates return HTTP 409, audit failure rolls back the edit, existing SKU-backed intake cannot be edited through this shortcut, and unknown measurements remain blank/unverified. No product is published or given an invented variant. New product creation, uploads, publication and stock management are not implemented in this increment.

Development-only additive migrations: dormant private order-number foundation `20261027000100` (previously local-only), admin catalogue/audit `20261027000200`, and explicit stale-edit conflict response `20261027000300`. Dry runs passed before applying; no existing product data was changed by migrations. Actual hosted verification uses one disposable draft fixture and confirmed disposable accounts and removes all of them afterward. The private operator provisioning audit is intentionally retained as a security record.

Verification: root lint/typecheck/58 tests/build; frontend lint/typecheck/87 tests/build; production dependency audit (zero reported vulnerabilities); disposable PostgreSQL RLS/permissions/stock concurrency/intake/review/order-number/admin tests; real development Auth/TOTP/PostgREST matrix and browser sign-in/MFA/persistent draft save/logout/role revocation. Responsive screenshots at 360/390/430/768/1440. PostgreSQL bootstrap simulates claims; only the hosted suite tests real signed JWTs and GoTrue.

Browser tests caught and fixed a changing Continue/Submit button identity that could submit on reaching review, plus the description field's label association. The review step now never saves without an explicit Save click.

During testing screenshots may show 19 drafts: 18 real shirts plus the explicitly disposable AA-SHIRT-999 fixture. The fixture and its audit/account data are removed after testing; the permanent catalogue remains 18 drafts. Do not interpret those screenshots as a nineteenth business product.

Pending: designate/provision a permanent confirmed owner; full SKU/image/category/review management; atomic order/payment backend; shipping/invoices/coupons/rewards; CMS/marketing. Legacy privileged RPC MFA enforcement, distributed application throttling, account recovery and expanded security/abuse tests remain launch blockers. This is not completion of the full requested admin system.
