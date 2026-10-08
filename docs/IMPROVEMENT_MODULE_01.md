# Improvement module 1 — catalogs, subject analysis and filters

Ready for team review. This checkpoint follows the requested module-by-module workflow; the full improvement list is not finished.

## Delivered

- Removed the student overview next-step panel, portal exploration cards, growth focus chooser, and faculty/recruiter exploration cards. The weekly goal editor remains in My Growth.
- Database-backed catalog: 40 career templates across technology, engineering, business, health, arts, law and education. Their sample competencies are organizing aids, not official hiring requirements. Students can also enter a custom career direction without inheriting another role's competency list.
- Degree/course suggestions, free-form custom entries, batch name/number, years 1–10 and semesters 1–20. Values persist to the signed-in student's own Supabase record. Existing fresh accounts remain empty.
- Student Subject Analysis: semester/search filters, marks bars, percentage mean, highest recorded subject and a ledger with attendance/credit availability. No inferred GPA or invented marks. Existing three demo measurements are stored in Supabase; real accounts begin with no subject records.
- Faculty overview cohort selection and expanded subject choices. Unrecorded subjects show No data. Historical trend remains explicitly the all-sample-cohort trend because per-cohort historical records do not exist.
- Recruiter combined filters for skills, target career, course, degree, year, semester, batch and project presence; sorting by name, project count or matching required skills; reset and result counts. Withheld education never matches an education filter. Recruiter and faculty data are still synthetic previews, pending live authorized services.

## Validation

31 automated tests passed, production build passed. Supabase rollback verification passed self-only education writes, custom career/education fields, denied subject writes, denied cross-account access, staff approval protection, manager-only directory and public read-only catalog. No test accounts persisted. Browser checks covered recruiter no-match/reset and student navigation, live subject search, and mobile layout. Security advisor identified leaked-password protection disabled in Auth; no new RLS warning was reported.

## Remaining modules

| Feature | Status |
|---|---|
| Projects/Achievements tab, structured evidence upload, faculty verification | Pending |
| Student doubts, faculty resolve-only workflow and category filters | Pending |
| LMS score/class rank and verified achievement/project leaderboard | Pending rubric review and assignment/cohort data model |
| Effort allocation simulator, interactions and CGPA result table | Pending assumption review |
| Student/faculty/recruiter profile photos | Pending |
| Student PDF and class/student faculty PDF reports | Pending |
| Gemini chatbot and readable reports | Provider agreed; server integration pending |
| Live faculty/recruiter database services | Pending cohort assignment and consent enforcement |

## Proposed analytics assumptions for the next review

The user selected simple math based on marks, projects, achievements, hackathons and LMS assignments. GitHub repository/commit counts describe activity; they are not measures of project quality and do not prove authorship. Only faculty-verified evidence should enter a scored leaderboard. Pending/rejected evidence stays visible with its status and contributes no verified points.

For LMS, propose earned assignment marks / available assignment marks × 100, compared within the same course, batch, semester and assignment set. Missing submissions need an explicit campus rule before being treated as zero; until then report completeness and avoid ranking incomparable students. Equal scores receive equal rank. Keep LMS marks and verified evidence counts separate until the team approves category weights and caps for a combined score.

For the illustrative simulator, propose a user-selected weekly effort budget divided among subject study, LMS work, skill practice, projects and competitions. More effort in an already strong area should produce smaller modeled gains; allocating effort away from an area can reduce its modeled result. LMS and subject preparation can overlap, projects and skills can overlap, and all allocations must share one budget. Show baseline, scenario and difference in a result table plus the assumptions used. Do not imply verified achievements are guaranteed by effort. Any CGPA conversion must be clearly hypothetical until institutional grade/credit rules are supplied; no placement probability can be claimed from this illustration. The new model has not been implemented: assumptions and numerical coefficients require review first, as requested.

Gemini will run through a Supabase server function with a server secret. Never put its API key in Vite configuration or browser JavaScript. AI explanations must use authorized measurements and identify missing evidence; deterministic calculations remain outside the model. No new external AI requests are sent by this module.
