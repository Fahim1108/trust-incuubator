# Secure Staging administration access

Current permanent-access status and exact instructions: [STAGING_OWNER_ACCESS.md](STAGING_OWNER_ACCESS.md).

Staging project: `jwccyndyaamodxjtjtfo`. Production `euoannuvovsbwxjqnriw` remains separate and untouched.

The user explicitly authorized a permanent Staging Owner for `attiresarena664@gmail.com`. One account was invited after confirming no duplicate existed. Email/password setup and secure Owner activation are complete for current Staging UID `1cd1f36e-7935-453e-b1fd-3950a55ebf31`. Personal TOTP verification is now true in Staging and the user confirmed “dashboard opened.” Permanent Staging access is verified. No default password exists, and no Production credentials or MFA secrets were copied.

Milestone 1's disposable-account hosted security sign-off remains valid historical evidence: [HOSTED_MILESTONE_1_VERIFICATION.md](HOSTED_MILESTONE_1_VERIFICATION.md). The current personal invitation flow is an additional access gate, not permission to weaken MFA or RLS. Permanent access is verified; Product Management has resumed under the existing Staging-only scope.

Stable login: https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/login . Vercel Preview access is required first. `/admin/login` redirects to `/admin/sign-in`; protected administration requires verified identity, a real database role and AAL2.

Management inspection restrictions are documented in [MANAGEMENT_API_LIMITATIONS.md](MANAGEMENT_API_LIMITATIONS.md); they are not a reason to request broader scopes or copy privileged keys into the application. Use configured staging-only operator credentials for authorized provisioning. All application clients use the publishable key and authenticated session.
