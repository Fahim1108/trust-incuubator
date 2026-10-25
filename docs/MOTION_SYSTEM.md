# Claude storefront motion system

Changes are scoped to frontend/claude and its browser checks. The older root storefront, Supabase, inventory, authentication contracts, payment logic, typography, original logo assets and production configuration are unchanged.

## Implemented

- Central timing tokens: fast 150ms, normal 220ms, slow 350ms, reveal 450ms, ring 1600ms, panel 280ms and hero 600ms. Config/motion.ts supplies both JS and SSR CSS variables. No animation library was added.
- Shared button/icon/quantity/variant/header controls use immediate 0.98 press feedback with smooth release; pointer-only hover lift/accents avoid sticky mobile hover. Loading buttons retain their original layout dimensions and prevent another submit while pending.
- The existing official stationary-logo loader now has 24px, 40px and 80px ring variants. Only its ring rotates clockwise, 1.6s linear/infinite. The existing white logo artwork is used unchanged, with no GIF, bounce, glow or logo transform. Root-app loader dimensions remain untouched.
- Search focus, border/icon and suggestion entrance effects. Suggestions use actual request state, ignore stale responses even when typing continues, preserve query text, and surface transport failures. Navigation has separate real pending state; input remains editable.
- Product images zoom 1.03 on fine-pointer hover with optional secondary-image reveal. Cards, wishlist hearts, category images/circular arrows and brands retain their original geometry, white surfaces and links. Cart quantity changes produce a single short badge emphasis, not an idle pulse.
- Drawer/modal entrances and exits share the same 280ms duration. Background scrolling and inert controls stay locked until the exit finishes; Escape, Tab trapping, nested scroll counts and focus restoration are preserved. No blur animation is used.
- Ready route content fades/rises 8px over 350ms without intercepting navigation or delaying data. Catalogue results show the medium loader only during a real router transition. Hero crossfade is 600ms; autoplay respects focus, pointer hover, document visibility and live reduced-motion changes. Existing pause/play is now available on phones too.
- Major homepage sections reveal once with opacity/12px movement for 450ms. They remain visible in server HTML: no CSS-hidden state awaits JavaScript or an observer. Missing JS/observer support and reduced motion leave readable content.

## Loading boundaries and truthful feedback

The previous storefront-wide loading.tsx trapped JavaScript-disabled homepage rendering on a streamed fallback. Browser verification exposed it. Moved that reusable boundary to collections/loading.tsx, retaining the existing shop/category/brand/product skeletons. The homepage now renders its actual content without JavaScript; route/action loading remains tied to real work.

Genuine asynchronous UI states: search suggestions and search navigation; URL-backed filters/sort; login/register/recovery, profile/contact/newsletter/track and checkout server-action requests. Pending controls use the official compact loader, disable repeated submission and restore after normal/unavailable/error responses. UI catches transport failures without logging inputs/secrets. Checkout does not claim an order exists after an uncertain response.

Cart and wishlist are instant browser-local operations in this preview. They receive press/fill/toast/badge feedback and never fabricate server-loading states. Authentication, order/payment and other mutation adapters still return not_connected. Animations do not turn those boundaries into a working commerce backend.

## Verification

```
npm run lint
npm run typecheck
npm test
npm run check:claude
npm --prefix frontend/claude test
npm run build:claude
npm run start:claude
# Another terminal:
node scripts/test-claude-motion.mjs
node scripts/test-loader.mjs
npm run test:claude:browser
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright node scripts/record-claude-motion.mjs
```

The browser suite checks 360/390/430/768/1440px; keyboard/focus/inert/scroll cleanup; hover and touch; actual slow request loading; stale-search suppression; success/unavailable and failed-request cleanup; duplicate-submit prevention; unchanged button dimensions; instant accurate wishlist/cart changes; one-shot badges/reveals; ready route motion; URL-backed filter pending state; hero autoplay/live reduced-motion stop; all loader sizes; stationary logo/rotating ring; and JavaScript-disabled homepage content. Existing 40-route browser checks and 58 root/20 preview tests remain in use.

Artifacts/motion contains screenshots, verification.json and a browser-recorded interactions.mp4/webm. The recording runner holds genuine requests solely to make pending states visible; no such delays are in application code. Screenshot/recording evidence does not establish field Core Web Vitals or low-end device frame rates.

The separate Vercel Preview project can be updated after this verified source commit using explicit legacy API target=staging (Preview), never Production. Deployment readiness, exact source SHA and hosted markers must be confirmed before reporting a new URL. Existing Vercel Authentication must remain; use private temporary automation access for browser checks and revoke it afterward. Never put access secrets into public URLs or source.
