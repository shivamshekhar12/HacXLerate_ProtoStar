# Porto-Star - Other Information and Major Remaining Problems

Round-1 presentation reference | 8 October 2026

## Demonstration versus institutional readiness

A useful demo and a trusted campus system have different requirements. Porto-Star demonstrates explainable analytics and role workflows, but real use needs reliable evidence, authorization, verified claims, and operating controls. The following solutions are proposals, not completed features.

## 1. Disconnected and inconsistent data

Departments may use different student IDs, scales, subject names, and update schedules. Unchecked joins can attach evidence to the wrong student or compare incompatible units.

Proposed solution: authorized import with identity reconciliation, field ranges/units, source IDs, timestamps, deduplication, and row-level error reports. Begin with reviewed JSON/CSV batches before automated connectors. Preserve original values and transformations. The documented JSON template is the starting contract; live upload remains disabled until these controls exist.

## 2. Unvalidated scoring and risk rules

Equal weights are understandable but do not prove predictive accuracy. Coding may be unsuitable for some courses, and a single threshold may not suit every institution or semester.

Proposed solution: faculty-approved course-specific indicators, weights, ranges, and missing-data policies. Version rules and retain the version used for each result. For predictive claims, evaluate consented historical outcomes using time-separated holdouts, error analysis, and subgroup checks. Continue calling the result an index until evidence supports stronger claims. The review factor is a fraction of checks, not a failure probability.

## 3. Unverified projects and achievements

Links do not prove authorship or quality. Repository/commit counts can be inflated and may undervalue non-coding work.

Proposed solution: separate Projects/Achievements sections, structured submissions, private evidence storage, faculty review, and explicit pending/verified/rejected statuses. Record reviewer, reason, and timestamps with an appeal path. Only approved rubrics should convert verified evidence into points. Avoid equating activity counts with competence.

## 4. Faculty authorization and student support

A faculty preview does not authorize viewing real students. Students need a direct way to raise doubts instead of relying only on staff-created notes.

Proposed solution: model faculty-to-cohort/subject assignments and enforce scoped queries through RLS. Add student-owned tickets with category/status filtering, faculty responses, resolution history, and campus-approved escalation. Keep support information separate from professional recruiter views. Replace local support persistence with authorized backend records.

## 5. Consent and recruiter access

Students must understand shared fields and be able to revoke sharing. Hidden UI controls alone cannot protect data retrieval.

Proposed solution: a minimal server-enforced professional projection, explicit field consent, revocation, recruiter approval, and mediated contact. Test denied access as carefully as permitted reads. Never include private risk indices, faculty comments, or internal support records in discovery. Current shortlists/introduction drafts are preview workflows.

## 6. Meaningful effort simulation

Sliders cannot establish that extra effort causes a specific CGPA or placement improvement. Credit weights, current mastery, diminishing returns, and time trade-offs matter.

Proposed solution: publish an illustrative model with a fixed effort budget, mastery, subject credits, diminishing returns, and baseline/scenario tables. Keep simulated outcomes separate from verified marks. Ask faculty to review assumptions before stronger causal or placement-probability claims. The current basic simulator does not implement this richer model yet.

## 7. AI trust, availability, and cost

A language model can produce misleading interpretation or fail during a demo. Per-instance caching is not a global spending limit.

Proposed solution: retain code-based calculations, constrained wording, fallback sentences, and source labels. Add a distributed quota and audit metadata without private prompt logs. Test actual signed-in narration. Maintain expected examples for missing evidence, no checks, and multiple checks. A future conversational assistant requires its own reviewed scope/access model.

## 8. Account and operational readiness

Signup alone does not finish staff approval, recovery, or dependable confirmation emails. Hosted systems also need maintenance and incident visibility.

Proposed solution: finish staff provisioning, configure production Auth origins and SMTP, add recovery, review password protection, and define role revocation. Monitor errors without logging private data or credentials. Document backups, restore checks, quotas, and rollback. Supabase's existing leaked-password-protection advisory remains a configuration issue to review.

## 9. Inclusive UX and complete profiles

Campuses include many courses and career paths. Dense tables and very long reports can be difficult on small screens or assistive technology.

Proposed solution: broad catalogs plus custom values, course-appropriate assessment assumptions, scoped profile-photo storage, and keyboard/screen-reader checks. Provide concise report summaries and cohort filtering before exporting large ledgers. Keep units, missing states, and status labels clear.

## Recommended rollout

First verify hosted confirmation and actual signed-in narration, then complete staff/consent access. Next implement reviewed source imports and evidence verification. Then add student doubts, persistent interventions, and the richer illustrative simulator. Finally validate an institutional scoring policy, outcomes, fairness, and operational reliability before broad adoption.

Each module should produce a visible result, relevant successful/denied-path checks, and a team review checkpoint. This respects the requested incremental process and avoids a large unreviewed rewrite.

## Suggested judging narrative

Show unified evidence, explain one score and review reason, demonstrate faculty segmentation and recruiter privacy, and show the readable report. Explain that AI is optional representation, while numbers come from algorithms. Close with concrete implementation limits and the next institutional integration step. This aligns with the brief's data, scoring/risk, dashboard, understanding, and presentation criteria.

## Claims and ownership

The original brief defines the challenge; project specifications define intent; implementation notes and tests describe current behavior. Synthetic statistics are not student outcomes. Do not claim a license, institutional partnership, placement improvement, or judging result without evidence. Repository owners should choose reuse terms explicitly.
