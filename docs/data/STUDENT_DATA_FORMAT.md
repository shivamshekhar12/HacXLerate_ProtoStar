# Student data format and synthetic test dataset

Download `student-import-example.json` from the authorized account-management page. Upload is a reserved, disabled control for now, as requested. No file can currently create or modify real student records. There is no unrestricted admin role: the existing confirmed account-manager permission protects this area.

## Envelope

```json
{"schemaVersion":1,"synthetic":true,"students":[{"id":"DEMO-001","name":"Example student","degree":"B.Tech","program":"Computer Science","year":3,"semester":5,"batch":"2024-2028","cohort":"Computer Science - Year 3","cgpa":8.2,"attendance":89,"lmsMarks":89,"lmsMax":100,"modules":4,"assignmentCompletion":75,"coding":48,"backlogs":0,"subjectMarks":{"Data Structures":82},"skills":["SQL"],"engagement":{"events":2,"hackathons":1,"certifications":0},"placement":{"coding":48,"aptitude":65,"mockInterview":60},"feedback":null,"synthetic":true}]}
```

`id` is an external record identifier, never permission to act as a Supabase Auth user. A live importer must separately link verified student identities and authorized cohort assignments. Never accept a role or permission from the file. Consent must be recorded separately before building recruiter projections; internal scores, feedback and support information must not appear in those projections.

## Units and missing data

| Field | Meaning / bounds |
|---|---|
| cgpa | 0–10, numeric; null when missing |
| attendance | 0–100 percent; null when missing |
| lmsMarks / lmsMax | Earned assignment marks, marking scale; current demo scale 100 |
| assignmentCompletion | 0–100 percent; separate from marks |
| modules | Completed modules, 0–6 in this synthetic example |
| coding, aptitude, mockInterview | 0–100 assessment marks, not placement probabilities |
| subjectMarks | Subject name to marks / 100; do not invent unrecorded subjects |
| backlogs, events, hackathons, certifications | Nonnegative integer counts |
| feedback | Satisfaction rating 1–5 or null; not a risk diagnosis |
| degree, program, batch, cohort | Bounded strings; allow custom institution labels |
| year / semester | 1–10 / 1–20 for supplied records; fresh accounts can remain unset |
| skills | Array of skill names; self-report is not verification |

Do not turn null into zero. Real data should carry source system, observation date, assignment set, marking scale and verification/provenance before ingestion. The current JSON example is a testing contract, not a production import API.

## Reproducible generation

Run `node scripts/generate-demo.mjs`. It writes the seed and example files; database publication is a separate authorized seed operation, never a browser write. Seed: 20261008. Count: 500 unique synthetic records. The original five named fixtures remain; 495 are generated with Box-Muller Gaussian draws, rounding and range clamps. A shared ability factor creates correlation among CGPA, attendance and assessment marks. Marginal noise parameters are documented under `generation` in the seed. Clamping and the retained fixtures mean the final population is not exactly Gaussian. It does not fit a real campus population or validate predictive accuracy.

Eight courses, four years and multiple batches exercise the filters. 374 synthetic professional profiles are included; the others are omitted from recruiter discovery. Synthetic profiles do not have passwords, Auth accounts or real contact details.

Regeneration is deterministic. Gemini is not used to generate student records or calculate any result. `scripts/generate-demo-narrative.mjs` optionally creates one cached English explanation from the mathematical result; run it with server environment variables. Never use a VITE-prefixed Gemini key.
