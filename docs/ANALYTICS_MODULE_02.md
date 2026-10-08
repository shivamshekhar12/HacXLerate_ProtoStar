# Analytics and readable reporting checkpoint

Reviewed all four pages of the supplied hackathon brief. The KPMG challenge requires unified academic, attendance, LMS, engagement, placement, skills and feedback evidence; a success score; academic/career risk flags; an interactive faculty/administrator dashboard; explanatory scoring notes and a short demo. Segmentation and visible score/risk drivers earn bonus credit. This module addresses the score, review flags, explanations, larger test population and report/demo presentation. Live source ingestion, staff cohort assignment, evidence verification and intervention messaging remain unfinished.

## Demonstration rubric, not predictive accuracy

The provisional demo rubric uses four normalized indicators with equal 25% weights:

`score = (CGPA / 10 × 25) + (attendance / 100 × 25) + (LMS assignment marks / 100 × 25) + (coding / 100 × 25)`.

All four are required. Missing/invalid inputs prevent a complete score. This is an explainable prototype index, not scientifically calibrated, college-approved, or a probability of academic/hiring success. Engagement, skills, projects and achievements remain contextual evidence: there is no agreed quality/verification rubric for adding their points. Account managers can edit weights and thresholds for the synthetic preview; real accounts do not inherit demo scoring policy.

Academic review checks: CGPA below 6/10, attendance below 75%, LMS marks below 50/100. Career-practice check: coding below 50/100. These are explicit demonstration assumptions, pending team/institutional review. Boundary equality is not flagged. Combined review index = triggered checks / assessed checks × 100. Display the indicator, flagged/assessed counts, explanation and specific improvement area together. Missing records stay missing. Risk flags are human-review aids, not diagnoses or failure probabilities; recruiters cannot see them.

Aaman: score 77/100, review index 25% (coding check), LMS 89/100. Full cohort: 500 synthetic students, mean score 72.6, 193 with one or more review flags; academic 147 and career 89 overlap. Segmentation counts are derived at runtime. Historic class graph retains its original five-record sample and is labelled accordingly.

## Gemini and fallback

The supplied key passed a small real provider request. It is encrypted in Supabase Vault under `smart_campus_gemini`, not present in browser code, Git, or migration literals. Only service-role server code can read it through the protected secret function. Supabase CLI secret setup was unavailable because CLI login was missing; Vault is the supported alternative. Optional `GEMINI_API_KEY` / `GEMINI_MODEL` server environment variables override Vault/default model configuration.

`describe-progress` is deployed with JWT verification and also verifies the user with getUser, reads the canonical student role and only that user's source measurements under RLS. It accepts no arbitrary student ID or user prompt. Gemini receives numeric source facts without names/contact information. Numerical analysis is shared deterministic JavaScript. The model writes short English only; malformed, numeric, oversized, timed-out, rejected or unavailable responses fall back to local wording. Public preview uses one pre-generated synthetic explanation and sends no Gemini request per visitor. Per-instance caching reduces repeat requests; a distributed quota would be needed for a large public production deployment.

Real signed-in Edge Function narration has not been exercised with an actual student login in this review. Provider invocation, public rejection, database secret denial, and local fallback are checked separately.

## Reports and data management

Student and faculty PDF buttons generate files locally with jsPDF loaded on demand. Reports include English interpretation, visual bars, evidence, calculation method and limitations. The student sample is two pages. The full 500-student faculty sample is 72 pages and has a class overview followed by paginated student records; filtering the faculty cohort before export narrows it. Source/generated numbers are independent of AI wording. Empty accounts remain readable without fabricated data.

Example data and upload placeholder are in the existing protected account-manager page, along with an editable demo-rule form. Actual import is deliberately disabled: the user requested the structure for now. See `docs/data/STUDENT_DATA_FORMAT.md`.

Validation: 36 automated tests and production build; real Supabase permission tests; successful Gemini provider requests; browser score-info modal, cached narration, 500-student paging and search checks. PDF files were generated, parsed and visually reviewed. The browser automation download event could not be captured, so file generation is verified separately rather than claiming a confirmed browser download. Auth's existing leaked-password-protection warning remains; no new RLS/secret exposure advisory was returned.

API implementation reference: [Gemini Generate Content](https://ai.google.dev/api/generate-content), [Supabase Vault](https://supabase.com/docs/guides/database/vault). Auth advisory: [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
