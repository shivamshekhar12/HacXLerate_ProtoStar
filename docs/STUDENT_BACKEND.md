# Signup, student persistence and account directory

## Delivered

- `/signup`: Student / Faculty / Recruiter registration with name, email and password, validation, pending state and confirmation handling.
- A database trigger creates each student workspace with blank education/target role, empty skills/projects/experience/achievements, no goal, no history, and sharing disabled. Missing measurements display “No data”; the evidenced-skill count starts at zero.
- Student profiles, portfolio entries, goal state and preview-sharing preferences load/save through Supabase. Real accounts never restore demo local storage. Updates require the current revision, so a conflicting tab cannot silently overwrite a newer save.
- Public preview loads Aaman Sharma and synthetic ghost profiles from `demo_workspaces`. No synthetic student fixtures are bundled into production JavaScript. The versioned seed JSON remains in `supabase/seeds` for reproducibility and tests. Demo edits are local and do not change the shared database seed.
- `/management/login`: separate authorized sign-in. `/management`: searchable, paginated real registration list, with synthetic ghosts listed separately.
- `shivamshekhar8709@gmail.com` is the only configured manager email. The account must be registered and email-confirmed. No password was created or changed for the owner.

## Actual schema

Three CLI-generated migrations were applied to PROTO-STAR and retained under `supabase/migrations`.

| Table | Purpose | Browser access |
| --- | --- | --- |
| `public.profiles` | Identity, approved role, requested role, creation time | Own row read; no role writes |
| `public.students` | Own education/career preferences, self-reported portfolio JSON, goal JSON, revision | Own student read/update only |
| `public.student_measurements` | Read-only source measurements and recorded history | Own read only |
| `public.demo_workspaces` | Synthetic preview seed and role templates | Public read; no browser writes |
| `campus_private.account_managers` | Authorized manager email allowlist | No direct browser read/write |

Portfolio JSON is a bounded Round-1 workspace document, not a claim that the conceptual skill/project tables already exist. Source measurements are separate and never accepted from student save requests. Future institutional imports and recruiter-safe relational querying may normalize these documents.

The database `profiles.role` is now authoritative, replacing the preceding login checkpoint's metadata-only contract. Signup input can request a role; only baseline student access is assigned automatically. Faculty/recruiter requests await trusted approval. No unrestricted admin product role was added. Account management is a separate narrow permission.

All tables have RLS. The public directory RPC wrappers are security invoker; privileged functions live in the private schema and check the confirmed user's email against the allowlist on every directory call. The directory returns identity/registration fields only, never measurements, support notes, passwords or tokens. Anonymous and ordinary student access is denied. Existing emails remain governed by Supabase Auth uniqueness; same-name synthetic ghosts are independent preview records.

## Email setup and owner review

Register the owner email through `/signup`, confirm the email, then use `/management/login`. Project email delivery must permit the address. For general public signup, configure custom SMTP if the project's default sender restricts recipients. The project Site URL and redirect allowlist should include the actual app URL (development: `http://127.0.0.1:5173/`). Email confirmation occurs at Supabase; return to the app and sign in if the redirect points elsewhere. URL session detection is enabled for confirmation callbacks and the app clears Auth callback parameters before routing.

## Verification

- Build and 27 automated tests passed.
- Real database transaction test in `supabase/verify-student-access.sql` passed: fresh defaults, staff request without escalation, own read/write, revision increment, cross-account denial, role/source immutability, ordinary-directory denial, authorized-directory access, public preview and public protected-data denial. All test identities and writes were rolled back.
- Supabase security advisors returned no findings after hardening.
- Browser checked signup role selection/required-name validation, database-backed Aaman overview, faculty/recruiter demo navigation, demo exit and the separate management login. Desktop/mobile signup layouts inspected.
- SDK signup confirmation and management permission branches covered with mocks. Successful live signup/email delivery, real account sign-in/save/reload and owner directory login still need a user-created account. No real user password was entered by the agent.

## Remaining backend scope

Live faculty cohort assignment, approved recruiter consent-based discovery, messaging, institutional imports, analytics decisions, and staff role approval UI are not implemented in this module. Approved live faculty/recruiter workspaces show a clear pending-services state instead of synthetic student records. Their demos remain available through Explore demo preview. Saved sharing preferences currently drive a visual preview only; they do not publish a profile to recruiters.
