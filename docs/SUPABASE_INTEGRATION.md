> Connection foundation notes below preserve the earlier checkpoint. Signup, student persistence, migrations and account-directory access are now implemented; see [STUDENT_BACKEND.md](STUDENT_BACKEND.md) for current behavior.

# Supabase integration — connection foundation

Selected project: **PROTO-STAR**

- Project ref: `ebuehnzfydtcwwhztnzu`
- API URL: `https://ebuehnzfydtcwwhztnzu.supabase.co`
- Client: `@supabase/supabase-js` pinned to `2.117.3`, with npm lockfile.
- Browser configuration: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in ignored `.env.local`.
- `.env.example` documents the public configuration without including a real key.

## What is connected

The application initializes one Supabase browser client through `src/services/supabase/client.js`. Backend features can import `getSupabaseClient()` when their services are implemented. If no configuration is provided, the demo can still run. Partial or invalid configuration fails validation, and Vite validates configuration before bundling.

Only public publishable keys are accepted. Secret, service-role, and legacy JWT keys are rejected by this setup. Never store privileged keys in Vite variables. Key values are not included in these notes or validation output.

Session persistence and automatic token refresh use SDK browser defaults explicitly. Email/password login is now implemented; see [Login module](LOGIN_AUTH.md). URL session detection remains disabled because the app uses hash routing and password login requires no callback. Account roles are read from server-managed `app_metadata.role`; role provisioning and database policies remain pending. The workspace selector is available only in the explicit demo preview.

## Repeatable connection check

```sh
npm run supabase:check
```

This issues a read-only request to the selected project's Auth settings endpoint with the public API key. A successful response verifies public endpoint reachability and key acceptance. It does not sign in a user, query student tables, test RLS, or prove that application persistence has been implemented.

## Verification completed

- Supabase connector read-only SQL: `select 1 as connection_ok` returned `1`.
- Public API check returned HTTP 200 with the expected settings response.
- Production build passed.
- All 22 tests passed, including key/URL validation and failed-connection handling.
- Browser login, validation, password visibility, live invalid-credential rejection, demo entry/exit, refresh persistence, and mobile layout were verified. Successful live account sign-in has not yet been tested.

No migrations, tables, policies, storage buckets, users, or Edge Functions were created or modified. Dashboard/domain data still comes from synthetic fixtures and local browser storage. Login uses Supabase Auth; database/backend domain services remain the next review module.

## Team setup

Copy `.env.example` to `.env.local`, then obtain the project URL and publishable key from the project's Supabase Connect dialog or API Keys settings. Restart Vite after changing environment values. Public configuration is included in browser builds; `.env.local` remains ignored by Git.

## Next implementation stage

Inspect the selected project's existing schema before designing migrations. Then implement trusted Auth/role provisioning, the agreed minimal schema, ownership/cohort/consent RLS, and domain services. Replace each demo service only after its data-layer access checks are verified. Success Score weights and review thresholds still require an explicit model decision.

References: [Supabase JavaScript initialization](https://supabase.com/docs/reference/javascript/initializing), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).
