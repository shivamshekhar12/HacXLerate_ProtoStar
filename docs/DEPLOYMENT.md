# Porto-Star deployment

Deployed on 8 October 2026 with the Vercel plugin from the current local source snapshot.

- Public production URL: https://protostar-campus.vercel.app
- Vercel project: `protostar-campus` (`prj_pqu3AnBZLx9notrmyCAsxEHgv5Jp`).
- Latest deployment: `dpl_HnfUzvb7JGytJ8RCLERxM33wueme`, reported `READY`.
- Framework: Vite. Node 22.x. Install `npm ci`; build `npm run build`; output `dist`.
- Build duration reported by deployment timestamps: approximately 7 seconds.
- This was a direct source upload, not a Git-triggered build. Git auto-deployment is not configured.
- The domain is a Vercel subdomain; no paid custom-domain purchase was made.

## Backend and credentials

The existing PROTO-STAR Supabase project remains the backend. Vercel contains only the public URL and publishable client key needed by the browser. Gemini credentials remain encrypted on Supabase; the existing protected narration function is not moved to Vercel. No database migration was needed for this deployment.

## Production Auth configuration

The deployment is public and the synthetic preview works without an account. Existing password login uses the same Supabase project. On 8 October 2026, the hosted Auth configuration was corrected in PROTO-STAR's Authentication > URL Configuration:

- Site URL: `https://protostar-campus.vercel.app` (previously `http://localhost:3000`).
- Allowed redirect URL: `https://protostar-campus.vercel.app/` (the previous allow list was empty).

Both values persisted after dashboard reload. The frontend already requests this exact production root from the deployed origin; no runtime-code change or Vercel redeployment was required. A production signup regression test asserts the requested destination excludes localhost and the SPA routing hash. All 50 tests passed.

A deliberately invalid confirmation token produced HTTP 303 with a Location on the production domain and the expected `otp_expired` error. A second invalid-token check requesting the old localhost destination also fell back to production. These checks verify the live redirect destination without creating/changing an account; it is not a successful real-user email-confirmation test. Previously issued emails can contain their original redirect target: request a fresh confirmation email if an old link still points to localhost. Production SMTP/email delivery remains a separate configuration concern.

Saved settings evidence: `docs/review/auth-production-redirect.png`. No wildcard redirect, account permission, password policy or email-confirmation requirement was added or weakened.

## Verification and monitoring

Local checks: 51 tests passed, production build passed, and Git whitespace validation passed. Presentation PDFs were generated and visually reviewed. Hosted login and synthetic role previews were checked in the browser; detailed observations are recorded below after verification.

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

Latest audit release corrects missing-data handling, faculty curriculum/coverage, analytics policy validation, English fallbacks and empty-account reports. See [audit evidence and limits](AUDIT_2026_10_08.md). Supabase `describe-progress` was separately redeployed with the shared analytics corrections.

Email delivery checkpoint: confirmation-email quota errors now have accurate copy. Custom SMTP is still disabled and requires a provider; see [delivery evidence and required setup](AUTH_EMAIL_DELIVERY.md).

Google security checkpoint: homepage ownership is verified through its HTML meta tag, and an owner review was submitted after clarifying the prototype identity and account-password wording. Google's deceptive-page warning has not yet been cleared. See [findings and review evidence](GOOGLE_SAFE_BROWSING.md).
