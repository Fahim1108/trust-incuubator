# Separate Claude frontend Preview project

The existing `trust-incuubator` project must not be repointed or modified. Its actual remote settings have not been inspected: this cloud's network has denied Vercel and no Vercel authentication is configured. The user reports that its deployment at 396a6a8 displays the root application. Locally, the root `vercel.json` runs the root package's build, which builds `src/app`; the intended UI is a different package under `frontend/claude`.

## New project settings

Use a distinct project such as **attires-arena-claude-preview** in the same authorized Vercel account/team. These settings apply only to that NEW project:

| Setting | Value |
| --- | --- |
| Repository | Fahim1108/trust-incuubator |
| Branch | feature/claude-frontend-integration |
| Root Directory | frontend/claude |
| Framework | Next.js |
| Node.js | 24.x (package engines requires >=24 <25) |
| Install | npm ci --include=dev |
| Build | npm run build |
| Output | Framework default (.next) |
| Deployment target | Preview only |

Use the latest verified remote branch SHA. Do not deploy 66d6fb1 or the pre-packaging-fix commit just because an old deployment references it. Create the project without an automatic Production deployment, then create a Preview explicitly. Do not repoint the existing project, promote a deployment, assign production domains, copy its environment variables or mutate its database.

`frontend/claude/vercel.json` scopes framework/install/build configuration and the non-secret `CLAUDE_DESIGN_PREVIEW=1` flag to this application. The app's existing proxy still rejects `VERCEL_ENV=production` unconditionally. Keep Vercel system environment variables available. The app remains labelled as a demonstration and noindexed.

No Supabase, database, payment or administrator credentials are needed in this project. VERCEL_TOKEN, if configured for deployment, belongs only in the Codex cloud environment's secure integration binding; never add it to the web project's public variables, application env files or source.

## Fixed standalone blockers

- The Claude loader previously imported the root application. Its identical implementation/CSS now reside inside the Claude package; the original root files are unchanged. The logo asset is unchanged.
- Vitest was only declared at repository root, while the Claude tsconfig includes tests importing it. Added it as a frontend development dependency and an independent test command. `--include=dev` ensures the build has TypeScript, Tailwind and test type dependencies.
- The app can now be copied/installed/built without root application source files or root node_modules. No storefront redesign or backend replacement was performed.

## Verification

From repository root:

```
npm run lint
npm run typecheck
npm test
npm run check:claude
npm --prefix frontend/claude test
npm run build:claude
```

Also validate a temporary isolated copy of frontend/claude (excluding node_modules, .next and secret .env files): run npm ci --include=dev, lint, typecheck, test, build, then start it with CLAUDE_DESIGN_PREVIEW=1, VERCEL_ENV=preview and a free port. This catches accidental reliance on the root app or dependencies.

After a real Preview deployment is ready, obtain its URL and commit SHA from authenticated Vercel deployment metadata, then run:

```
CLAUDE_PREVIEW_URL=https://THE-ACTUAL-NEW-PREVIEW.vercel.app node scripts/test-home-merchandising.mjs
```

The URL is an input obtained from Vercel, never a guessed hostname. The script checks the actual rendered header, all enabled homepage sections, responsive mixed collections, white original logo/wordmark, burgundy footer, social icons, exact developer credit, links and no overflow/browser exceptions at 390/768/1440px. Hosted screenshots go to artifacts/vercel-claude. Cloud-local isolated checks go to artifacts/standalone-claude and do not establish remote deployment success.

## Remote prerequisites

The environment network draft now preserves existing destinations and adds vercel.com, api.vercel.com and *.vercel.app. It also adds a secure VERCEL_TOKEN requirement restricted to api.vercel.com. The user must save/apply network edits and supply the token securely through environment settings. Saving an agent draft alone does not update the running proxy or provide authentication.

Once those requirements are active: inspect trust-incuubator read-only to record its true root/build settings; create only the separate project above; deploy the latest verified commit explicitly as Preview; poll deployment readiness; verify its source SHA; then execute the hosted browser checks. Never report a cloud-local URL or a guessed hostname as the user's deployed Preview.
