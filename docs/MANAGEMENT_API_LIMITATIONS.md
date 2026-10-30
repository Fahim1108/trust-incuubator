# Staging Management API inspection limits

The staging-scoped management token receives HTTP 403 for `auth_config_read` and `api_gateway_keys_read`. These are operator inspection permissions, not permissions used by the deployed Next.js application, Supabase Auth, PostgreSQL RLS or private Storage.

The application uses only its configured publishable key and the authenticated customer's/staff member's JWT. It never needs a management token or service-role key. Adding these Management API permissions would not improve runtime authorization. Do not broaden token scope solely to make these inspection endpoints pass.

Supported evidence instead:

- Staging `/auth/v1/settings` returns email login enabled and email confirmation required.
- Real password login, six-digit TOTP enrollment/challenge, signed AAL1/AAL2 requests, role restrictions and private Storage API tests have passed.
- Site URL, redirect allowlist and enabled TOTP were manually reviewed in the Staging Dashboard. Email delivery/recovery links require a controlled mailbox and are separate from admin-created confirmed QA accounts.
- Read-only database inspection validates the existing migrations, RLS, functions, constraints, bucket and policies. Hosted browser verification must separately prove the deployed application uses these controls.
- Operator-only staging test keys remain in secure Codex settings, never frontend/Vercel source. These keys facilitate disposable fixtures; they are not application dependencies.

The two 403 responses are **not standalone release blockers** if equivalent evidence is current and recorded. Outstanding hosted tests, unverified redirect/domain/email configuration, missing required application credentials, failed access controls or missing application features remain genuine release blockers. This does not grant Production release approval or certify the entire store ready for launch.
