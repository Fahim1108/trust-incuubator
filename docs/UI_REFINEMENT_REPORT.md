# Non-payment UI refinement — 2026-10-25

Scope: `frontend/claude`, branch `feature/claude-frontend-integration`. The uploaded final refinement prompt applies except payment UI. Existing payment panels, receiving numbers, configuration, confirmation component and payment state handling remain unchanged. No root app, Supabase, migrations or production changes.

## Implemented

- Readable desktop navigation (15px, compact 14px laptop exception to preserve centred single-row geometry); existing 15px mobile navigation retained. Product names increased to 14–15px.
- Removed Quick View overlays, triggers, state, unused modal and its appearance-editor toggle. Sized-card Add to Cart now opens product details to select the actual variant; available one-size variants still add directly. Wishlist and image-hover behaviour retained.
- Removed price controls from both filter surfaces. Existing min/max URL parsing and removable legacy filter chips remain compatible. Size/color filters require the same actual variant rather than independent matches across different variants. Category/brand facets exclude unrelated size options.
- Optional typed size display labels derive from each product's own chest/inches guide, preserving raw variant/query keys. Clothing labels include M (40); footwear, pants, belts and one-size items retain their own labels. Conflicting mappings fall back to raw labels rather than inventing a chart.
- Dark burgundy Buy Now and white/maroon Add to Cart; existing stock, quantity and selection handling retained.
- Removed Claude/design branding and redundant prototype prose. Retained concise sample-catalogue, unavailable-service and brand-affiliation disclosures because this app still uses fixtures.
- Shared circular logo loader visible only below 768px; desktop gets plain inline progress text. Mobile ring stays 1.6s clockwise/linear and original logo stationary. Reduced motion preserved. Fullscreen focus blocking runs only on mobile and cleans up on viewport change.
- Six-stage tracking component with explicit current order status, supplied timestamps, maroon completed indicators, active opacity cycle and terminal-state/reduced-motion stop. Horizontal layout only if its container has sufficient width. No inferred shipment dates.
- Removed fake customer session and public fixture order lookup from the isolated mock adapter. Protected account layout redirects signed-out visitors to login. Tracking submission is unavailable until a secure order service exists; it cannot reveal sample customer records as real orders.
- Signed-out account menu with Sign In, Create Account, My Account, My Orders and Wishlist. Existing registration/password confirmation and password toggle retained; removed nonfunctional Remember me. No pretend sign-out link/session.
- Footer preserves original symbol/wordmark/socials/burgundy and adds centred WhatsApp link; only the developer name and phone number are bold.

## Integration limits

This is not a production-ready commerce release. Catalogue, prices, stock, reviews and cart seed remain isolated fixtures; wishlist/cart are local browser operations. Claude frontend authentication is not connected to the root application's existing Supabase auth. No live session, sign-out, profile persistence, order tracking, order confirmation or payment verification is claimed. The adapter fails closed for mutations. The root backend is preserved.

Tracking animation fixture appears only on the gated `/motion-preview` route and is explicitly labelled as not a customer shipment. Real tracking needs an authorised order response, a supported `packed` → Processing status mapping, private lookup capability and secure backend integration. The unchanged verified-order confirmation component remains guarded; no successful live-order video can truthfully be produced without a verified order backend. Payment UI excluded from this increment.

## Verification

Commands: `npm run check:claude`, `npm run test:claude`, `npm run build:claude`, `npm run test:claude:browser`, `PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright node scripts/test-ui-refinement.mjs`.

New unit coverage checks catalogue-guide mappings, shoe labels, same-variant filtering, fixture isolation and tracking current/terminal status. Browser checks cover 360/390/430/768/1024/1280/1440px, laptop navigation geometry, absent price/Quick View controls, URL sizes, purchase styling, cart drawer, account redirect/password toggle, controlled genuine auth request pending feedback, mobile-only loader and reduced motion. Short combined interaction recordings are captured at 390/1440px; tracking shown is an explicitly isolated fixture.

Initial verification caught strict tuple/index typing errors (fixed before successful build) and a missing default Playwright FFmpeg path (resolved using the existing workspace browser cache). No runtime delay was added; request hold and animation waits exist only in browser testing or the existing gated three-second demo.

Final results and deployment evidence are recorded in `docs/PROGRESS.md` and `artifacts/ui-refinement/`.
