# Isolated Claude design preview

This review application is deliberately separate from the live/backend app. The root Vercel configuration still targets the existing application.

```bash
npm ci
npm --prefix frontend/claude ci --ignore-scripts
npm run dev:claude
```

Or use the verified optimized build:

```bash
npm run build:claude
npm run start:claude
```

The preview listens on cloud-internal port 3001. This is not a public link for a user on another computer. No publicly accessible preview URL/deployment has been created.

Launch scripts remove Supabase/database/site-origin bindings from the child process and set CLAUDE_DESIGN_PREVIEW=1. The preview rejects requests without that flag and always rejects VERCEL_ENV=production. Do not add real credentials to this package or remove the preview notice. Its customer/order/catalogue/shipping records are fixtures; cart and wishlist are browser-local; real auth/orders/payments are unavailable. Admin routes are deliberately 404.

Checks:

```bash
npm run check:claude
npm run test:claude
npm run build:claude
npm run start:claude
# In another terminal:
npm run test:claude:browser
```

The browser script uses installed /usr/bin/chromium and captures artifacts/claude/home-390.png, home-1440.png, preview captures, shop/product/checkout captures, plus verification.json. Fixtures in adapter tests use .invalid email addresses; no emails are sent. Browser verification does not prove real backend integration.

Root checks remain npm run lint, npm run typecheck, npm test, npm run test:db, npm run build. The SQL harness uses plain PostgreSQL with simulated Supabase claims, not a new hosted Supabase integration test.

## Separate Vercel project

See [VERCEL_CLAUDE_PREVIEW.md](VERCEL_CLAUDE_PREVIEW.md). The package is now independently buildable: its loader no longer imports root app source and its tests declare their own Vitest dependency. Use a NEW project with Root Directory frontend/claude, Next.js, Node 24.x, install npm ci --include=dev and build npm run build. App-local vercel.json retains the non-secret preview flag; Production remains denied. Do not repoint the existing trust-incuubator project or copy its backend credentials.

After obtaining the actual new Preview URL, CLAUDE_PREVIEW_URL=https://THE-ACTUAL-URL.vercel.app node scripts/test-home-merchandising.mjs verifies the hosted UI and writes hosted captures to artifacts/vercel-claude. A cloud-local screenshot does not prove a hosted deployment.
