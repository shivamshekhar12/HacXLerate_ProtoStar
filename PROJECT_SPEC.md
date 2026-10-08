# PROJECT_SPEC.md — Product Specification

## 1. Purpose

This is the product-level source of truth.

It defines the known Round-1 product intent, roles, workflows, privacy boundaries, analytics behavior, and scope.

### Evidence discipline

This document distinguishes between:

- **LOCKED** — explicitly decided project architecture/behavior.
- **REQUIRED** — product requirement that must be preserved.
- **CONCEPTUAL** — intended behavior whose exact implementation/schema still needs to be reconciled with the repository.
- **FLEXIBLE** — implementation/design choice that can change without changing product intent.

Codex must not turn a conceptual statement into a fabricated existing feature.

---

# 2. Product definition

The project is a role-based **student academic/career intelligence platform**.

Its purpose is to transform student career/academic evidence into understandable intelligence that helps:

- Students understand their profile, progress, strengths, gaps, and next actions.
- Faculty understand student/cohort progress and identify students who may need human review/support.
- Recruiters discover and evaluate relevant talent using only authorized, recruiter-safe information.

The core loop is:

```text
data
  ↓
analysis
  ↓
explanation
  ↓
action
  ↓
progress
  ↓
updated analysis
```

This is not intended to be only a CRUD profile system or only a dashboard.

---

# 3. Product principles — REQUIRED

## 3.1 Explainability over magic

Important scores, insights, recommendations, risk/support signals, and role-fit results should have understandable reasons.

Do not present unexplained intelligence.

## 3.2 Actionability over information overload

Important insights should answer:

1. What is happening?
2. Why does it matter?
3. What can I do next?

## 3.3 Privacy by design

A field existing in the database does not imply that every role may access it.

Recruiter-facing information must be deliberately exposed.

## 3.4 Data completeness matters

Incomplete information should not be presented with the same confidence as well-supported information.

Distinguish, where applicable:

- actual evidence;
- missing data;
- inferred information;
- user-entered claims;
- verified information.

## 3.5 Human support remains important

Faculty analytics assist human review. They do not replace faculty judgment.

---

# 4. Roles — LOCKED

## 4.1 Student

The Student is the primary owner of their career/academic profile.

Expected capabilities:

- maintain profile;
- maintain academic information;
- maintain skills;
- maintain projects/experience;
- maintain achievements/certifications;
- define goals/preferences;
- view analytics;
- view strengths/gaps;
- receive recommendations;
- use what-if scenarios where implemented;
- monitor progress;
- manage recruiter-facing visibility/consent where applicable.

Student must not access other students' private information or faculty-only records.

## 4.2 Faculty

Faculty is a first-class role.

Expected capabilities:

- view authorized students;
- view cohort-level information;
- inspect progress;
- inspect explainable signals;
- identify students needing review;
- identify common gaps;
- support/intervene where authorized;
- maintain faculty-only support information where the final schema provides it.

Faculty is not automatically unrestricted administrator access.

## 4.3 Recruiter

Recruiter access is deliberately restricted.

Expected capabilities:

- discover eligible talent;
- search/filter authorized profiles;
- evaluate career-relevant evidence;
- compare role fit;
- manage shortlists where implemented;
- initiate privacy-aware contact/introduction requests where implemented.

Recruiters must not access:

- private faculty notes;
- internal support/risk information;
- unrelated private student data;
- hidden fields merely because they exist in the database.

---

# 5. Product information architecture

The exact route names can evolve, but the product must support these functional areas.

## Student

- Overview/dashboard
- Profile
- Academic/performance
- Skills
- Projects/experience
- Achievements/certifications
- Career goals/role exploration
- Analytics/readiness
- Growth/recommendations
- What-if/scenarios
- Progress
- Recruiter visibility/privacy

## Faculty

- Overview/dashboard
- Students/cohort
- Student detail
- Cohort analytics
- Review/support signals
- Intervention/support
- Progress monitoring
- Skill/gap overview

## Recruiter

- Overview/dashboard
- Talent discovery
- Search/filter
- Candidate detail
- Role requirements/role-fit
- Shortlists
- Contact/introduction requests

---

# 6. End-to-end product workflow

1. User provides/updates data.
2. Input is validated.
3. Authorized data is stored in Supabase.
4. Analytics normalize authorized data.
5. Analytics produce explainable indicators.
6. UI presents state, evidence, gaps, and next actions.
7. User acts/updates evidence.
8. Analytics refresh.
9. Faculty can review/support within permission boundaries.
10. Recruiters can discover/evaluate only recruiter-eligible information.

Do not build a dashboard disconnected from actionable outcomes.

---

# 7. Student product requirements

## Dashboard

Must help answer:

- Where am I now?
- What am I strong at?
- What needs attention?
- What should I do next?
- What progress have I made?
- Which opportunities/roles are relevant?

Potential content:

- readiness/summary;
- data completeness;
- strengths;
- gaps;
- recommendations;
- recent progress;
- relevant roles/opportunities.

Exact metrics are governed by the analytics specification and actual implementation.

## Profile

Conceptual groups:

- identity/basic profile;
- education;
- academic information;
- skills;
- projects;
- experience;
- achievements/certifications;
- goals/preferences;
- recruiter visibility.

Only persist fields that have an actual canonical schema decision.

## Skills

Students should be able to:

- add/edit skills;
- indicate proficiency where supported;
- attach evidence where supported;
- see role-relevant gaps.

## Analytics/readiness

Show:

- current result;
- component breakdown;
- strengths;
- gaps;
- evidence;
- missing data;
- recommendations;
- completeness/confidence.

A naked score is insufficient.

## Growth

Recommendations should be prioritized and explainable.

Each useful recommendation should communicate:

- action;
- reason;
- related gap/goal;
- expected value;
- status.

## What-if

Students may simulate hypothetical improvements.

The UI must clearly distinguish:

- current state;
- scenario;
- estimated change;
- model caveat.

A scenario is not a guarantee.

---

# 8. Faculty product requirements

## Dashboard

Prioritize:

- cohort overview;
- students needing review;
- common skill gaps;
- progress trends;
- readiness distribution;
- support opportunities;
- data completeness issues.

Avoid alarmist "problem student" framing.

## Student detail

Where authorized:

- profile;
- progress;
- skills/evidence;
- analytics;
- gaps;
- support history/notes.

Faculty-only information must remain protected.

## Support/intervention

Conceptual workflow:

```text
signal
 ↓
evidence
 ↓
faculty review
 ↓
support/intervention
 ↓
follow-up
```

Analytics should not automatically make irreversible decisions.

---

# 9. Recruiter product requirements

## Talent discovery

Focus on:

- relevant skills;
- education;
- projects;
- experience;
- certifications/achievements;
- role fit;
- relevant preferences/availability only when explicitly supported;
- consent/visibility.

## Candidate profile

Present a curated professional view:

- summary;
- relevant skills;
- evidence;
- projects/experience;
- education;
- achievements;
- role fit;
- strengths/gaps;
- permitted action.

Do not expose the complete student record.

## Role fit

Communicate:

- matched requirements;
- missing requirements;
- evidence;
- completeness/confidence;
- caveats.

Never present role fit as a hiring guarantee.

## Shortlists/contact

Where implemented, preserve the privacy model and never silently reveal private contact information.

---

# 10. Analytics product behavior

The platform may use a readiness/Success Score concept.

This is an **application metric**, not a scientific diagnosis or guaranteed outcome.

Conceptual dimensions may include:

- academics/performance;
- skills;
- projects/experience;
- achievements/certifications;
- career alignment;
- activity/progress;
- evidence quality;
- data completeness.

The exact formula belongs to `TECHNICAL_SPEC.md` and must not be invented casually.

---

# 11. Support/risk signals

If implemented, signals are for human review.

Possible signals may include:

- incomplete profile;
- prolonged inactivity;
- stalled goals;
- weak evidence in important areas;
- repeated unmet goals;
- concerning progress patterns where explicitly defined.

A signal must not:

- diagnose a person;
- claim certainty;
- expose sensitive data to recruiters;
- automatically create irreversible labels/actions.

Distinguish:

```text
signal detected
≠
faculty reviewed
≠
confirmed intervention/support state
```

---

# 12. Privacy and consent

## Student

Students should have appropriate control over recruiter-facing visibility where the final institutional policy permits.

## Faculty

Faculty access must be limited to legitimate authorized information.

## Recruiter

Recruiter-visible information must satisfy:

1. recruiter eligibility;
2. role authorization;
3. consent/visibility requirements.

## Sensitive/internal information

Classify and protect sensitive/internal data explicitly.

Do not solve privacy merely by hiding a UI component.

---

# 13. Data completeness

The system should communicate when analysis is limited by missing information.

Conceptual message:

> "Your profile is 68% complete. Adding project evidence and role preferences may improve the quality of your recommendations."

The exact calculation and threshold are technical decisions and must not be fabricated.

---

# 14. AI/automation boundary

If AI-assisted features are added:

- use structured application data;
- never invent achievements/evidence;
- respect role permissions;
- distinguish generated suggestions from verified facts;
- do not allow generated text to become authoritative data without explicit user action/validation.

Round-1 core analytics remain deterministic JavaScript unless the architecture is explicitly changed.

---

# 15. Round-1 non-goals — LOCKED unless changed

Do not silently expand into:

- full HR/payroll;
- generic LMS;
- social network;
- ERP replacement;
- autonomous hiring decisions;
- autonomous disciplinary decisions;
- unrestricted recruiter access;
- Python/FastAPI production backend;
- separate ML research platform.

---

# 16. Acceptance criteria

## Product

- Student experience is coherent.
- Faculty is genuinely functional.
- Recruiter experience is useful but privacy constrained.
- Analytics connect to actions.
- What-if is clearly hypothetical.

## Privacy

- Unauthorized access is denied at the data layer.
- Client cannot obtain hidden/private data.
- Recruiter-visible data is deliberate.

## Analytics

- Calculations are reproducible.
- Missing data is handled explicitly.
- Important results have explanations.
- No fabricated evidence.

## UX

- Loading/empty/error/success states exist.
- Responsive behavior works.
- Primary actions are clear.
- Important analytics are interpretable.

---

# 17. Decision ledger

| ID | Decision | Status |
|---|---|---|
| PROD-001 | Student, Faculty, Recruiter are first-class roles | LOCKED |
| PROD-002 | Faculty is mandatory | LOCKED |
| PROD-003 | Recruiter access is consent/permission constrained | LOCKED |
| PROD-004 | Analytics should be explainable/actionable | LOCKED |
| PROD-005 | What-if results are hypothetical | LOCKED |
| PROD-006 | Privacy is enforced at data layer | LOCKED |
| PROD-007 | Theme/colors remain flexible unless explicitly branded | FLEXIBLE |
| PROD-008 | Exact DB schema must be reconciled with actual migrations | REQUIRED |

---

# 18. Requirement IDs

Use IDs only for durable requirements.

Examples:

- `PROD-STU-001`
- `PROD-FAC-001`
- `PROD-REC-001`
- `PROD-SEC-001`
- `PROD-AN-001`

Do not create IDs for trivial implementation details.
