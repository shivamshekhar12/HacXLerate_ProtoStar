# AGENTS.md — Codex Operating Contract

## Purpose

This repository contains the Round-1 implementation of a role-based academic/career intelligence platform for **Students, Faculty, and Recruiters**.

This file is Codex's **operating contract**, not the full project encyclopedia.

Read the other files only as needed:

- `PROJECT_SPEC.md` → product truth: what/why.
- `TECHNICAL_SPEC.md` → implementation truth: how/data/security/algorithms.
- `UI_UX_SPEC.md` → interface truth: how it looks/behaves.

Do not duplicate large sections from those files into this one.

---

# 1. Round-1 architecture — LOCKED

The intended Round-1 runtime stack is:

```text
Vite
 └── HTML
 └── CSS
 └── Vanilla JavaScript
       ├── UI/application logic
       └── analytics/algorithm engine
            |
            v
        Supabase
        ├── Auth
        ├── PostgreSQL database
        ├── Row Level Security
        └── Storage only when explicitly needed
```

### Important

- Do **not** introduce React/Next.js/etc.
- Do **not** introduce Express/Fastify/FastAPI/etc.
- Do **not** introduce SQLite as the application database.
- Do **not** introduce a second backend.
- Do **not** silently turn Python into a production runtime.

There was an older Python/FastAPI + SQLite direction. It is **superseded for Round 1**.

If Python is explicitly requested later for offline analysis, experimentation, data preparation, or algorithm research, keep that separate from the Round-1 browser runtime unless the user explicitly changes the architecture.

---

# 2. Roles — LOCKED

The product has three first-class roles:

- Student
- Faculty
- Recruiter

Faculty is a required product layer.

Recruiter access is deliberately privacy/consent constrained.

Do not add an unrestricted admin role or reinterpret Faculty as a generic administrator without an explicit decision.

---

# 3. Source-of-truth hierarchy

Use this hierarchy:

### A. Current explicit user instruction
A direct, current user decision can intentionally change an older decision.

### B. Project specifications
- `PROJECT_SPEC.md` = product requirements.
- `TECHNICAL_SPEC.md` = technical/security/algorithm requirements.
- `UI_UX_SPEC.md` = design/interaction requirements.

### C. Existing repository implementation
Existing code/schema is evidence of the current state and must be inspected during maintenance. It is **not automatically authority over the written product architecture**.

If code conflicts with a locked project decision, do not silently accept the drift. Identify it.

### D. Engineering inference
Use only when the decision is low-risk and consistent with the specifications.

### Conflict rule

Never silently resolve a consequential contradiction.

State:
1. what conflicts;
2. which source says what;
3. what would change;
4. what decision is needed.

---

# 4. Context discipline

Codex must avoid wasting context.

For each task:

1. Identify the requested feature/bug.
2. Locate the relevant spec section.
3. Inspect only the relevant repository code.
4. Search for existing components/services/utilities before creating new ones.
5. Implement the smallest coherent change.
6. Validate it.
7. Update specifications only when durable project truth changed.

Do **not** load all four files for every trivial task.

Do **not** repeat large specifications in task summaries.

---

# 5. Anti-hallucination rules

Never invent:

- requirements;
- user permissions;
- database columns;
- database tables;
- API endpoints;
- secrets/credentials;
- Supabase policies;
- score weights;
- algorithm constants;
- user achievements;
- candidate information;
- privacy permissions;
- product functionality.

When information is missing:

1. inspect the repository;
2. inspect the relevant spec;
3. look for an existing decision;
4. if the missing detail is consequential, ask/flag it;
5. if it is a harmless implementation detail, choose the simplest implementation and document the assumption only when it becomes durable.

Never turn a **conceptual/proposed schema** into a claimed existing schema.

---

# 6. Security and privacy

Security is enforced at the data layer, not only the UI.

- Supabase RLS is mandatory for protected data.
- Never expose service-role credentials to the browser.
- Never fetch broad private datasets and filter them in JavaScript.
- Never expose faculty-only/support data to recruiters.
- Never expose internal analytics/risk/support data outside its authorized scope.
- Never treat hidden HTML as authorization.
- Never assume a role supplied by the browser is trustworthy.
- Validate ownership/role/consent through the authenticated data-access model.

Recruiter visibility must be deliberately selected from recruiter-safe data.

---

# 7. Analytics rules

Analytics must be:

- deterministic where intended;
- explainable;
- testable;
- bounded;
- resilient to missing data;
- explicit about data completeness/confidence.

Never fabricate missing evidence.

Prefer:

```text
result
+ contributing factors
+ explanation
+ data completeness
+ confidence/caveat
```

over an unexplained number.

Do not imply that a readiness/fit score guarantees academic, career, interview, or hiring outcomes.

---

# 8. Frontend rules

Prefer:

- semantic HTML;
- reusable vanilla-JS modules/components;
- CSS custom properties/design tokens;
- clear data/state boundaries;
- accessible controls;
- loading/empty/error states;
- responsive behavior;
- existing repository patterns.

Avoid:

- giant monolithic files;
- duplicate components;
- unnecessary dependencies;
- inline styling for reusable patterns;
- hidden authorization logic;
- arbitrary framework additions.

---

# 9. Supabase rules

For schema changes:

- use the repository's migration workflow;
- preserve referential integrity;
- enable RLS where data is protected;
- write explicit least-privilege policies;
- test allowed and denied access.

Never weaken RLS simply because a frontend query fails.

Never invent a table/column because a UI needs one. First determine whether it should actually exist.

---

# 10. UI/UX rules

The product should feel:

- intelligent;
- trustworthy;
- professional;
- academic/career-oriented;
- clear;
- data-driven without being overwhelming.

The exact theme/colors are **lower-priority and flexible** unless the user explicitly locks branding.

Do not use generic AI-SaaS decoration, excessive gradients, excessive glassmorphism, or animation without a UX purpose.

Follow `UI_UX_SPEC.md`.

---

# 11. Validation

After meaningful changes, run the relevant repository checks that actually exist:

- lint;
- tests;
- build;
- database/migration validation;
- focused manual checks where appropriate.

Never claim a check passed unless it ran.

If a check cannot run, report the reason.

---

# 12. Change discipline

Do not silently:

- change the stack;
- replace Supabase;
- introduce Python as a production backend;
- remove Faculty;
- weaken recruiter privacy;
- change analytics semantics;
- redesign the information architecture;
- add major dependencies.

If a task requires one of these, flag the architectural change before proceeding.

---

# 13. Definition of done

A meaningful task is complete when:

- requested behavior works;
- existing behavior is not unnecessarily broken;
- permissions/privacy are correct;
- async states are handled;
- relevant validation ran;
- implementation follows the three specs;
- durable changes are documented.

Final task summary should state:

1. what changed;
2. what was validated;
3. known limitation/assumption, if any.

---

# 14. Task protocol

### New feature

1. Find governing product requirement.
2. Find technical/security rules.
3. Find relevant UI rules.
4. Inspect existing implementation.
5. Plan minimally.
6. Implement.
7. Test.
8. Update durable documentation if necessary.

### Bug

1. Reproduce/inspect evidence.
2. Identify root cause.
3. Fix root cause, not symptoms.
4. Add regression coverage where practical.
5. Validate.

### Schema/security

1. Inspect actual schema/migrations.
2. Compare with canonical product permission requirements.
3. Make migration/policy changes.
4. Test both permitted and denied paths.

### Uncertainty

> Inspect first. Infer second. Ask when consequential. Never hallucinate.

---

# 15. Document map

| File | Canonical purpose |
|---|---|
| `AGENTS.md` | How Codex works |
| `PROJECT_SPEC.md` | What the product is |
| `TECHNICAL_SPEC.md` | How it is implemented |
| `UI_UX_SPEC.md` | How it looks/behaves |
