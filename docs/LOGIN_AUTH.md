> Historical login-only checkpoint. The current signup and database role model is documented in [STUDENT_BACKEND.md](STUDENT_BACKEND.md).

# Login and authentication review module

The login page is at `/#/login`. Desktop has equal-width project introduction and sign-in panels; mobile stacks a shorter introduction above the form. Student, Faculty, and Recruiter each use email/password login, with native role radios, password visibility, field errors, pending state, safe authentication errors, and an explicit synthetic demo entry.

## Authentication behavior

- The official Supabase client calls `signInWithPassword`, then verifies identity with `getUser`.
- Session restoration uses `getSession` only as a hint and verifies the user with Supabase.
- A trusted account role is the exact value `student`, `faculty`, or `recruiter` in server-managed `app_metadata.role`. User-editable metadata and the selected form role never grant access.
- Missing or mismatched roles are rejected and the local session is signed out. A matching account opens its assigned workspace; cross-role frontend routes redirect to that home.
- Sign-out affects this browser session using local scope. Passwords are cleared after each attempt and are not saved by application code.
- Unauthenticated workspace navigation requires explicit demo entry. Demo access is session-scoped, survives refresh, and is removed by Exit preview. All dashboard records remain synthetic even after real sign-in.

Frontend route checks protect the interface flow only. They do not replace database authorization. No protected database tables are queried in this module.

## Account provisioning and next backend module

PROTO-STAR's public schema was inspected and contains no tables. No users, migrations, policies, or Auth settings were created or changed in this module. Existing Supabase accounts without the trusted role will receive a setup message. Provisioning must assign roles from trusted server-side tooling, never from browser input or a public role dropdown. No privileged key belongs in a Vite environment variable.

The next module must establish the agreed profile/role model, provision test accounts, implement migrations and ownership/cohort/consent RLS, and connect domain services. Password recovery, signup, and email callback flows are not part of this login checkpoint.

## Verification

- Production build and all 22 automated tests passed.
- Tests cover trusted roles, wrong/missing roles, server-verified restoration, password preservation, local sign-out on mismatch, and safe error messages, alongside existing frontend/config tests.
- Browser checks cover all role selectors, empty-field validation, show/hide password, a real Supabase invalid-credential response using synthetic credentials, disabled pending controls, password clearing, demo entry/refresh/exit, and redirect from a workspace URL after exiting.
- Desktop 1280 × 900 and mobile 390 × 844 layouts inspected.
- Successful login and sign-out with provisioned real accounts remain unverified until test accounts exist. Successful auth branches are covered with SDK mocks, not claimed as live verification.

References: [Password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [User verification](https://supabase.com/docs/reference/javascript/auth-getuser), [User metadata and RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
