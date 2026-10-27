# Motion restoration and showcase isolation — 27 October 2026

## Storefront baseline and method

The unwanted storefront removals were introduced by `792f85f`. The immediately preceding commit is `45b5bac`, which already includes the real shirt inventory, latest header/footer/WhatsApp work, and the Bengali COD description. No entire commit was reverted. Only the 18 affected storefront animation files were restored individually from that baseline. Automated comparison confirms every restored file is byte-identical to `45b5bac`.

## Exact files restored

- `frontend/claude/src/app/(store)/category/[slug]/page.tsx`
- `frontend/claude/src/app/globals.css`
- `frontend/claude/src/app/motion.css`
- `frontend/claude/src/components/category/CategoryCard.tsx`
- `frontend/claude/src/components/checkout/AdvanceOrderConfirmation.module.css`
- `frontend/claude/src/components/checkout/CheckoutForm.tsx`
- `frontend/claude/src/components/home/Hero.tsx`
- `frontend/claude/src/components/home/HomeBrowse.module.css`
- `frontend/claude/src/components/home/HomepageView.tsx`
- `frontend/claude/src/components/home/PromoBanners.tsx`
- `frontend/claude/src/components/home/ShopBySize.tsx`
- `frontend/claude/src/components/motion/RouteMotion.tsx`
- `frontend/claude/src/components/product/ProductCard.tsx`
- `frontend/claude/src/components/product/ProductGallery.tsx`
- `frontend/claude/src/components/ui/Button.tsx`
- `frontend/claude/src/components/ui/Reveal.tsx`
- `frontend/claude/src/components/ui/SectionHeading.tsx`
- `frontend/claude/src/config/motion.ts`

## Exact showcase files changed

- `frontend/claude/src/app/motion-preview/ScrollShowcase.tsx`
- `frontend/claude/src/app/motion-preview/ScrollShowcase.module.css`

These contain all new animation behavior and scoped styling. `/motion-preview/page.tsx` and the Preview/production access gates remain unchanged. The showcase imports no shared Reveal/RouteMotion component and adds no global CSS rule.

- **A — Soft Editorial:** 350ms heading opacity fades, gentle editorial-copy opacity entrance, static grid and photographs.
- **B — Luxury Motion:** restrained heading/section entrance (2–4px maximum), subtle photograph opacity reveal, no staggered grid cards.
- **C — Ultra Minimal:** no scroll animation; only scoped control hover/press feedback.

A/B/C selection and Replay re-arm only preview effects. Product-grid ancestors never animate in any option. Real source photos, prices, official logo, vertically scrollable layout, reduced-motion cancellation, focus visibility and progressive reading are retained. The earlier component lab remains at `/motion-preview?lab=components`.

## Other supporting changes

- `scripts/test-motion-isolation.mjs`: reproducible Git-baseline comparison and actual browser restoration/isolation tests.
- `scripts/test-scroll-showcase.mjs`: delegates to the current restoration/isolation contract. Earlier quiet-motion expectations are superseded.
- `docs/PROGRESS.md`: chronological progress/evidence.

## Unrelated functionality preserved

Automated baseline comparison verifies no changes to inventory/data, catalogue services, types, Header, Footer, contact/payment configuration, COD payment form/copy, root application or Supabase migrations. Restoring CheckoutForm changes only its prior scroll motion; financial logic and payment details remain intact. Footer credit, removed support-number sentence and floating support destination are preserved.

## Verification

Frontend lint, strict TypeScript, all 82 unit tests and production build passed. Native-animation/browser checks passed at 390 and 1440px for restored 450ms section reveals, 1.03 product/category hover scale, 1.8 gallery hover, original route translation, and unchanged footer/WhatsApp behavior. Showcase A/B/C switching, Replay, static grids, no card-stagger, reduced motion, loaded original photos and no horizontal overflow passed. Source command: `node scripts/test-motion-isolation.mjs`. Evidence: `artifacts/motion-isolation/`.

Hosted release SHA, URL and browser results are recorded in the subsequent progress entry after deployment. Production is not deployed or changed. Do not change the main site's animation design until the owner explicitly approves a showcase option.
