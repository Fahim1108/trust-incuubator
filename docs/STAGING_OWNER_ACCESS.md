# Permanent Staging Owner access — 30 October 2026

## Current status: Owner activated; personal TOTP/browser verification pending

- Project: `jwccyndyaamodxjtjtfo` only.
- Designated, explicitly approved email: `attiresarena664@gmail.com` (taken from the previously confirmed Production Owner identity; no Production Auth/database query was made).
- Checked Staging first: no existing matching account. Supabase accepted one invitation; no duplicate account created.
- Current confirmed Staging UID: `1cd1f36e-7935-453e-b1fd-3950a55ebf31`.
- Earlier invitation UID `9ecf7364-3db8-4d47-8471-da12f5881690` no longer exists. Read-only verification found exactly one account matching the designated email. Its replacement occurred outside this provisioning operation; no cause is assumed. Activation used the current confirmed identity, not the stale invitation UID.
- Last verified: email confirmed, password present, role `owner`, no verified TOTP. The user reported password setup completed. No password was requested/read/copied.
- Owner role **assigned and read-back verified** using existing `private.provision_owner` and the user's prior explicit authorization. Privileged data/actions remain blocked at AAL1 until TOTP is verified.

## Stable Staging URLs

Admin login:
https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/login

Invitation callback (added to Staging Redirect URLs by the user):
https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/accept-invite

Branch alias inspected through Vercel: READY, feature/claude-frontend-integration, application commit `210af8d293e18aee0ccf44d643f59983de493902`, not Production. Exact immutable deployment also exists at https://attires-arena-frontend-preview-3h6xdce66-fahim-s-projects1.vercel.app . No custom domain or Production alias was changed.

## User steps

1. Open the stable Staging login URL first. If Vercel asks, sign into your authorized Vercel account so Preview access is established before opening the invitation.
2. Open the Supabase invitation in the designated mailbox, including Spam if needed. Never paste the invitation URL/token into chat.
3. Set a new, separate Staging password (12–128 characters), confirm it and submit. Do not reuse or disclose Production credentials.
4. Reply “password saved” or describe an error without sending passwords, links or codes.
5. After the operator confirms Owner activation, use the stable login URL with the same email and your new Staging password. Enroll an authenticator and verify its six-digit TOTP in the website only. Keep a distinct Staging entry; do not overwrite the Production authenticator entry.
6. Confirm that the real dashboard opens. The operator will independently read the Staging role, email-confirmation, sign-in and verified-TOTP metadata. No password or MFA secret is needed by the operator. Continue Product Management only after this access gate passes.

## Provisioning commands

`node --use-env-proxy scripts/admin/provision-staging-owner.mjs` is read-only status for the designated email.

`--invite` refuses to create a duplicate or silently resend when an account already exists. It requests the secure Supabase email invitation; it generates no Owner password.

`--activate` invokes only the existing `private.provision_owner(staging_uid, expected_email, reason)` after confirmation/password checks, then rereads the role. This must wait for the owner's setup completion. It has now been executed for the current confirmed UID and its role was reread successfully. Do not manually confirm email or bypass the provisioning/MFA checks to finish faster.

## Implementation and verification

- Added a staging-only `/admin/accept-invite` bridge and password form. Fragment credentials are removed from the address bar; no localStorage or credentials in logs. Supabase verifies the session; an HttpOnly/Secure/SameSite=Strict setup-intent cookie binds the password operation to that same user and expires after 15 minutes.
- Password validation is server-side, confirmation required. No automatic role assignment. Existing MFA-protected accounts reject AAL1 password setup; this does not disable/reset MFA. Production rejects this route and its actions.
- Frontend lint, TypeScript, 131 tests and optimized build passed; root lint, TypeScript, 58 tests and five operator security checks passed (194 automated tests total). Initial effect lint issue corrected without disabling rules.
- Hosted disposable-invitation test script prepared, but its escalated execution was cancelled before any result. Read-only inspection confirmed no disposable setup account or artifact was created. Do not claim that test passed. Actual permanent-owner email/password/TOTP/browser verification remains pending user participation.
- Prepared a distinct Staging MFA issuer label locally, tested but not pushed/deployed yet. Avoid replacing the stable deployment while the user has an in-progress password-setup form. Password setup is complete; publish it before MFA enrollment. Production issuer remains unchanged.
- No migrations, Production database/Owner/password/MFA changes, Production environment/DNS changes, paid services or further Product Management work in this task.
