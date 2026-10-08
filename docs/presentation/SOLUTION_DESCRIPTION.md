# Porto-Star - Solution Description

Round-1 presentation reference | 8 October 2026

## Solution structure

The intended cycle is evidence, analysis, explanation, action, and updated progress. Porto-Star implements the dashboard/analysis portions with a synthetic cohort and protected individual student persistence. Institutional integration is explicitly separate from the public demonstration.

The Vite browser application has reusable components, role pages, state handlers, and service modules. It reads authorized records from Supabase. PostgreSQL stores identity-linked profiles, portfolio/goal data, measurements, catalogs, and the public synthetic workspace. RLS protects private records. A protected Edge Function supplies optional narrative wording. Browser-side PDF generation combines calculations and explanation into a report.

## Student workflow

A student creates an email/password account and begins with empty evidence. Missing measurements are marked unavailable, not copied from Aaman. Students maintain their own education, profile, portfolio, and goals. Subject analysis separates records by subject and semester. Skills and target-role exploration use broader catalogs and custom directions when necessary.

The overview places the success score, review index, and LMS information at the top. Source and trend views retain original units. The student can inspect contributions, identify an improvement area, request readable English, and generate a report. The current simulator is a basic illustrative comparison, not the requested richer model linking effort to CGPA.

## Faculty workflow

The faculty demo summarizes 500 students, complete-score averages, unique students needing review, academic/career groups, and segments. Filters narrow cohorts; the queue can focus on triggered checks and open individual evidence. Subject analysis helps faculty identify shared learning gaps. PDF export respects the selected cohort and provides a class summary plus student ledger.

The preview has a local support-action workflow. Real campus use still requires verified faculty-to-cohort assignments, scoped server queries, persistent interventions, and student-raised doubt tickets. Faculty is a required product role, not an unrestricted administrator.

## Recruiter workflow

Discovery uses a separate professional projection with education/skill/role filters, sorting, details, comparisons, shortlists, and role requirements. Introduction requests remain unsent local drafts. Faculty notes and internal review measurements are excluded from the projection.

Production sharing must become server-enforced consent with revocation and mediated contact. The interface demonstrates the intended boundaries; it is not evidence of completed live recruiter access.

## Mathematical score and worked example

The demo applies four equal normalized contributions: CGPA/10 times 25; attendance/100 times 25; LMS marks/100 times 25; coding/100 times 25. The sum is bounded to a 100-point scale for legal inputs.

For Aaman, CGPA 8.2 contributes 20.50, attendance 89 contributes 22.25, LMS 89 contributes 22.25, and coding 48 contributes 12.00. Total: 77.00/100. The card's information dialog shows these contributions. A higher index describes stronger measured standing under these particular rules; it does not guarantee academic or hiring success.

Inputs are checked for finite values and legal ranges. All four inputs and an applicable configured policy are required for a full score. Missing data does not become zero. The math is shared between browser and server code. Account managers can edit the synthetic demo policy; real accounts require institution-approved rules. Unverified portfolio claims do not silently gain points.

## Combined review factor and interpretation

Demo checks trigger below CGPA 6/10, attendance 75%, LMS 50/100, or coding 50/100. Equality does not trigger a check. The first three are academic signals; coding is a career-practice signal.

Combined review index = triggered checks divided by assessed checks, times 100. Aaman has one of four checks triggered, giving 25%. The full statement identifies coding practice as the area to review and encourages a focused faculty discussion. It is not a 25% probability of failure or placement rejection. Missing measurements reduce coverage, not performance.

Overall faculty counts include each student once even when both academic and career checks trigger. Segments identify combinations such as strong academic standing and a coding-practice gap. These assist human conversations rather than automatically rejecting or diagnosing students.

## Gemini and deterministic fallback

Gemini changes representation, not mathematics. The server supplies already-computed facts and requests short supportive English. No name/contact information is sent. The function verifies the session, checks the canonical student role, and loads only the current student's measurements. It accepts neither an arbitrary student ID nor an open-ended chat prompt.

The provider key is encrypted in Supabase Vault and available only to protected server code. Timeouts, provider errors, malformed output, and unsuitable numeric wording use deterministic fallback. Public preview uses one cached synthetic explanation instead of invoking the model for every visitor. Per-instance cache/rate controls exist; a distributed quota remains a production requirement. This is a constrained explanation feature, not yet a general chatbot.

## PDF reporting

Student reports include readable interpretation, evidence bars, review reasons, calculation contributions, subject records, portfolio counts, and limitations. Faculty reports include cohort metrics/segments and a paginated student ledger. The sample student report is two pages; the current full 500-record class report is 72 pages. Filtering narrows exports.

All report numbers come from measurements and deterministic algorithms. AI wording cannot overwrite them. The report stays useful if Gemini fails because fallback language explains measured progress and gaps.

## Demo data design

The cohort retains five named fixtures and generates 495 additional records with a seeded normal generator. A shared latent ability component introduces correlation between measures, after which legal-range clamping and rounding are applied. Courses, years, semesters, and batches vary for realistic filter testing. The resulting distribution is not an exact unconstrained Gaussian and is not validated institutional data.

The JSON format documents education, measurements, subjects, skills, engagement, placement preparation, and target role. Demo IDs are not Auth identities. An authorized management page provides a template and disabled upload placeholder. Future ingestion must reconcile identity, source provenance, permissions, and row errors before writing live records.

## Validation and remaining boundaries

Tests cover deterministic arithmetic, missing inputs, threshold boundaries, overlapping review groups, unique synthetic IDs, projection privacy, provider fallback, and existing flows. Database checks exercise ownership and manager/secret denial paths. Build and browser checks support the preview. Actual signed-in narration and browser download capture remain separately unverified from the preceding checkpoint.

The next backend modules should complete authorized staff access, consent projections, reviewed source imports, and persistent support. The architecture supports these additions without replacing the Round-1 stack.
