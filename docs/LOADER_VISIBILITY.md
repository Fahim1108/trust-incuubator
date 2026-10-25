# Claude Preview loader visibility

Scope: `frontend/claude`, branch `feature/claude-frontend-integration`. The old root storefront, Supabase and production project are unchanged.

## Diagnosis and fix

- Previous deployment `aaf2ace5cdfd08de43eb0ea6c78d3d9269558164` already contained the logo loader. Many preview reads/actions resolve immediately or from cache; there is deliberately no minimum loading time.
- The old 185-unit SVG scaled its 4-unit stroke to approximately 0.52px at 24px. Geometry now uses the rendered dimensions with 2/3/4px strokes at 24/40/80px. The large loader also receives a white circular annulus, keeping the original maroon ring visible on burgundy. Official logo assets are unchanged.
- Ring-only rotation is clockwise, linear, infinite, 1.6 seconds. The logo remains stationary. Reduced motion disables rotation.
- Shop/category/brand route fallbacks retain skeletons and add a non-modal 80px official loader. Collection fallback is now non-modal, keeping shared navigation available. Existing homepage SSR is preserved, including JavaScript-disabled visibility; no global artificial initial-load timer or blocking startup overlay was added.
- `/motion-preview` displays all sizes on white and burgundy and a labelled `Test Loading Animation` button. Its ONLY timer is a three-second demonstration, with unmount cleanup. The existing overlay manages focus/inert/scroll cleanup and a short non-blocking exit fade.
- The demo requires the explicit `CLAUDE_DESIGN_PREVIEW=1` flag and refuses `VERCEL_ENV=production`, both in the existing proxy and in its server page. Optimized Vercel Preview builds also use `NODE_ENV=production`, so that variable alone cannot distinguish Preview from Production. This is not a production storefront or an admin route.

## Genuine loading triggers

| Operation | Feedback and scope |
| --- | --- |
| Search suggestions | 24px logo while the actual debounced request is pending; stale results ignored; transport error restores input feedback |
| Search submission | 24px search-button indicator during transition; App Router can immediately commit its cached loading shell and hand off to the route's 80px loader |
| URL filters/sorting | 40px catalogue indicator during actual transition; mobile apply button uses compact pending feedback |
| Login/signup/password reset | 24px button indicator for the real server-action request; preview adapter returns an honest not-connected result |
| Checkout submission | 24px button indicator until the action finishes; existing not-connected or uncertain-result message, never a fake order |
| Contact/profile/tracking/newsletter | Existing real request pending state uses compact feedback; service integration status is unchanged |
| Local cart/wishlist | Immediate press/count/saved feedback, no fabricated network loading |

## Reproduction

```sh
npm run build:claude
npm run start:claude
node scripts/test-loader-visibility.mjs
node scripts/test-loader.mjs
node scripts/test-claude-motion.mjs
npm run test:claude:browser
npm run lint
npm run typecheck
npm test
npm --prefix frontend/claude run lint
npm --prefix frontend/claude run typecheck
npm run test:claude
```

Browser tests hold genuine requests only inside Playwright, then allow the actual server response or deliberately abort it. No test-only delay enters the shopping runtime. For authorized hosted verification set `CLAUDE_PREVIEW_URL`, optionally `LOADER_ARTIFACT_DIR`, and a private `ATTIRES_BROWSER_ACCESS_FILE` containing a temporary Vercel automation credential; never commit/print that credential. `LOADER_RECORD_VIDEO=1` records the demo, requiring Playwright ffmpeg. Hosted Chromium uses the configured proxy with TLS verification retained.

The catalogue/cart remain sample/browser-local. Testing action pending states does not verify real customer authentication, order creation or payments. Hosted results, exact deployed SHA and recording are recorded separately after deployment.
