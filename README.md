# Porto-Star

**Explainable student success and career-readiness intelligence for campuses.**

Porto-Star turns scattered student evidence into clear academic and career insight. Students see where they stand, faculty see who may need support and why, and recruiters see professional evidence through a separate, limited view.

> Built for **HacXLerate 2026, Round 1** (KPMG in India: *Smart Campus Analytics: Predict, Optimize & Improve Student Success*).
> All data in this demo is **synthetic**. Scores are illustrative, not validated predictions.

---

## 1. Project Summary

### The problem
Colleges hold student data in separate systems: marks, attendance, LMS activity, placement tests, skills, engagement and feedback. Each source answers a different question, and no one sees the whole picture.

- A student may have strong grades but weak career practice, and a single measure hides that.
- Dashboards often show many numbers without saying what caused a flag or what to do next.
- Faculty need to tell academic concerns from career-practice concerns.
- Recruiters need professional evidence without private support information.

### Why we chose it
- It connects data to a practical decision: **who needs support, why, and what kind**.
- Three user groups (students, faculty, recruiters) have clear needs and different access boundaries.
- It makes responsible design concrete: visible formulas, missing-data handling, consent, and human judgment.
- It can be demonstrated honestly with synthetic data.

### Problems the prototype addresses
| # | Problem | How the prototype responds |
|---|---|---|
| 1 | Fragmented evidence | Source-aware student and faculty views bring seven data categories into one interface |
| 2 | Unexplained scores | Score cards show indicator contributions, hover explanations and a calculation dialog |
| 3 | Unclear priorities | A review index comes with reasons and specific areas to discuss or practice |
| 4 | Limited cohort visibility | Faculty can filter and inspect 500 students, review groups and segments |
| 5 | Hard-to-read reports | Downloadable reports with plain-English interpretation, bars, method notes and limitations |
| 6 | Privacy conflicts | Recruiter discovery uses a separate professional projection |
| 7 | Confusing onboarding | A new student starts empty; the public Aaman preview is a separate demo path |

### Tech stack and why
| Tool | Why we used it |
|---|---|
| **Vite + HTML + CSS + vanilla JavaScript** | Small modular runtime, fast iteration, logic that is easy to inspect, no extra framework |
| **Supabase PostgreSQL** | Structured persistence and migrations |
| **Supabase Auth** | Email/password identities |
| **Row Level Security (RLS)** | Database-enforced ownership, instead of trusting a selected UI role |
| **Supabase Edge Functions + Vault** | Keep the Gemini API key and provider calls server-side |
| **Gemini** | Short English explanations of already-computed evidence only; deterministic fallback if unavailable |
| **jsPDF** | Local downloadable vector PDF reports, loaded on demand |
| **Vercel** | Builds and hosts the frontend over HTTPS |
| **Node test runner** | Tests for calculation and service behavior |
| **GitHub** | History and collaboration |
| **Codex + Stitch designs** | Implementation help and interface guidance, with human review after each module |

---

## 2. Solution Description

### How it works
```text
Student evidence (academics, attendance, LMS, engagement, placement practice, skills, feedback)
        ↓
Unified student record
        ↓
Deterministic calculation (no AI involved)
        ↓
Success Score + Review Index + Segment
        ↓
Readable explanation (AI optional, with fallback sentences)
        ↓
Role-based views: Student, Faculty, Recruiter, PDF report
```

### Success Score
`Success score = sum of (normalised indicator × weight)`

| Indicator | Weight | Flag when below |
|---|---:|---|
| CGPA | 25% | 6 / 10 |
| Attendance | 25% | 75 / 100 |
| LMS assignment marks | 25% | 50 / 100 |
| Coding assessment | 25% | 50 / 100 |

### Review Index
`Review index = flagged checks / assessed checks`

Example: Aaman Sharma has a Success Score of **77/100**. One of four checks (coding, 48) is flagged, so his review index is **25%**.

The review index is a fraction of checks. **It is not a failure probability.**

### Segments
- No current flags
- Academic support suggested
- Career practice suggested
- Strong academics, career practice needed

### Views
- **Student:** own standing, score contributions, improvement areas, calculation dialog.
- **Faculty:** cohort counts, filters, segments, priority review list, student drill-down.
- **Recruiter:** professional projection only. Private risk indices, faculty comments and support records are never included. Live consent-based access is not finished; the current view is a preview.
- **Reports:** downloadable PDF with summary, segments, department review load, priority list and method notes.

### Design principles
- Numbers come from algorithms. AI only words the explanation.
- The app must work if the AI service is down.
- A flag is a prompt for human review, not a judgment about a student.

### Current results (synthetic, 500 students)
| Metric | Value |
|---|---:|
| Students scored | 500 |
| Mean success score | 72.6 / 100 |
| Students needing review (at least one check) | 193 (38.6%) |
| Academic flags | 147 |
| Career-practice flags | 89 |
| Priority list (2 or more flags) | 56 |

Academic and career groups overlap and must not be added as distinct people.

### Evidence from the latest checkpoint
36 automated tests, a production build, database access checks, provider/fallback checks and visual review of generated reports all passed. Actual signed-in AI narration and browser download capture were **not** confirmed.

---

## 3. Other Information: Major Remaining Problems and Proposed Solutions

A demo and a trusted campus system have different requirements. The solutions below are **proposals, not completed features**.

| # | Problem | Proposed solution |
|---|---|---|
| 1 | **Disconnected, inconsistent data** (different IDs, scales, update schedules) | Authorized import with identity reconciliation, ranges/units, source IDs, timestamps, deduplication and row-level error reports. Start with reviewed JSON/CSV batches before live connectors. |
| 2 | **Unvalidated scoring and risk rules** (equal weights and thresholds are assumptions) | Faculty-approved, course-specific indicators and weights. Version the rules. Validate against consented historical outcomes using time-separated holdouts and subgroup checks. Keep calling it an index until evidence supports more. |
| 3 | **Unverified projects and achievements** | Structured submissions, private evidence storage, faculty review, pending/verified/rejected status, reviewer and timestamp record, appeal path. Only approved rubrics convert evidence into points. |
| 4 | **Faculty authorization and student support** | Faculty-to-cohort/subject assignments with RLS-scoped queries. Student-owned support tickets with faculty responses and history, kept separate from recruiter views. |
| 5 | **Consent and recruiter access** | Server-enforced minimal projection, explicit field consent, revocation, recruiter approval and mediated contact. Test denied access as carefully as permitted reads. |
| 6 | **Meaningful effort simulation** (sliders do not prove causation) | Illustrative model with fixed effort budget, mastery, credit weights and diminishing returns. Keep simulated outcomes separate from verified marks. |
| 7 | **AI trust, availability and cost** | Keep code-based calculations, constrained wording and fallback sentences. Add a distributed quota and audit metadata without private prompt logs. |
| 8 | **Account and operational readiness** | Staff provisioning, production Auth origins and SMTP, recovery, role revocation, error monitoring without private data, documented backups and rollback. Review the Supabase leaked-password-protection advisory. |
| 9 | **Inclusive UX and complete profiles** | Broad course catalogs plus custom values, keyboard/screen-reader checks, concise report summaries and cohort filtering before large exports. |

### Recommended rollout
1. Verify hosted confirmation emails and real signed-in AI narration.
2. Complete staff and consent-based access.
3. Implement reviewed source imports and evidence verification.
4. Add student doubts, persistent interventions and the richer simulator.
5. Validate an institutional scoring policy, outcomes, fairness and reliability before broad adoption.

Each module should produce a visible result, successful and denied-path checks, and a team review.

---

## 4. Limitations and Honest Claims

**We claim:** Porto-Star demonstrates evidence, explanation and a practical review action in one product.

**We do not claim:**
- increased placement rates
- prediction of individual failure
- completed integration with any college system
- validated weights or thresholds
- any institutional partnership or judging result

Not yet built: live faculty/recruiter queries, source imports, evidence verification, student doubts and the richer effort simulator.

---

## 5. Getting Started

> Commands below assume a standard Vite project. Adjust names to match `package.json`.

```bash
git clone <your-repo-url>
cd porto-star
npm install
npm run dev      # start local dev server
npm test         # run the Node test suite
npm run build    # production build
```

Environment variables (never commit secrets):
```text
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
The Gemini key lives in Supabase Vault and is used only by the Edge Function, never in frontend code.

---

## 6. Privacy and Responsible Use
- Demo data is synthetic. Do not load real student data into the public demo.
- Risk indices are decision support for human review, not punishment, public ranking or permanent labels.
- Confirm source data before intervening on any flag.

---

## 7. Presentation Script (3 minutes)

**Title:** "We are presenting Porto-Star. It turns scattered student data into clear, explainable support for students, faculty and recruiters."

**Summary:** "Colleges keep marks, attendance, LMS, placement and skills data in separate places, so nobody sees the full picture. We chose this because it connects data to a real decision: who needs support, why, and what kind. We built it with vanilla JavaScript and Vite, Supabase for data, login and security, Gemini only for wording, jsPDF for reports and Vercel for hosting."

**Solution:** "We unify 500 synthetic students. The Success Score combines CGPA, attendance, LMS marks and coding, 25% each. The review index is the share of flagged checks. Aaman scores 77, with one of four checks flagged, so 25%. Faculty can filter and see segments. Recruiters see only a separate professional view. Every score shows how it was calculated."

**Other information:** "This is a prototype. Weights are not validated, live imports are not built, and faculty authorization and evidence verification are next. The score is a support index, not a failure prediction."

**Close:** "Porto-Star shows who may need support, why, and what help to consider. Thank you."

---

## 8. Project Documents
- `analysis.md`: product, market and research analysis
- `plan.md`: execution plan
- Challenge: KPMG in India, *Smart Campus Analytics*

## 9. Team and License
- Team: *add names*
- License: *owners to choose explicitly. No license is claimed here.*
