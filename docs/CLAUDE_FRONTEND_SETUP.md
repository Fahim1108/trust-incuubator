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
