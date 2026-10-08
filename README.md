# Porto-Star

**Explainable academic and career intelligence for students, faculty, and recruiters.**

Porto-Star is a Round-1 prototype for the Smart Campus Analytics hackathon problem. It brings academic, attendance, LMS, engagement, placement, skills, and feedback evidence into a common interface, calculates understandable indicators, and helps users identify improvement areas.

The product name is **Porto-Star**; the deployment slug uses **protostar**. Existing package and repository identifiers are retained for compatibility.

## Try it

Use **Explore demo preview** on the login page. Aaman Sharma is the default synthetic student. The workspace selector opens Faculty and Recruiter previews. The dataset contains 500 synthetic students, not 500 registered users. Candidate discovery uses a separate professional projection.

See [deployment notes](docs/DEPLOYMENT.md) for the published address and verification.

## Problem and solution

Separate campus systems make it difficult to connect grades, participation, learning progress, and career preparation. Numbers alone rarely explain what a student should improve. Faculty need cohort patterns and understandable review reasons; recruiters need professional evidence without private support records.

Porto-Star combines source-aware dashboards, deterministic calculations, readable explanations, and role-specific views. Gemini rewrites existing evidence in English; it does not calculate scores or predict placements. Missing records remain missing. Protected accounts are separate from the public synthetic preview.

## Current implementation

| Area | Working now | Remaining work |
| --- | --- | --- |
| Accounts | Supabase login/signup, canonical role checks, empty new student workspace | Production email setup, recovery, complete staff provisioning |
| Student | Own profile/portfolio/goal persistence, overview, subjects, skills/roles, growth, basic what-if preview | Verified evidence uploads, student doubts, profile photos, improved effort model |
| Faculty | 500-record synthetic cohort, review queue/reasons, subject filters, local support workflow, class PDF | Authorized live cohort queries and persistent support workflow |
| Recruiter | Synthetic discovery, education/skill filters, roles, comparison, local shortlists, unsent drafts | Live consent projections and mediated contact requests |
| Analytics | Explainable demo score, combined review index, segmentation, missing-data rules | Institutional policy, source ingestion and outcome validation |
| AI/reports | Protected narration function, cached demo wording, fallback, student/class PDF generation | Actual signed-in narration verification and distributed quota |
| Management | Restricted directory, editable demo policy, JSON template | Validated imports; upload remains disabled |

Faculty/recruiter previews do not establish completed private staff backends. Demo edits, support actions, shortlists, and drafts may use browser storage. No introductions are sent externally.

## Explainable analytics

The **illustrative demo rubric** uses equal weights:

```text
success score = 25 × CGPA/10 + 25 × attendance/100
              + 25 × LMS assignment marks/100 + 25 × coding assessment/100
```

All four valid measurements are required. Combined review index = `triggered checks / assessed checks × 100`; this is a review aid, not a failure probability. Demo thresholds are CGPA below 6/10, attendance below 75%, LMS below 50/100, and coding below 50/100. Equality does not trigger a check. Specific reasons and score contributions are shown in the interface.

Real accounts require institutional rules; they do not inherit the demo policy. Unverified projects and achievements do not receive invented points. LMS ranking describes the available demo class subset, not an official institutional rank. The score is not a validated predictor of academic or hiring outcomes.

## Stack and tools

| Technology | Purpose and reason |
| --- | --- |
| Vite, HTML, CSS, vanilla JavaScript | Small modular browser runtime and quick iteration |
| Supabase Auth and PostgreSQL | Managed identities and structured student persistence |
| Row Level Security | Ownership and least-privilege access at the database boundary |
| Supabase Edge Functions and Vault | Server-side narration and encrypted provider credentials |
| Gemini | English representation of existing facts, with deterministic fallback |
| jsPDF | Local vector PDF generation, loaded on demand |
| Vercel | HTTPS frontend hosting; Supabase remains the backend |
| Node test runner | Deterministic calculations and regression checks |
| GitHub, Codex, Stitch references | Version control, development assistance, supplied visual direction |

Fonts and icons are bundled locally. Python is only an offline document-preparation tool, not a production backend. The architecture deliberately avoids another framework or server.

## Run locally

Use Node.js 22.23.1 or a compatible modern version. Vercel is configured for Node 22.x.

```sh
npm ci
cp .env.example .env.local
# Fill the public Supabase URL and publishable key.
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. Routes use hashes, such as `/#/login` and `/#/overview`.

```sh
npm test
npm run build
npm run preview
npm run supabase:check
```

The connection check does not apply migrations. There is no configured lint command.

## Environment and deployment

The frontend requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. These are browser-public connection values. Never use a service-role key, Gemini key, or database password in a `VITE_` variable.

`vercel.json` defines Vite, `npm ci`, `npm run build`, and output `dist`. Configure Supabase Auth's Site URL and allowed redirects for the deployed origin before relying on email-confirmation links.

The existing Gemini function is deployed separately to Supabase. Server-only `GEMINI_API_KEY` and `GEMINI_MODEL` may override its protected Vault/default configuration. Keep the actual Vault secret out of Git. Migrations describe the database history, not a requirement to reapply them to an existing project.

## Data and privacy

- New students receive no Aaman/demo portfolio or measurements.
- Student reads/writes are scoped to authenticated identity. UI role selection does not grant a role.
- Account management is restricted to an authorized confirmed identity.
- Public ghost records are synthetic, without passwords or Auth identities.
- Recruiter fixtures omit private review metrics and support notes; live consent enforcement remains a backend requirement.
- Gemini receives measurement facts without names/contact details and cannot overwrite numerical analysis.

The seeded demo generator uses normal draws with a shared ability component, then clamps and rounds values. It retains five named fixtures and generates 495 additional records. This reproducible workload is not evidence of predictive accuracy. See [data format](docs/data/STUDENT_DATA_FORMAT.md). `scripts/generate-demo.mjs` writes files, not automatic database updates.

## Repository map

```text
src/app/              State, routing, interactions
src/components/       Reusable interface components
src/pages/            Role and authentication views
src/services/         Data access, analytics, narration, reports
src/styles/           Shared tokens and responsive CSS
supabase/migrations/  Schema and permissions history
supabase/functions/   Protected narration and shared mathematics
supabase/seeds/       Synthetic demo and catalogs
scripts/              Connection checks and offline generators
tests/               Automated checks
docs/                Setup, checkpoints, presentation references
output/pdf/           Reviewed report and presentation PDFs
```

## Detailed presentation material

- [Project summary](docs/presentation/PROJECT_SUMMARY.md): problems, motivation, scope, stack and reasons.
- [Solution description](docs/presentation/SOLUTION_DESCRIPTION.md): architecture, workflows, methods and example.
- [Other information](docs/presentation/OTHER_INFORMATION.md): remaining problems, proposed solutions and rollout.
- [Latest analytics checkpoint](docs/ANALYTICS_MODULE_02.md): implementation evidence and verification limits.
- [Student backend](docs/STUDENT_BACKEND.md), [Auth](docs/LOGIN_AUTH.md), [Supabase](docs/SUPABASE_INTEGRATION.md).

Earlier checkpoint documents are historical. The four root specifications describe product intent and operating constraints. The original brief and visual references are under `docs/reference/`.

## GitHub development

Repository: `Rudra-Sharma-432/HacXLerate`, branch `codex`.

```sh
git status
git add <reviewed-files>
git commit -m "Describe the change"
git push origin codex
```

Commit your changes before `git pull --rebase origin codex`. Keep credentials, `.env.local`, dependencies, and caches out of Git. A Git push does not automatically deploy Vercel until a Git integration and production branch are configured.

## Prototype limits

The current simulator is illustrative, without proven causal effort/CGPA relationships. The faculty history graph remains an explicitly labelled original five-student sample, not the history of all 500 records. Provider invocation, public rejection, local fallback, and database permissions were tested separately; actual signed-in narration still requires a real-account test. Reports were generated and visually reviewed; browser download capture was not confirmed at the preceding checkpoint.

No open-source license has been chosen. Add one after repository owners agree on reuse terms.
