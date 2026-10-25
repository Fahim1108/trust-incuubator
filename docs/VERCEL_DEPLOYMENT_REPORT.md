# Claude frontend Preview verification — 2026-10-25

## Deployed website

- URL: https://attires-arena-frontend-preview-8jqhtjtcz-fahim-s-projects1.vercel.app/
- Project: attires-arena-frontend-preview
- Project ID: prj_QgA6P7BJr74v5GbojhBXyxkXRZAA
- Deployment ID: dpl_FMxmG3oYb7eBuRs2DffnroNuJruq
- Source repository: Fahim1108/trust-incuubator
- Branch: feature/claude-frontend-integration
- Verified Git SHA: 933ecd052a03419918b4ea5432ad8807fbf393ea
- State: READY
- Environment: Preview (the REST API's legacy target value is staging; no custom environment)
- Root Directory: frontend/claude
- Framework: Next.js
- Node.js: 24.x
- Install: npm ci --include=dev
- Build: npm run build

Vercel Authentication is retained. Open the URL while signed into the authorized fahim-s-projects1 account. Hosted checks used Vercel's supported automation access, generated only for the new project and revoked immediately after verification. No access token or protection secret appears in source, screenshots, this report or the public URL.

## Cause and resolution

The original trust-incuubator project was confirmed to have a null Root Directory, so its root configuration built the old src/app application. Its Production branch is preview/customer-auth, which lacks frontend/claude. Neither setting was changed. The separate project was created using the API and the feature branch was selected directly, avoiding the default-branch import picker.

The configured VERCEL_TOKEN could read the old project but lacked project-creation/team access. The user approved the official Vercel CLI device sign-in, which authenticated fahim1108 in the same team and enabled creating the separate project. Credentials remain private outside the repository.

## Verification actually executed

- Root lint, strict TypeScript and 58 existing tests passed during deployment preparation.
- Frontend lint, strict TypeScript, 20 tests and production build passed before submission. Missing restored frontend node_modules initially caused dependency resolution errors; npm ci restored the locked dependencies and all checks then passed.
- Authenticated Vercel metadata verified the new project ID, correct root/framework/node/build settings, READY state, exact Git source SHA and feature branch.
- Actual hosted Chromium checks passed at 390, 768 and 1440px. They verified the centered single-row desktop header, separate Shop by Categories/Brands, New Arrivals and Featured Picks, four mobile/eight desktop cards, diversity/no adjacent repeats, BDT prices, wishlist controls, loaded images, valid product/collection links, disabled collection handling, original white footer logo/wordmark, #400000 footer, four social circles, exact Created by Firoj Ahamed Fahim credit, no horizontal overflow and no browser exceptions.
- Real hosted screenshots: artifacts/vercel-claude/home-390.png and home-1440.png; additional tablet/collection captures are in that directory. verification.json contains sanitized deployment metadata and results.
- The browser runner's read-only sandbox prevented Chromium from opening its NSS trust database. Checks succeeded with the platform-provided proxy CA trusted and appropriate filesystem access; TLS verification was not disabled.
- The original project's recorded root/framework/node/install/build/Git settings were compared after deployment and remain unchanged. No Supabase operation, default-branch change or root application edit was performed.

## Canceled initial attempt

The first request omitted target, following the API documentation's Preview default. Vercel instead classified the first Git deployment of this new project as Production. The response safety check caught it and the job was canceled (dpl_fQtP92ALtfSLhbEoFQ3oME7T3LWK; CANCELED). It was not the existing production project. Explicit target=preview was rejected by this API version; the supported legacy target=staging produced the successful non-production Preview recorded above. Never rely on omitted target for a new project's first deployment.

## Remaining integration work

The hosted site is the isolated, labelled Claude design preview: catalogue/customer/shipping content is fixture data, cart/wishlist persist in the browser, and live Supabase authentication, orders and payments are not connected here. Production-denying proxy, noindex behaviour and unavailable mutation boundaries remain intact. Social URLs are unconfigured and icons do not pretend to be active links. Trending/popularity/outfit sections remain disabled pending suitable data.

These verification documents and hosted screenshots are local workspace outputs after deployment. They do not imply a newer frontend commit; the deployed source remains the exact SHA recorded above.
