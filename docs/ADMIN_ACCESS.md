# Secure development admin access

This increment runs only in the existing Claude Preview application. Do not deploy this sample-data frontend to Production.

1. The designated owner must have a confirmed, nonanonymous Supabase Auth account in development project `euoannuvovsbwxjqnriw`.
2. The store owner must explicitly identify that account. An earlier customer-test email is not authorization to promote it.
3. A trusted operator verifies its UUID and confirmed email in Supabase, then executes the existing private provisioning function from the development SQL editor:

```sql
select private.provision_owner(
  '<verified-user-uuid>'::uuid,
  '<matching-confirmed-email>',
  'Store owner explicitly designated this development account'
);
```

The function is not callable through customer PostgREST or public registration; it validates both identity fields and records an operator audit. Never grant its execution to anon/authenticated. Never send passwords, MFA secrets, QR images, OTPs or access tokens in chat.

4. Visit `/admin/sign-in`, enter that account's own credentials, and enroll an authenticator. Scan its private QR, enter a current six-digit code, then enter the protected workspace.
5. Owner/product_manager may save imported drafts; analyst/order_manager can read catalogue data; other existing roles have no catalogue permission. No new roles are assigned through this UI.
6. Authenticator recovery/unenrollment is a trusted Supabase operator task for now. The UI cannot bypass MFA or perform account recovery. Keep a secure recovery process before real business use.

Server config: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (existing NEXT_PUBLIC equivalents accepted). The development project URL is explicitly checked. The application never needs service-role or management tokens. Cookies are HttpOnly, SameSite=Lax, Secure over deployed HTTPS, namespaced separately from the root app; proxy refresh is scoped to `/admin`. Staff membership is checked before data access and each server action. New RPCs independently require AAL2 and DB permissions.

Next.js Server Actions enforce same-origin requests. Supabase Auth supplies provider-side authentication/MFA rate limits; a distributed application-specific throttle and automated abuse testing remain pending. No MFA enrollment secret is logged or stored by application code.

## Verification commands

```sh
npm --prefix frontend/claude run lint
npm --prefix frontend/claude run typecheck
npm --prefix frontend/claude test
CLAUDE_DESIGN_PREVIEW=1 npm --prefix frontend/claude run build
npm run test:db
node --use-env-proxy scripts/admin/migrate-development.mjs
node --use-env-proxy scripts/admin/test-hosted.mjs
```

Migration script defaults to a rollback dry run, is fixed to development, and skips existing history. `--apply` is an explicit additive development apply. Hosted verification creates and deletes disposable Auth/MFA accounts and a single isolated intake fixture; it never edits real shirts. Do not run concurrent copies (reserved test source ID AA-SHIRT-999).

Browser verification: start the built app with `CLAUDE_DESIGN_PREVIEW=1 NODE_USE_ENV_PROXY=1 npm --prefix frontend/claude start -- --port 3001`, with configured development bindings, then run `ADMIN_BROWSER_BASE=http://localhost:3001 node --use-env-proxy scripts/admin/test-hosted.mjs`. Hosted protected Preview needs a temporary automation bypass supplied in memory; never put it in a public URL or commit it.

## Remaining security scope

This is an incremental admin foundation, not a launch-ready commerce admin. Legacy catalogue read and inventory/moderation RPCs retain their original permission policies and do not all enforce AAL2; new entry points do. Role management, owner recovery, distributed app rate limiting, comprehensive session revocation/abuse E2E, CSP and safe storage uploads need further work. Sales/payment/CMS modules remain unavailable. Draft saving does not publish or manufacture a variant. No production data or settings are changed.
