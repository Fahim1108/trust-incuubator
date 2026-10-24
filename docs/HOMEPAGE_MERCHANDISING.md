# Homepage merchandising

This increment changes only the isolated Claude design preview. The root Next.js/Supabase application, authentication, migrations, inventory functions, header, footer, checkout and existing category/brand routes are not changed by this increment.

## Enabled layout

Hero → Shop by Categories → Shop by Brands → New Arrivals → Featured Picks → footer. Legacy value propositions, promotions, newsletter and bestseller homepage blocks remain available but disabled. Trending Now, Complete the Look and Most Popular are configured but disabled. Empty product sections are omitted even if enabled.

`src/config/homepage.ts` controls enabled state, array order, title, subtitle, CTA, item limit (maximum eight), explicit curated product IDs, soft category cap and stock preference. Paths below are relative to `frontend/claude`.

## Selection and presentation

`src/lib/merchandising.ts` provides a deterministic selector. It accepts published, non-future candidates with valid publication timestamps; deduplicates IDs; prefers products with available variants; deprioritizes products in the preceding visible collection; and ranks by publication timestamp, explicit curation order or measured popularity. A first pass selects one per available category so the initial mobile group is diverse; a soft cap of two products per category is then relaxed in additional passes until available slots are filled. It never assumes particular category IDs or fabricates missing products. Stock preference is a preference, not a hard exclusion: unavailable items can fill otherwise empty slots and retain the existing sold-out presentation.

New Arrivals uses publication timestamps, not isNewArrival flags or product creation dates. Featured/Trending only accept configured product IDs. Most Popular requires a positive finite score and an explicit units-sold or paid-orders measure; ratings and isBestSeller flags are not popularity inputs. An eventual adapter must use one consistent measure and reporting window for a ranking.

The existing ProductCard is reused without changing price, sale, image, wishlist, variant or interaction behavior. Homepage grids show four initial products in two columns below 768px, and up to eight products in four columns at larger widths. The collection links expose all eight selected products, including the same curated order/diversity/adjacent-repeat rules. Disabled/empty collection URLs render the existing not-found page. Next.js may send HTTP 200 when this result is streamed after the route loading fallback; it is not a published collection.

Complete the Look has a typed image/title/product-ID/enablement contract and a responsive image-plus-linked-products renderer. A look is omitted if any item is absent, unpublished or unavailable. No sample outfits have been invented or enabled.

## Data integration status

**All merchandising is preview-only today.** `getHomepageProducts()` is a new typed read boundary on StorefrontDataSource. The mock adapter supplies the existing isolated sample products and explicitly simulated publication timestamps derived from fixture creation dates. These are NOT actual Supabase publish timestamps. The global design-preview notice/noindex/production gate remains in place. Sample prices remain whole BDT as in the imported frontend; this is not a trusted checkout calculation.

A real adapter must provide:

- Published product state and actual first-published/arrival timestamp (never silently map created_at).
- Authorized product/category/image records and current variant availability from trusted inventory reads.
- Explicit featured/trending ordered assignments, never inferred trend claims.
- Optional popularity from paid/non-cancelled sales with one documented metric/window and refund rules.
- Versioned CMS section configuration and complete-look images/ordered item assignments.
- Correct backend integer-poisha to display-amount mapping; browser merchandising is not an authorization or payment boundary.

No Supabase schema change is made or required for this visual increment. These metadata/CMS contracts must be reviewed against the real schema before choosing migrations. The existing admin appearance route remains protected/unavailable; configuration support does not imply a working live CMS.

## Verification

From repository root:

```
npm run lint
npm run typecheck
npm test
npm run check:claude
npm run test:claude
npm run build:claude
npm run start:claude
# In another terminal:
node scripts/test-home-merchandising.mjs
```

Unit checks cover publication eligibility/time ranking, determinism, diversity, soft-cap redistribution, sparse inventory, in-stock preference, explicit curation, adjacent duplicate avoidance/fallback, popularity evidence and complete-look eligibility. Browser checks cover enabled order, four/eight responsive cards, column counts, links, images, prices, wishlist controls, disabled collections, exceptions and overflow at 390/768/1440px. Screenshots: `artifacts/merchandising/home-{390,768,1440}.png`, `new-arrivals-{width}.png`, `featured-{width}.png`.

The running cloud-local preview is not a publicly accessible deployment. No commit, push, production release or live Supabase connection is implied by this implementation.
