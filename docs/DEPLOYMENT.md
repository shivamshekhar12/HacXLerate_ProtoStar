# Porto-Star deployment

Deployed on 8 October 2026 with the Vercel plugin from the current local source snapshot.

- Public production URL: https://protostar-campus.vercel.app
- Vercel project: `protostar-campus` (`prj_pqu3AnBZLx9notrmyCAsxEHgv5Jp`).
- Latest deployment: `dpl_EGhg6W7H8Uky3QeKL6NpiU2pBbKa`, reported `READY`.
- Framework: Vite. Node 22.x. Install `npm ci`; build `npm run build`; output `dist`.
- Build duration reported by deployment timestamps: approximately 8.8 seconds.
- This was a direct source upload, not a Git-triggered build. Git auto-deployment is not configured.
- The domain is a Vercel subdomain; no paid custom-domain purchase was made.

## Backend and credentials

The existing PROTO-STAR Supabase project remains the backend. Vercel contains only the public URL and publishable client key needed by the browser. Gemini credentials remain encrypted on Supabase; the existing protected narration function is not moved to Vercel. No database migration was needed for this deployment.

## Production Auth configuration

The deployment is public and the synthetic preview works without an account. Existing password login uses the same Supabase project. Before relying on hosted signup-confirmation links, configure the following in PROTO-STAR's Authentication > URL Configuration:

- Site URL: `https://protostar-campus.vercel.app`
- Add redirect URL: `https://protostar-campus.vercel.app/`
- Preserve the local development redirect if the team still uses it.

The frontend requests its current origin for email confirmation. Supabase must allow that origin; otherwise it can fall back to the configured Site URL. The connector available in this session does not expose Auth URL configuration, so these settings have not been changed or verified. Production SMTP/email delivery also remains an account configuration requirement. Do not publish broad wildcard redirects unnecessarily.

## Verification and monitoring

Local checks: 40 tests passed, production build passed, and Git whitespace validation passed. Presentation PDFs were generated and visually reviewed. Hosted login and synthetic role previews were checked in the browser; detailed observations are recorded below after verification.

Vercel reported the production deployment and stable alias ready. Build-log retrieval returned a connector-scope 403; no authenticated CLI was installed to provide that fallback. No log drains are configured. Browser checks do not establish production observability or complete private staff backends. Faculty/recruiter remain synthetic previews, with live access integration still pending.

## Future updates

The local `vercel.json` preserves build settings. Deploy the reviewed source again with the Vercel connector, or connect the GitHub repository in the project's dashboard and choose the intended production branch (`codex`) after verifying repository access. Until that integration exists, a Git push only updates the repository.

Keep `.env.local` and `.vercel/` out of Git. Never add Gemini or service-role keys to public Vite configuration. This frontend release does not apply Supabase migrations automatically.

### Hosted browser observations

- Login loads with Porto-Star branding and all three role choices.
- Public student preview loads Aaman from Supabase, score 77, review index 25%, and LMS 89.
- Faculty preview loads 500 students, 193 review prompts, mean 72.6 and academic/career groups 147/89.
- Recruiter preview loads 374 professional candidates and 250 profiles with recorded projects.
- No real account was created or signed in during these hosted checks.

Latest release also includes the report redesign, six-control coupled simulator, recruiter multi-select and faculty subject sorting documented in `IMPROVEMENT_MODULE_03.md`.
