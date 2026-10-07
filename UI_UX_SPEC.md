# UI_UX_SPEC.md — Design and Interaction Specification

## 1. Purpose

This document is the visual/interaction source of truth.

It describes the intended page structure and UX for **Student, Faculty, and Recruiter**.

### Priority rule

**Information architecture, usability, hierarchy, accessibility, and privacy are higher priority than exact colors.**

Theme/colors are intentionally flexible unless the user explicitly locks branding.

Do not let visual styling invent product features.

---

# 2. Design goal

The product should feel:

- intelligent;
- trustworthy;
- professional;
- academic/career-oriented;
- clear;
- modern;
- data-driven without feeling overwhelming.

It should help users make decisions, not feel judged by an opaque AI.

---

# 3. Visual direction

Prefer:

- clean layouts;
- strong hierarchy;
- calm visual language;
- restrained emphasis;
- meaningful data visualization;
- consistent spacing;
- professional typography.

Avoid:

- generic "AI SaaS" appearance;
- excessive gradients;
- excessive glassmorphism;
- neon/glowing UI;
- huge decorative graphics;
- card-within-card overload;
- animation without purpose;
- tiny text;
- color-only status communication.

---

# 4. Design tokens

Use CSS custom properties.

Conceptual token groups:

```css
:root {
  --color-bg: ...;
  --color-surface: ...;
  --color-surface-raised: ...;
  --color-text: ...;
  --color-text-muted: ...;
  --color-border: ...;

  --color-primary: ...;
  --color-primary-hover: ...;

  --color-success: ...;
  --color-warning: ...;
  --color-danger: ...;
  --color-info: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;

  --space-1: ...;
  --space-2: ...;
  --space-3: ...;
  --space-4: ...;
  --space-6: ...;
  --space-8: ...;
}
```

These are token categories, not mandatory literal values.

---

# 5. Typography

Prioritize readability.

Use a clear hierarchy:

```text
Page title
Section heading
Card heading
Body
Secondary text
Caption
```

Use a practical font stack unless branding explicitly requires another font.

---

# 6. Global application shell

The shell should provide:

- role-specific navigation;
- main content;
- contextual actions;
- account/user area;
- responsive navigation.

Never show navigation for a role/function the authenticated user cannot use.

---

# 7. Navigation

## Student

Potential groups:

- Overview
- Profile
- Skills
- Projects/Experience
- Analytics
- Growth
- Roles
- Progress
- Privacy

## Faculty

Potential groups:

- Overview
- Students/Cohort
- Analytics
- Support
- Progress

## Recruiter

Potential groups:

- Overview
- Talent
- Roles
- Shortlists
- Requests

These are information-architecture targets. Actual route names may adapt to the repository.

---

# 8. Dashboard hierarchy

Avoid a wall of cards.

Preferred order:

```text
page context + primary action
        ↓
key summary
        ↓
important insights/actions
        ↓
supporting evidence
        ↓
detailed data
```

Use progressive disclosure.

---

# 9. Shared components

Prefer reusable components for:

- buttons;
- icon buttons;
- badges;
- status indicators;
- cards;
- metrics;
- progress indicators;
- tabs;
- dialogs/modals;
- drawers;
- inputs;
- selects;
- search;
- tables;
- empty states;
- loading skeletons;
- error states;
- toasts;
- tooltips/help;
- chart containers;
- evidence lists;
- recommendation cards;
- explanation/factor cards;
- consent controls.

Do not create multiple near-identical components.

---

# 10. Async states

Every meaningful async surface needs:

### Loading
A stable skeleton/focused loading state.

### Empty
Explain what is missing and how to populate it.

### Error
Use user-facing language and provide retry/action where practical.

### Success
Confirm meaningful mutations.

### Partial data
Show what is available and explain important limitations.

---

# 11. Student pages

## 11.1 Student dashboard

### Purpose

Answer:

- Where am I?
- What am I strong at?
- What needs attention?
- What should I do next?
- What progress have I made?
- What opportunities are relevant?

### Hierarchy

```text
Header/context
   ↓
Key readiness/summary
   ↓
Completeness/progress
   ↓
Strengths + gaps
   ↓
Recommendations
   ↓
Relevant opportunities
   ↓
Recent progress
```

Do not show every possible metric.

---

## 11.2 Student profile

Organize into logical sections:

- basic profile;
- education;
- academic information;
- skills;
- projects;
- experience;
- achievements/certifications;
- goals/preferences;
- recruiter visibility.

Each editable section needs:

- heading;
- edit action;
- validation;
- save/loading state;
- success state;
- error state;
- useful empty state.

---

## 11.3 Student skills

Show:

- skill;
- proficiency where supported;
- evidence where available;
- relevance to goals/roles.

Make gaps understandable rather than punitive.

---

## 11.4 Student analytics

Recommended:

```text
Current result
   ↓
component breakdown
   ↓
strengths
   ↓
gaps
   ↓
evidence
   ↓
recommendations
```

Every important score should have explanation.

---

## 11.5 Student growth

Recommendation cards should answer:

1. What should I do?
2. Why?
3. What gap/goal does it address?
4. What benefit is expected?
5. What is its status?

Prioritize actions.

---

## 11.6 Student what-if

Clearly separate:

```text
CURRENT
Scenario
Estimated change
```

Use labels such as:

- estimated;
- scenario;
- based on current model;
- not a guarantee.

Never make hypothetical data visually indistinguishable from actual results.

---

# 12. Faculty pages

## 12.1 Faculty dashboard

Prioritize:

1. cohort overview;
2. students needing review;
3. common gaps;
4. progress trends;
5. support opportunities.

Avoid fear-based red dashboards.

---

## 12.2 Faculty student detail

Recommended:

### Header
- student identity;
- program/cohort;
- concise summary.

### Progress
- current state;
- recent changes.

### Skills/evidence
- strengths;
- gaps;
- evidence.

### Analytics
- contributing factors;
- explanations.

### Support
- authorized intervention history/notes.

Keep faculty-only information visually and technically protected.

---

## 12.3 Faculty analytics

Useful aggregate views may include:

- readiness distribution;
- trends;
- common skill gaps;
- incomplete profiles;
- review/support signals;
- progress.

Every visualization should answer a faculty decision.

---

# 13. Recruiter pages

## 13.1 Recruiter dashboard

Prioritize:

- talent discovery;
- relevant roles;
- recent candidates;
- shortlists;
- requests.

Keep the surface concise.

---

## 13.2 Talent search

Flow:

```text
Search
 ↓
Filters
 ↓
Candidate results
 ↓
Preview
 ↓
Candidate detail
```

Filters must be recruiter-safe.

---

## 13.3 Candidate profile

Show only recruiter-eligible information:

- professional summary;
- relevant skills;
- project/experience evidence;
- education;
- achievements;
- role fit;
- strengths/gaps;
- permitted contact action.

Never display private faculty/support information.

---

## 13.4 Role-fit UI

Use a breakdown:

```text
ROLE FIT
Band / result

Matched
- ...

Needs development
- ...

Evidence
- ...

Completeness / caveat
- ...
```

Do not imply hiring certainty.

---

# 14. Consent/privacy UI

A visibility control should explain:

- what is visible;
- who can see it;
- what changing the control does;
- when it takes effect.

Avoid hiding important privacy meaning behind vague labels.

Example style:

```text
Recruiter visibility
[ Enabled ]

Recruiters can view your permitted professional profile
and relevant evidence.
Private faculty/support information remains hidden.
```

Actual wording must match the implemented permission policy.

---

# 15. Completeness UI

Use constructive language.

Prefer:

> Profile completeness: 72%
> Add project evidence to improve role-fit analysis.

Avoid:

> Your profile is incomplete.

Completeness is a diagnostic, not a judgment.

---

# 16. Score visualization

Never communicate important score meaning through color alone.

Use:

- number/result;
- label/band;
- progress visualization;
- explanation.

Example:

```text
72
Developing

Strengths: ...
Gap: ...
Next action: ...
```

Exact bands and values must match the analytics implementation.

---

# 17. Support/risk visualization

Use non-judgmental language.

Prefer:

> Review suggested

rather than:

> Problem student

Show the reason/evidence.

Example:

```text
Review suggested

Reason:
No meaningful recent activity.

Evidence:
...
```

Do not expose internal support signals to recruiters.

---

# 18. Tables

Use tables when comparison is genuinely useful:

- candidate lists;
- student lists;
- structured records;
- skill comparisons.

Support, where needed:

- sorting;
- filtering;
- pagination;
- responsive adaptation.

On mobile, convert complex rows into stacked cards where appropriate.

---

# 19. Forms

Use progressive grouping.

Avoid very long undifferentiated forms.

Provide:

- labels;
- hints/examples;
- validation;
- save/cancel;
- loading state;
- error state;
- unsaved-change handling where necessary.

---

# 20. Responsive behavior

## Desktop

- persistent navigation where appropriate;
- multi-column analytics;
- full tables.

## Tablet

- flexible grids;
- reduced columns;
- collapsible navigation.

## Mobile

- compact navigation;
- stacked content;
- simplified charts;
- touch-friendly controls;
- horizontal scrolling only when necessary.

Do not remove critical functionality solely because the viewport is smaller.

---

# 21. Motion

Animation should communicate:

- state transition;
- loading;
- expansion;
- confirmation.

Avoid decorative continuous motion and long blocking transitions.

Respect reduced-motion preferences.

---

# 22. Accessibility

Required baseline:

- semantic headings;
- labels;
- keyboard navigation;
- visible focus;
- contrast;
- accessible status messages;
- no color-only meaning;
- accessible dialogs;
- reduced-motion support.

Important charts need an accessible textual summary.

---

# 23. Content tone

Use:

- direct;
- encouraging;
- professional;
- non-judgmental;
- concise.

Avoid:

- exaggerated AI claims;
- fake certainty;
- fear-based language;
- shame around low scores;
- "AI says you are..." framing.

---

# 24. Error copy

Bad:

> Error 403

Better:

> You don't have permission to view this information.

Bad:

> Supabase query failed.

Better:

> We couldn't load this information right now. Try again.

Do not expose implementation details.

---

# 25. Component acceptance checklist

Before adding a component:

- Does it have a real product purpose?
- Can an existing component be reused?
- Are loading/empty/error states covered?
- Is it accessible?
- Does it work responsively?
- Does it use design tokens?
- Does it avoid duplicating an existing pattern?
- Does it respect role/privacy boundaries?

---

# 26. Design decision ledger

| ID | Decision | Status |
|---|---|---|
| UI-001 | Student/Faculty/Recruiter experiences are all designed | LOCKED |
| UI-002 | Professional/intelligent/academic-career visual language | LOCKED |
| UI-003 | Exact colors are flexible until branding is explicitly locked | FLEXIBLE |
| UI-004 | Analytics UI must show explanation, not just scores | LOCKED |
| UI-005 | Role-specific navigation | LOCKED |
| UI-006 | Recruiter profile is curated, not a raw student record | LOCKED |
| UI-007 | Support signals use non-judgmental language | LOCKED |
| UI-008 | Responsive design required | LOCKED |
| UI-009 | Accessibility is baseline | LOCKED |

---

# 27. Design handoff rule

When implementing a screen:

1. Read its product requirement in `PROJECT_SPEC.md`.
2. Read relevant technical/data/security rules in `TECHNICAL_SPEC.md`.
3. Follow this document for hierarchy/interaction.
4. Reuse existing components.
5. Do not invent features to make a screen look fuller.

The UI serves the product; it does not create new product requirements.
