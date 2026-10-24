# Attires Arena loading animation

The shared client component is src/components/ui/AttiresArenaLoader.tsx, with a local CSS module. It uses the unchanged original transparent white PNG (including its embedded lettering), a #6B0202 circular badge and an independently rotating SVG ring. Runtime animation uses no video/GIF or motion library.

- Desktop badge/ring: 150/185px. Mobile: 110/140px.
- SVG stroke: 4 units, visible gap, clockwise 360-degree transform, 1.6 seconds, linear, infinite.
- Reduced motion: stationary ring. The logo and badge never animate.
- Full-screen background: #FFFFFF. A polite status is announced; the artwork is decorative to screen readers.
- Active full-screen instances make surrounding content inert, contain Tab focus and restore prior state on cleanup. Content is released immediately when pending finishes. A non-interactive, aria-hidden copy may fade out for 140ms; it cannot block the ready content. Reduced-motion exits are immediate.

Root app/loading.tsx uses the full-screen loader for real App Router Suspense loading. The isolated Claude storefront has the same loading fallback via a thin wrapper selecting its own static original-logo URL. Existing shop/category/brand skeletons remain, so ordinary catalogue interactions need not show a global overlay. No window.onload, global request listener, fake progress or minimum display timer was added. Fast cached routes may never display a loader, which is intentional.

For a real action, keep a loader mounted with active={isPending} and fullScreen as appropriate. Do not trigger a full-screen overlay for trivial interactions. The owner must clear its pending state in finally/error paths; the loader never pretends a request is finished. Next removes route fallbacks on resolution/error.

## Browser demonstration and tests

Run npm run start:claude after npm run build:claude, then open /loader-preview on the isolated development preview. Its inline animation is explicitly a demonstration. Its button fetches a real brand asset with no-store, an abort timeout and finally cleanup; it adds no artificial wait. The preview remains gated by the existing non-production preview flag and noindex controls. No public deployment was created.

Run node scripts/test-loader.mjs for executable Chromium checks. The test runner temporarily holds an actual fetch in the browser to inspect its pending UI, then releases/aborts it. The application itself contains no test delay. Optional recording uses LOADER_RECORD_VIDEO=1 and Playwright's ffmpeg installation; screenshots require only the existing Chromium executable. The committed MP4 is a recording of the running component, not a runtime asset.

Verified: logo geometry is stationary; ring transform advances and repeats with exact CSS timing; responsive dimensions/centering; pure white and maroon; pending visibility; Tab/background isolation; immediate active-overlay removal and short fade cleanup; successful/failed-request recovery; reduced-motion animation suppression. Root HTTP response streaming also contained the actual Next route loading fallback and it was absent once the homepage finished rendering.

Root and Claude lint, TypeScript and production builds passed; all 58 existing tests and 10 preview checks passed. Existing 20-route browser checks passed at 390/1440px, including cart, wishlist, gallery, search and sorting. No homepage layout, existing skeleton, business action, Supabase code, database or other animation was modified.
