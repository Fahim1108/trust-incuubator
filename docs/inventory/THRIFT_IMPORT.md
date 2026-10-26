# Real thrift inventory — 26 October 2026

The updated In Stock ZIP is authoritative; its instructions are treated as data, with the owner's latest request taking precedence. All 18 original JPEGs were copied byte-for-byte to `frontend/claude/public/inventory/thrift-shirts`. SHA-256 values and source mappings are in `src/data/inventory/thrift-shirts.json`; the original CSV is archived here. Images are delivered by Next Image/static assets; no Supabase Storage bucket architecture existed, so no upload result is claimed.

## Actual development database result

Applied only to `euoannuvovsbwxjqnriw`, after local PostgreSQL tests and transactional remote migration dry runs:

- 18 `products` rows, status **draft**.
- 18 staff-only `thrift_intake` rows: physical quantity **1 each**, **18 total**, actual size **NULL**, verification flags false.
- Exact CSV prices, ৳510–৳600 (the supplied range is within the owner's ৳500–৳600 limit), stored as integer BDT minor units.
- Zero manufactured size/color SKU records for these drafts. No S/M/L/XL, `N/A`, material, brand authenticity, condition or physical measurements inferred from photographs/labels.
- Re-running the import left the same 18 drafts/18 intake rows; existing owner edits are not overwritten. Identity collisions with unrelated products cause an abort.
- Existing genuine database products/order references were not deleted or rewritten. Old fictional catalogue fixtures remain isolated in source tests; the active customer adapter no longer serves them.

Migrations: `20261026000100_thrift_intake.sql`, `20261026000200_product_reviews.sql`. Their versions were recorded in development migration history. Production was not touched.

## Owner editing and publication

Use the Supabase development project's Table Editor, `public.thrift_intake`, locating rows by `source_id`. Edit `price_minor` (100 minor units = ৳1), `stock_quantity` (0 or 1), `actual_size`, `actual_color`, and verification flags. Suggested pattern/color/visible-label observations are unverified metadata, not approved public facts. Edit the linked `products` row for its name/description. Staff API access follows existing catalogue read/manage permissions; customers and anonymous visitors cannot edit intake.

Keep both flags false until the physical size and essential item details (including color/condition/price/name) have been checked. A publication trigger rejects `products.status='published'` while verification is incomplete. Removing verification automatically returns a linked published product to draft. Confirmation flags are staff attestations, not an inference from an image label.

When approved, a trusted backend/operator must create **one** matching actual `product_variants` record (size/color exactly matching the verified intake fields, active=true), initialize its inventory from the confirmed physical count using trusted database operations, and then publish. Do not create chart options as actual variants. Never reset sold inventory to one on reimport. The anonymous `published_thrift_catalogue()` projection only exposes published, verified intake with a matching active physical SKU; it does not expose staff intake notes or draft inventory.

The Claude adapter can read this projection with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (or the equivalent NEXT_PUBLIC names); only anonymous/publishable keys are accepted. Privileged service/management keys are never used by application catalogue code. An unavailable connection returns empty results, never sample-product fallback. These server-only variables were configured on the separate Vercel Preview for the intended development project; production environment variables were not changed. Homepage New Arrivals/curation stay empty until real owner-approved publication/arrival metadata is connected; import timestamps are not fabricated publish dates.

Live order/payment creation, reservation/oversell protection at checkout and the complete staff editing dashboard remain separate unfinished backend work. Do not enable real purchasing merely because fields have been filled. Existing COD/manual payment boundaries remain disabled. Backend stock adjustments retain their existing trusted concurrency protection.

## Repeatable commands

From repository root:

```
python3 scripts/inventory/import_thrift.py '/path/to/updated.zip'
npm run test:db
node --use-env-proxy scripts/inventory/apply-development.mjs
node --use-env-proxy scripts/inventory/apply-development.mjs --apply
```

The Python command validates the full archive first row-by-row, rejects duplicates/unsafe filenames/changed original files and emits deterministic draft JSON/SQL. It does not contact a database. The Node command is pinned to the development project and reads `SUPABASE_ACCESS_TOKEN` from secure environment configuration without printing it. Default mode rolls back each unapplied migration; `--apply` records migrations and runs the idempotent draft SQL. No reset/delete operation exists. Apply future migrations only after inspecting/testing them; never alter an already-applied migration file.

## Reviews: implemented vs not connected

The new database review workflow has authenticated-identity submission RPC, rating/text validation, one review per customer/product, per-customer serialized rate limiting, pending/approved/rejected moderation, staff-only moderation RPC, and an audit log. Public column permissions/RLS expose approved reviews only on published products and conceal private account identifiers. There is no verified-purchase field or badge because a genuine order ownership service does not exist yet.

Local PostgreSQL tests executed submission, duplicate rejection, anonymous denial, unpublished-product denial, customer self-approval denial, staff approval/audit and public approved-only reads. Claims were simulated; these are not end-to-end hosted Supabase customer login/review tests. Actual hosted anonymous PostgREST checks confirmed zero drafts/reviews exposed and denial of private intake access. No test reviews/users were created remotely.

Customer review UI shows the approved records or “No reviews yet. Be the first to review this product.” Write Review opens sign-in in place, preserving the product URL. **Customer session integration, authenticated review form/submission wiring and the admin moderation UI remain unconnected in the Claude app.** No submitted/successful review is claimed. All products remain unpublished, so no customer detail page is exposed yet.

## Runtime verification

The first hosted run identified a static-to-dynamic fallback error when real Supabase was configured. Catalogue render paths now use request-time rendering, and the Preview proxy resolves public product existence before streaming to produce a genuine HTTP 404 for drafts/unknown products. Tests were repeated with real development anonymous access; no privileged credential is passed to the application. The production-disable gate remains enforced.

## Storefront

Public products/search/suggestions/related results are real published records only. Currently zero qualify, as requested. Old demo cart lines are removed; future legitimate saved lines are checked against published available variant IDs. Pants/Sneakers/Belts/Wallets/Watches have configurable Coming Soon pages; Winter is hidden. The real shirt photograph is used for the Shirts tile. Branding/logo/footer/skeletons and guest/cart boundaries are retained. Necessary unavailable-service disclosures remain; sample-review and Claude development labels are removed.

## Interactive Preview projection (2026-10-26)

The owner subsequently requested normal shopping-flow testing before physical sizing. `services/adapters/review-thrift.ts` now exposes the 18 supplied shirts only inside the explicitly enabled non-production Preview. It supplies one temporary M cart SKU per shirt (`preview-AA-SHIRT-xxx`), never database variants. Original price/photo/physical quantity remain sourced from the intake manifest. Pattern and occasion navigation is editorial styling, not fabric/measurement verification. Formal/Casual may overlap; no claims of verified designer branding are introduced.

Add to Cart, Buy Now, cart persistence and checkout review are usable. The fixed size is provisional and remains visibly described as such on product detail pages. Real order placement/payment verification is still unavailable. Do not import these temporary sizes or IDs into Supabase. Actual intake size and verification flags remain unchanged; owner must still verify actual details and use the publication procedure above before a live release.

Current checks: `npm run lint --prefix frontend/claude`, `npm run typecheck --prefix frontend/claude`, `npm test --prefix frontend/claude`, `npm run build --prefix frontend/claude`, and `node scripts/test-thrift-browse.mjs` against an explicitly enabled Preview server (default localhost:3004). The earlier `test-real-intake.mjs` asserts the superseded hidden-draft Preview behavior.
