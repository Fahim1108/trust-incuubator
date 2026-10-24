# Cloud development preview for customer recovery

No public preview URL could be verified in the current checkout. VERCEL_URL/branch URL/project IDs/token are unset; .vercel/project.json and vercel.json are absent. Supabase Auth has no non-loopback HTTPS origin configured. GitHub deployment metadata could not be read through the network. These observations do not prove that no Vercel project exists in the owner's account.

No production settings were changed, no deployment was made, and no new recovery email was sent. The selected customer email remains unchanged. No Vercel or mailbox credentials should be pasted into chat.

## Manual Vercel step

Open the existing project in Vercel and inspect Deployments. If a Ready deployment marked Preview already exists, open it and copy its actual HTTPS URL (prefer a stable preview-branch URL). Confirm it serves this application and can be reached from the email-opening browser. Do not substitute a Production deployment.

If no Preview exists, create a deployment from a non-production Git branch using the existing project's preview workflow. The repository code must be available to Vercel first; this checkout's commits have not been pushed by the assistant. Never push main or trigger production merely to obtain a preview. If the dashboard cannot access the source, return to Codex for a dedicated preview-branch publishing step after checking that branch's deployment target. CLI deployments, if used, must remain Preview; never use --prod.

Set these variables for Vercel's **Preview** environment only: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SITE_URL. Use the development project euoannuvovsbwxjqnriw. Do not add Management tokens, database passwords or service-role keys to the web app. Set SITE_URL to the actual stable HTTPS preview origin and redeploy Preview after variable changes. Keep production variables/settings untouched.

Check deployment protection: the email-opening browser must be able to access the app. Do not disable production/team-wide protection or share bypass credentials. If Preview requires Vercel login, sign into the authorized account in that browser first and report any remaining access problem.

## Development Supabase URL settings

Only after the preview is reachable, open Supabase project euoannuvovsbwxjqnriw → Authentication → URL Configuration. Let PREVIEW_ORIGIN stand for the verified HTTPS origin (not a literal value to paste):

- Site URL: PREVIEW_ORIGIN
- Allowed redirect: PREVIEW_ORIGIN/auth/callback
- Allowed redirect: PREVIEW_ORIGIN/auth/callback?next=/account/password

Use exact URLs, not a wildcard for every Vercel project. Keep email confirmation enabled. Do not touch another/production project's settings. Set the same SITE_URL in Codex environment settings for consistency.

The application already constructs recovery emailRedirectTo from SITE_URL in src/lib/auth/actions.ts. No hardcoded localhost recovery redirect exists to replace. No origin is invented or automatically changed before the preview is verified.

## Finish customer recovery

Open the verified Preview /account page and initiate Reset your password for the existing dedicated test email. Open only the newest message in the same browser used to request it; PKCE needs that browser's verifier cookie. Set a customer password privately on the recovery page, then test login/logout there. Never share the email password, customer password, received link, code, tokens or secret keys in chat. Prior localhost links are not a valid preview test.

Current status: public customer signup was accepted previously; confirmation and login remain unverified for that exact account. No preview-dependent Auth success is claimed.


## Prepared Git transfer

The local `preview/customer-auth` branch contains the application and explicit Vercel Next.js/install/build settings. `.vercelignore` excludes local environment files, dependencies and build output; `.vercel/` CLI metadata is ignored by Git. There is no custom build step applying database migrations.

The intended transfer command, pending confirmation of Vercel's production-branch configuration, is:

```sh
git push --set-upstream origin preview/customer-auth
```

This command is not a production deployment command, but a connected Vercel Git integration can trigger deployment on push. Confirm this branch is not a Production source (or that no Vercel project is connected) before running it. The remote reported no branches during preparation. Do not change the default branch, push main, use --prod or assume the first imported branch will be treated as Preview. Configuration here does not itself force Vercel to choose Preview.
