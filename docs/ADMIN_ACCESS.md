# Secure staging administration access

Staging project: `jwccyndyaamodxjtjtfo`. Production `euoannuvovsbwxjqnriw` must not be used for development, QA or provisioning under Milestone 1.

## Current state

Staging schema and private draft-media policies are installed. There are **zero Auth accounts and zero staff assignments**. No permanent Owner, password or MFA factor has been created. The existing Production Owner is not copied or modified.

The stable application entry is `/admin/login`, which redirects to the preserved `/admin/sign-in` flow. `/admin` requires verified identity, a database role and AAL2. This code has not been deployed by Milestone 1; do not assume an old Preview deployment uses the new staging configuration.

## Future designated staging Owner

Only after explicit account approval:

1. Create/identify a separate confirmed, nonanonymous staging Auth account. Do not copy Production UUIDs, passwords, sessions or MFA secrets.
2. Verify its exact staging UID and email. A trusted staging operator may then invoke the existing private provisioning function with those verified values and an authorization reason. It is not exposed to customer/browser execution. No default password exists.
3. Sign into the staging Preview, enroll TOTP and verify a current code. Membership lookup remains available before MFA, while privileged data/mutations require AAL2.
4. Never share passwords, verification links, OTPs, tokens or MFA QR/secrets in chat. Account recovery must be separately authorized; never remove MFA to make a test pass.

No provisioning command was executed by Milestone 1.

## Environment

The application needs `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for staging; see `frontend/claude/.env.example`. Vercel provides its own environment identity automatically. For a local optimized Preview server, explicitly use `VERCEL_ENV=preview`. Do not use historical Production NEXT_PUBLIC bindings as local staging defaults.

Privileged operator/test keys never belong in the application or NEXT_PUBLIC configuration. The scoped operator token still lacks staging Auth-configuration/API-key read access; real Auth/MFA/Storage API verification is blocked until this is resolved securely.

## Commands

```sh
npm run verify:staging
npm run migrate:staging
npm run test:staging:sql
npm run test:db
npm --prefix frontend/claude run lint
npm --prefix frontend/claude run typecheck
npm --prefix frontend/claude test
npm --prefix frontend/claude run build
```

`migrate:staging` defaults to a rolled-back dry run; `-- --apply` is explicit and staging-isolated. `test:staging:sql` uses temporary transaction-local fixtures and simulated claims with actual Supabase SQL helpers, then rolls everything back; it is **not** signed Auth/GoTrue or binary upload verification. `test:db` runs in a disposable network-isolated PostgreSQL container.

Historical inventory/customer/staff/development verification scripts are blocked before any remote operation. Use current staging commands. The real hosted Auth harness is `scripts/admin/test-hosted.mjs`; it must not be counted as passed until its required staging-only credentials/access and cleanup are verified.

See `MILESTONE_1_REPORT.md` for actual results and blockers, and `PRODUCTION_RELEASE_PLAN.md` for the approval-gated future same-domain deployment plan.
