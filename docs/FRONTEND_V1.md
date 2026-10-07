# Complete role frontend — V1 review checkpoint

## Scope

The app now provides Student, Faculty, and Recruiter workspaces through the header's Workspace preview selector. This selector is a demo navigation control, not an authenticated role or authorization mechanism.

The current user request supersedes the earlier plan to pause after each remaining role: both faculty and recruiter frontends are included in this set. Backend, Supabase, and real integrations remain deferred.

## Page map

| Workspace | Pages / route patterns |
| --- | --- |
| Student | `overview`, `growth`, `skills`, `simulator`, `profile` |
| Faculty | `faculty`, `faculty/students`, `faculty/student/:id`, `faculty/insights`, `faculty/subjects`, `faculty/support` |
| Recruiter | `recruiter`, `recruiter/talent`, `recruiter/candidate/:id`, `recruiter/roles`, `recruiter/shortlist`, `recruiter/requests` |

The faculty and recruiter layouts follow the headings and structure of the supplied Stitch HTML designs, using the shared white/blue/lavender theme. Student overview keeps the optimized hierarchy approved in the preceding set.

## Implemented flows

### Faculty

- Assigned synthetic cohort overview with descriptive counts, mean CGPA, historical sample chart, and review prompts.
- Composable student search, cohort filter, and review-only filter.
- Student drilldown with academic, attendance, learning-module and coding evidence, skills, subject marks, source availability, and local support history.
- Cohort insights with missing recorded skill counts, mean attendance, and explicit methodology.
- Subject selection, sample mark comparison, and subject ledger.
- Validated support-action entry, optional follow-up date, action completion/reopening, status filter, and browser persistence.

Review prompts are deliberately curated sample records for human review. There is no predictive risk model, diagnosis, automatic intervention, or arbitrary threshold.

### Recruiter

- Talent overview with role requirements, professional candidates, shortlist and draft counts.
- Candidate discovery with text search, skill filter, and target-role filter.
- Professional candidate detail with required-skill comparison, projects, achievements, and sharing caveats.
- Role requirement editing, comma-separated required/preferred skill parsing, case-insensitive deduplication, validation, and persistence.
- Shortlist add/remove, visible-candidate selection, and up to three profiles in a comparison table.
- Introduction draft creation, duplicate-draft prevention, persisted drafts, withdrawal, and status filters. Nothing is sent externally.

Recruiter professional fixtures are separate from faculty records. The current student's demo entry is projected only when their sharing preview is enabled, and education/skills/projects respect their local selected fields. Hidden faculty notes, internal measurements and private contact details are not in the recruiter view model.

### Student completion details

- Added validated, persistent experience and achievement/certification entry and edit forms.
- Preserved chart controls, weekly goals, skills, profile/project editing, immutable what-if comparisons, and granular sharing preview.
- Role-context navigation, mobile controls, dynamic account labels, and active navigation for detail pages.
- Shared empty states, error feedback, native dialogs, keyboard focus, status announcements, and safe escaping of user-entered text.

## Validation evidence

- `npm run build`: passed.
- `npm test`: 12 tests passed.
- Browser flows verified: faculty search -> drilldown -> support record -> completion -> persistence after refresh; recruiter role edit -> search -> shortlist -> profile -> introduction draft -> persistence; two candidates selected and displayed side by side; student achievement added and restored after refresh.
- All 17 route patterns loaded at 390px with document width equal to viewport width. Tables are contained in horizontal scroll regions.
- Faculty and recruiter overviews visually reviewed on desktop and mobile.
- Browser warning/error logs: empty at the final verification checkpoint.
- Screenshots: `docs/review/faculty-v1.png` and `docs/review/recruiter-v1.png`.

## Remaining backend and analytics work

This is the complete core V1 frontend scope, not the final working hackathon submission. The following are intentionally pending:

1. Supabase project selection and actual schema/migrations.
2. Authentication and trusted role provisioning; assigned cohort access and RLS.
3. Real persistence and query boundaries, including least-privilege recruiter projections.
4. Agreed Success Score indicators/weights and support-review thresholds, with missing-data handling and explanations.
5. Data-source ingestion/normalization and historic record updates.
6. Actual consent enforcement, mediated introduction requests and messaging, if included in the final institutional policy.
7. Real asynchronous loading/error behavior and end-to-end allowed/denied access tests.

The local demo storage is not a production database or security boundary. Sample certificates, support records, and introduction drafts created during verification are synthetic entries in the review browser. No personal data has been sent to another service.

The actual scoring calculation remains undecided under TECHNICAL_SPEC. The frontend shows raw measurements and explicit skill comparisons; it does not adopt illustrative Stitch weighting formulas or claim live data integration.
