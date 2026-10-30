# Permanent Staging Owner access — 30 October 2026

## Current status: permanent Staging access VERIFIED

- Project: `jwccyndyaamodxjtjtfo` only.
- Designated, explicitly approved email: `attiresarena664@gmail.com` (taken from the previously confirmed Production Owner identity; no Production Auth/database query was made).
- Checked Staging first: no existing matching account. Supabase accepted one invitation; no duplicate account created.
- Current confirmed Staging UID: `1cd1f36e-7935-453e-b1fd-3950a55ebf31`.
- Earlier invitation UID `9ecf7364-3db8-4d47-8471-da12f5881690` no longer exists. Read-only verification found exactly one account matching the designated email. Its replacement occurred outside this provisioning operation; no cause is assumed. Activation used the current confirmed identity, not the stale invitation UID.
- Last verified: email confirmed, password present, role `owner`, verified TOTP, last sign-in `2026-10-30 15:54:33.977485+00`. The user confirmed “dashboard opened.” No password or MFA secret/code was requested/read/copied.
- Owner role **assigned and read-back verified** using existing `private.provision_owner` and the user's prior explicit authorization. Privileged data/actions remain blocked at AAL1 until TOTP is verified.

## Stable Staging URLs

Admin login:
https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/login

Invitation callback (added to Staging Redirect URLs by the user):
https://attires-arena-frontend-preview-git-fea-e21f8d-fahim-s-projects1.vercel.app/admin/accept-invite

Branch alias inspected through Vercel: READY, feature/claude-frontend-integration, application commit `56edb1c6671a967ab2d5a1f1f497bcadf8b38f99`, not Production. Exact immutable deployment also exists at https://attires-arena-frontend-preview-3h6xdce66-fahim-s-projects1.vercel.app . No custom domain or Production alias was changed.

## First-time setup procedure (completed)

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
- Published distinct `Attires Arena Staging` issuer / `Staging store administration` label in Preview commit `56edb1c6671a967ab2d5a1f1f497bcadf8b38f99` after password setup, before asking for MFA enrollment. Production issuer remains unchanged. Do not publish another revision during the active MFA form.
- No migrations, Production database/Owner/password/MFA changes, Production environment/DNS changes, paid services or further Product Management work in this task.

## Activation verification checkpoint

Executed the existing secure provisioning operation only for current UID `1cd1f36e-7935-453e-b1fd-3950a55ebf31` and approved email. Read-back role is `[owner]`. Read-only foundation inspection passed: 12 migration records, 12 RLS tables, 77 validated constraints, four Storage policies and private draft bucket. State: 1 Auth user, 1 staff assignment, 0 products and 0 draft objects. Permanent account is intentionally retained, not a disposable test fixture. Personal TOTP metadata is now verified and the user confirmed the actual dashboard opened. Permanent access is signed off; Milestone 2 Product Management may resume.

## Permanent access acceptance

User confirmed “dashboard opened.” Read-only status independently verified the approved email, current UID, Owner membership, confirmed email, password presence, recent sign-in and `totp_verified=true`. The personal browser observation is user-provided evidence; the earlier automated disposable-account hosted security suite is separate evidence. We did not impersonate the permanent Owner or access their password, session tokens, TOTP code or QR. The cancelled new disposable-invitation browser test remains unexecuted and is not claimed as passed.

## Normal future sign-in

Use the stable `/admin/login` URL, attiresarena664@gmail.com, your own Staging password and the existing Attires Arena Staging authenticator entry. You do not need to enroll another factor. Production credentials and authenticator remain separate.
