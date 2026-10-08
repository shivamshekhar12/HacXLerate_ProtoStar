# Student frontend — Review set 02

## Current user direction

Prioritize the frontend and defer Supabase, backend, and integration work until the interface is ready. Keep the stack and modular implementation from the project specifications. Complete a coherent set, then pause for the team's review before continuing.

## Main-page reference

Use `student_overview_hierarchy_optimized_smart_campus_ai/code.html`, preserved at `docs/reference/optimized-overview.html`.

Its supplied `screen.png` contains `<FIFE Image failed to fetch>` instead of image data. The HTML provides the intended section order and design tokens. The frontend adapts this structure rather than copying its fake sync claims, score weights, predictions, badges, or proposed legal/privacy guarantees.

Updated overview order:

1. Student context.
2. Your data at a glance, followed by Growth Momentum (side by side on desktop, stacked on mobile).
3. Seven domain indicators.
4. Suggested next action.
5. Specific areas to strengthen.
6. Evidence explanations.
7. Analytics transparency and career direction.
8. Navigation cards for the four other student pages.

## Five student pages

| Page | Frontend behavior |
| --- | --- |
| Overview | Graph metric controls, evidence dialogs, next-action links, advisor information dialog |
| My Growth | Historical chart and records; local weekly goal editing, completion, and reopening |
| Skills / Target Role | Three sample roles; requirement/evidence comparison; searchable and filterable skills; validated skill add/edit |
| What-If Simulator | Attendance, coding assessment, and LMS sliders; baseline/scenario deltas; reset; immutable source measurements |
| Profile & Consent | Basic profile editing; project add/edit; local sharing preferences; professional-field preview |

Historical charts and source measurements are synthetic fixtures. Goals and profile/portfolio edits are stored locally under versioned demo keys. Source measurements remain the original baseline; edits are reflected in profile/skills views and portfolio counts. A local storage failure keeps the interaction usable for the session and announces the limitation.

Consent settings control a visual preview only. There is no authentication, real recruiter access, data-layer authorization, external messaging, appointment booking, or backend persistence. The advisor dialog presents sample information and routes back to the student's goal.

Experience and achievement sections currently display honest empty states. Their entry workflows, faculty/recruiter pages, and full scoring remain outstanding.

## Validation

- Production build passed.
- Seven Node tests passed: fixture isolation/missing values, goal HTML escaping, goal storage fallback, immutable scenario deltas, scenario bounds, safe project URLs, and validated restoration that preserves fixture baselines.
- Browser: attendance chart selection; Git skill addition; skill search and empty evidence filter; target-role change; attendance scenario change and reset; profile save; project validation and persistence; local sharing enabled and projects excluded from preview.
- Project, target role, skills, and sharing preferences persisted after refresh.
- Desktop at 1280px: summary and graph inspected side by side.
- All five routes checked at 390px; document width matched viewport width. Tables scroll within their containers on narrow screens.
- Browser warning/error logs were empty at the tested checkpoint.

The review browser contains a synthetic Git skill and SQL practice project from the interaction checks. They are demo entries only.

## Next review sets

1. Team reviews this student frontend; apply requested changes.
2. Faculty frontend: cohort overview, student drilldown, analytics, and local support workflow.
3. Recruiter frontend: role requirements, safe candidate discovery/detail, shortlist and introduction-request drafts.
4. Finish frontend gaps and agree scoring/data rules.
5. Configure Supabase, Auth, schema and RLS; replace local fixtures through the service layer and validate allowed/denied access.
6. Connect analytics and complete end-to-end verification and submission material.

No backend setup is part of this review set. The earlier Module 01 roadmap is superseded by this sequencing.
