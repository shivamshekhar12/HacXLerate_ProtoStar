# TECHNICAL_SPEC.md — Technical, Data, Security and Algorithm Specification

## 1. Purpose

This document is the implementation source of truth.

It defines the intended Round-1 architecture and engineering rules.

### Confidence labels

- **LOCKED** — architecture decision that must not be changed silently.
- **CANONICAL RULE** — behavior that implementation must satisfy.
- **CONCEPTUAL SCHEMA** — a planning model, not proof that the table/column already exists.
- **IMPLEMENTATION GUIDANCE** — preferred approach that may adapt to the actual repository.

Before changing the database, inspect actual migrations/schema.

---

# 2. Round-1 architecture — LOCKED

```text
Browser
  |
  +-- Vite
       |
       +-- HTML
       +-- CSS
       +-- Vanilla JavaScript
              |
              +-- UI/application logic
              +-- analytics/algorithm engine
              |
              v
          Supabase
          +-- Auth
          +-- PostgreSQL
          +-- RLS
          +-- Storage when required
```

No second application backend is required for Round 1.

No Python/FastAPI runtime is part of Round 1.

---

# 3. Important Python clarification

The project discussion included Python as an algorithm possibility, but the current Round-1 architecture is **pure JavaScript analytics**.

Therefore:

- Do not create a Python server for the application.
- Do not create FastAPI endpoints.
- Do not move analytics into Python merely because Python is convenient.
- If Python is explicitly requested for offline experimentation/research, keep it outside the production browser runtime.
- If the user later decides the production algorithm must run in Python, treat that as an explicit architecture change requiring updates to `AGENTS.md`, this file, deployment design, API/security, and the frontend data flow.

This prevents two competing architectures from entering the repository.

---

# 4. Frontend architecture

Suggested structure:

```text
src/
  main.js
  app/
    router.js
    app-state.js
    permissions.js

  pages/
    student/
    faculty/
    recruiter/

  components/
    navigation/
    forms/
    cards/
    tables/
    charts/
    feedback/

  services/
    supabase/
    analytics/

  analytics/
    normalize.js
    completeness.js
    readiness.js
    skill-gaps.js
    role-fit.js
    recommendations.js
    what-if.js
    explanations.js

  utils/
    validation.js
    formatting.js
    dates.js

  styles/
    tokens.css
    base.css
    components.css
    pages.css

supabase/
  migrations/
  seed/

tests/
  analytics/
  permissions/
  services/
```

This is a **target structure**, not a command to create empty folders.

Use the actual repository structure if one already exists.

---

# 5. Environment variables

A browser client may use the public Supabase project URL and public/anonymous client key appropriate to Supabase.

Never put in frontend code:

- service-role keys;
- DB passwords;
- privileged API keys;
- private credentials.

A common Vite convention is:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

The current integration uses a modern publishable key in `VITE_SUPABASE_PUBLISHABLE_KEY`; legacy anon JWTs are not accepted by the client configuration. See `docs/SUPABASE_INTEGRATION.md`.

Never invent real values.

---

# 6. Supabase architecture

Supabase provides:

- authentication;
- PostgreSQL persistence;
- RLS authorization;
- relational constraints;
- storage where required.

The browser should use the authenticated Supabase client for permitted operations.

Do not build a parallel REST/Express/FastAPI backend merely to proxy normal Supabase CRUD.

---

# 7. Database model — conceptual planning schema

**IMPORTANT:** The following are conceptual entities from the product model. They are **not claims that these exact tables/columns already exist**.

Before implementation:

1. inspect `supabase/migrations`;
2. inspect generated schema/types if present;
3. reconcile names and relationships;
4. only then write code/migrations.

## 7.1 Profile/identity

Concept:

```text
profiles
- id
- role
- display_name
- avatar_url
- created_at
- updated_at
```

`id` should correspond appropriately to authenticated identity according to the actual implementation.

Do not store passwords.

## 7.2 Student profile

Concept:

```text
students
- id
- profile_id
- program/cohort/education information
- career preferences/goals
- timestamps
```

Exact columns are TBD by canonical schema.

## 7.3 Faculty profile

Concept:

```text
faculty_profiles
- id
- profile_id
- department/institution metadata where required
- timestamps
```

## 7.4 Recruiter profile

Concept:

```text
recruiter_profiles
- id
- profile_id
- organization/company metadata
- timestamps
```

## 7.5 Student skills

Concept:

```text
student_skills
- student reference
- skill reference/name
- proficiency where supported
- evidence reference where supported
- timestamps
```

## 7.6 Projects

Concept:

```text
projects
- student reference
- title
- description
- technology/skills
- dates
- links where appropriate
- evidence/verification where supported
- timestamps
```

## 7.7 Experience

Concept:

```text
experience
- student reference
- organization
- role/title
- description
- dates
- skills/evidence
- timestamps
```

## 7.8 Achievements/certifications

Concept:

```text
achievements
- student reference
- type/title
- description
- date
- evidence where supported
- timestamps
```

## 7.9 Career goals

Concept:

```text
career_goals
- student reference
- target role/domain
- target skills/preferences
- priority where required
- timestamps
```

## 7.10 Role definitions

Concept:

```text
roles
role requirements
```

Role data may include:

- role title;
- description;
- required skills;
- preferred skills;
- experience expectations;
- education expectations.

Exact structure is TBD by actual schema.

## 7.11 Recruiter visibility/consent

Concept:

```text
recruiter visibility / consent records
```

The implementation must make denied visibility enforceable at the data layer.

## 7.12 Faculty support/notes

Concept:

```text
faculty support/intervention records
faculty-only notes where policy requires them
```

These records are highly protected.

---

# 8. Data relationships — conceptual

```text
auth.users
   |
   v
profiles
   |
   +--> students
   |      +--> skills
   |      +--> projects
   |      +--> experience
   |      +--> achievements
   |      +--> career goals
   |
   +--> faculty profiles
   |
   +--> recruiter profiles

roles
   |
   +--> role requirements

students
   |
   +--> recruiter visibility/consent
   +--> faculty support records
```

Actual FK names and cardinality must come from the real schema.

---

# 9. RLS — CANONICAL SECURITY RULE

RLS is not optional for protected data.

## Student

Generally:

- can read permitted own data;
- can create/update own editable records;
- can manage own recruiter visibility where product policy allows;
- cannot read/write another student's private records;
- cannot edit authorization fields.

## Faculty

Can access only authorized student/cohort data.

Do not give Faculty unrestricted database access just because the role is trusted.

## Recruiter

Can query only recruiter-safe, consent/visibility-authorized information.

Do not query a complete private student row and filter hidden fields in JavaScript.

## Default

When access is not explicitly allowed, deny it.

---

# 10. Authorization model

Conceptual matrix:

| Resource | Student | Faculty | Recruiter |
|---|---|---|---|
| Own editable profile | RW | — | — |
| Own career evidence | RW | Authorized R | Consent-limited R |
| Other student's private data | No | Authorized R | No |
| Faculty-only notes | No/explicit policy | Authorized | No |
| Recruiter-safe profile | Own/visibility control | Authorized R | Consent-limited R |
| Role definitions | R | R | R |
| Own analytics | R | — | — |
| Authorized student analytics | — | R | Recruiter-safe subset |
| Consent settings | Own | Policy-specific R | No |

This is a **policy model**, not SQL. Actual policies must be written against the real schema.

---

# 11. Supabase service layer

Prefer one configured client and domain services.

Conceptual:

```text
services/supabase/
  client.js
  auth.js
  students.js
  faculty.js
  recruiters.js
  skills.js
  projects.js
  roles.js
  consent.js
```

Components/pages should not scatter complex database queries throughout rendering code.

---

# 12. Data fetching

Prefer:

- select only needed columns;
- pagination for large collections;
- server/database filtering;
- explicit ownership/authorization;
- separate queries for separate domain needs.

Never download an entire institution's student dataset to the browser.

---

# 13. Error handling

Classify where practical:

- authentication;
- authorization;
- validation;
- network;
- database;
- not found;
- unexpected.

Do not display raw database errors to users.

Do not log secrets or unnecessary sensitive information.

---

# 14. Analytics engine — architecture

Analytics are pure JavaScript modules.

They should be independent from DOM rendering.

Conceptual:

```js
const result = calculateReadiness(normalizedData);
```

A result may contain:

```js
{
  score,
  band,
  components,
  strengths,
  gaps,
  recommendations,
  dataCompleteness,
  confidence,
  explanations
}
```

Do not assume these fields already exist in the repository; adapt to actual code.

---

# 15. Analytics pipeline

```text
authorized raw data
       ↓
validation
       ↓
normalization
       ↓
completeness
       ↓
component calculations
       ↓
explanations
       ↓
gaps
       ↓
recommendations
       ↓
final result
```

The pipeline must never use data the current user is not authorized to access.

---

# 16. Normalization

Before analytics:

1. validate types;
2. normalize missing values;
3. reject impossible values;
4. normalize skill identifiers/names;
5. map evidence consistently;
6. calculate completeness;
7. preserve useful provenance.

Do not automatically interpret:

```text
missing
=
zero
```

unless the metric explicitly defines that rule.

---

# 17. Data completeness

Conceptually:

```text
weighted completed expected fields
/
weighted expected fields
```

Return, where implemented:

- completeness value;
- missing sections;
- important missing evidence.

Completeness must not be confused with performance.

---

# 18. Readiness / Success Score

The score is an application indicator.

Potential dimensions:

- academic/performance;
- skills;
- project/experience evidence;
- achievements/certifications;
- career alignment;
- activity/progress;
- evidence quality;
- completeness.

### Critical rule

**Do not invent final weights.**

If the repository/project has not established exact weights, Codex must:

- locate an existing decision;
- use an explicitly approved configuration;
- or flag the missing decision.

Do not manufacture "scientific" weights.

---

# 19. Explainability

Important analytics should expose structured factors.

Concept:

```js
{
  factor,
  direction,
  magnitude,
  reason
}
```

The analytics layer supplies facts/reasons.

The UI converts them into human-readable presentation.

Avoid coupling the algorithm to page-specific wording.

---

# 20. Skill-gap analysis

Compare:

```text
target role requirements
        vs
student evidenced skills
```

Possible states:

- matched;
- partial;
- missing;
- unsupported/insufficient evidence.

Prioritize gaps by actual role importance and available evidence.

Do not treat every missing skill as equally important.

---

# 21. Role-fit algorithm

Conceptual pipeline:

```text
role requirements
      ↓
normalize requirements
      ↓
match skills/evidence
      ↓
evaluate relevant experience/projects
      ↓
evaluate applicable education constraints
      ↓
produce fit result
```

Output should explain:

- matched requirements;
- missing requirements;
- evidence;
- completeness;
- confidence/caveats.

Role fit is not a hiring prediction.

### Critical rule

Do not invent a percentage formula if the project has not approved one.

---

# 22. Recommendations

Recommendations should derive from:

- student goals;
- important gaps;
- evidence;
- role requirements;
- feasible next actions.

A recommendation should explain:

- action;
- reason;
- affected gap/goal;
- expected value where the model can support it.

Do not invent an "effort" or "impact" number just to make ranking possible.

If the repository has no approved ranking formula, use a simple deterministic ordering and document the basis.

---

# 23. What-if engine

What-if analysis must use a copy of the normalized state.

```text
real state
  ↓
clone
  ↓
apply hypothetical change
  ↓
recalculate
  ↓
compare baseline vs scenario
```

It must never mutate the real student record.

Return, where implemented:

- baseline;
- scenario;
- delta;
- changed factors;
- caveat.

---

# 24. Support/risk signals

Signals are review aids.

Conceptual result:

```js
{
  level,
  reasons,
  evidence,
  confidence
}
```

Never call a signal a diagnosis.

Never expose internal signals to recruiters.

Distinguish:

```text
algorithmic signal
≠
human review
≠
confirmed support/intervention
```

---

# 25. Analytics testing

Minimum cases:

### Normal
- complete profile;
- strong evidence;
- mixed evidence.

### Missing
- no projects;
- missing skills;
- missing goals;
- partially complete profile.

### Boundary
- empty arrays;
- duplicates;
- minimum/maximum values;
- invalid values.

### Explainability
A meaningful input change changes the relevant explanation.

### What-if
Real state is unchanged.

### Privacy
Unauthorized data never enters the calculation.

### Reproducibility
Same input/configuration → same output.

---

# 26. Frontend state

Keep separate concepts for:

- authenticated identity;
- role;
- route;
- domain data;
- loading/error state;
- transient UI state.

Do not put every UI interaction into global state.

---

# 27. Routing

Use the existing repository approach.

If implementing a lightweight router:

- route → page renderer;
- auth-aware navigation;
- role-aware navigation;
- unknown route handling;
- protected page handling.

Frontend route protection is UX, not the only security mechanism.

---

# 28. Forms

Forms require:

- validation;
- loading state;
- duplicate-submit prevention;
- field errors;
- server/database error handling;
- success confirmation;
- preservation of safe entered values.

---

# 29. Charts

Charts are explanatory.

Every important chart should have:

- title;
- unit/meaning;
- useful interpretation;
- loading state;
- empty state;
- accessible summary where practical.

Do not add charts only because data exists.

---

# 30. Performance

Prefer:

- targeted queries;
- server-side/database filtering;
- pagination;
- debounced search;
- reuse of stable reference data;
- measured optimization.

Avoid premature complexity.

---

# 31. Accessibility

Baseline:

- semantic HTML;
- labels;
- keyboard support;
- visible focus;
- contrast;
- status announcements where needed;
- no color-only meaning;
- accessible dialogs;
- reduced-motion support.

---

# 32. Migrations

Database changes should use the repository's migration process.

A schema migration may include:

- tables/columns;
- constraints;
- indexes;
- RLS;
- policies;
- reference/seed data where appropriate.

Never manually alter production schema as a substitute for the migration workflow.

---

# 33. Security checklist

Before completing a protected feature:

- Is authentication required?
- Is role/ownership authorization enforced?
- Is RLS enabled?
- Can unauthorized users query the data?
- Can users modify another user's data?
- Can recruiters infer denied data?
- Are secrets absent from frontend code?
- Are raw database errors hidden?
- Does analytics receive only authorized data?

---

# 34. Validation

Use only scripts/tools actually present in the repository.

Possible commands:

```bash
npm run lint
npm run test
npm run build
```

Do not assume these scripts exist.

For database work, validate migrations/RLS using the actual project setup.

Never claim a command passed unless it ran.

---

# 35. Technical anti-drift examples

### Stack drift

Bad:
> Add React because components are easier.

Correct:
> Reuse/build vanilla-JS components unless the architecture is explicitly changed.

### Backend drift

Bad:
> Add FastAPI because a Python algorithm is easier.

Correct:
> Keep Round-1 analytics in JS. A production Python service requires an explicit architecture decision.

### Schema hallucination

Bad:
> Create `career_readiness_score` because the dashboard needs a number.

Correct:
> Determine whether the score should be derived or persisted. Do not invent persistence without a decision.

### Security shortcut

Bad:
> Fetch all student records and hide private columns in the UI.

Correct:
> Restrict data at the query/RLS layer.

---

# 36. Decision ledger

| ID | Decision | Status |
|---|---|---|
| TECH-001 | Vite | LOCKED |
| TECH-002 | HTML/CSS/Vanilla JS | LOCKED |
| TECH-003 | Supabase | LOCKED |
| TECH-004 | JavaScript analytics engine | LOCKED |
| TECH-005 | RLS for protected data | LOCKED |
| TECH-006 | No privileged secrets in frontend | LOCKED |
| TECH-007 | Analytics explainability | LOCKED |
| TECH-008 | What-if cannot mutate real data | LOCKED |
| TECH-009 | Python is not Round-1 production runtime | LOCKED |
| TECH-010 | Exact schema must come from/reconcile with actual migrations | LOCKED |
| TECH-011 | Exact algorithm weights must not be invented | LOCKED |

## Implemented student backend checkpoint

The conceptual schema above remains planning guidance for unimplemented domain entities. The actual Round-1 student/registration schema, applied migrations, authoritative database role model, bounded self-reported portfolio document, read-only source measurements, and narrow account-manager permission are recorded in `docs/STUDENT_BACKEND.md`. Use that document together with the actual migrations when maintaining implemented student services. Public preview data is database-seeded synthetic data; it does not grant access to real accounts.
