# HacXLerate — Smart Campus AI (Round 1)

Complete role frontend V1: Vite + HTML/CSS + vanilla JavaScript, based on the supplied Stitch visual direction. This is the core V1 frontend review checkpoint, not the completed hackathon submission.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL shown by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm test
```

Node 22.23.1 was used for validation. Fonts and Material Symbols are bundled locally; there are no runtime CDN dependencies.

## Current functionality

The entry page provides Student / Faculty / Recruiter email/password sign-in through Supabase Auth. Create an account through Sign up. Students get an empty Supabase workspace; faculty/recruiter requests need approval. Select **Explore demo preview** to review all workspaces with synthetic data; its header selector switches demo roles.

Faculty includes cohort overview, student search/drilldown, cohort and subject analytics, and a persistent local support-action log. Recruiter includes talent discovery/detail, role requirements, shortlisting/comparison, and unsent introduction drafts. Student includes experience and achievement entries alongside the functions below.

- Student overview with seven source categories from the hackathon brief.
- Source coverage and original-unit indicators, with missing feedback represented explicitly.
- Evidence and source-provenance dialogs.
- Growth Momentum chart with CGPA, attendance, and coding-assessment views.
- Explainable sample next action.
- Skills library with search, evidence filters, validated add/edit forms, and sample role comparison.
- What-if sliders with original-unit comparisons and reset, without mutating baseline records.
- Editable demo profile and project evidence.
- Recruiter sharing controls with a local field-selected preview.
- Weekly goal creation, editing, completion, and reopening in My Growth.
- Local browser persistence for the demo goal, with session fallback if storage is unavailable.
- Hash navigation, unknown-route state, responsive navigation, native accessible dialogs, and status messages.

Student accounts now load and save their own Supabase records. Institutional source data is not imported yet. The public Aaman demo and ghost profiles load from the database. See [Supabase integration](docs/SUPABASE_INTEGRATION.md) and [login setup](docs/LOGIN_AUTH.md). Local storage is used only for demo edits. See [student backend checkpoint](docs/STUDENT_BACKEND.md) for the actual schema, manager setup, and verification limits.

## Specifications

The four supplied Markdown files are preserved in the root. The hackathon PDF and selected Stitch reference are under `docs/reference/`. The user's request for small modules and a review pause takes precedence over the documents' eventual full-product scope.

A Stitch mockup includes illustrative score weights and claimed integrations. Those are visual-reference content, not approved analytics or actual connected systems. The technical spec leaves precise weights undecided, so Module 01 does not calculate a Success Score, readiness band, risk signal, estimated score boost, or hiring outcome.

## Review checkpoint

See [docs/FRONTEND_V1.md](docs/FRONTEND_V1.md) for the complete frontend page map, verified flows, and pending backend work. [Student review notes](docs/FRONTEND_REVIEW.md) preserve the preceding checkpoint. [Module 01](docs/MODULE_01.md) records the earlier checkpoint. Continue implementation only after the team's feedback.

## Supabase connection foundation

PROTO-STAR is configured via ignored `.env.local`, and the official client is initialized at startup. Domain data remains local demo data until backend services are implemented.

```sh
npm run supabase:check
```

See [connection setup and validation](docs/SUPABASE_INTEGRATION.md).

## GitHub development

Repository: https://github.com/Rudra-Sharma-432/HacXLerate, branch `codex`.

For future changes from this checkout:

```sh
git status
git add .
git commit -m "Describe your change"
git push origin codex
```

Pull teammates' changes with `git pull --rebase origin codex` after committing your own work. Keep `.env.local` private; each developer configures Supabase using `.env.example`. Dependencies, build output and CLI cache files are intentionally ignored.
