# Development plan

The plan of harness-framework: phases of tasks, each task one pull request. The method is the [plan method](../../core/plan/README.md).

**Phase status legend:** ⬜ not started · 🟡 in progress · ✅ done. A phase's status is kept in the summary table and in the phase file, and
is updated in the change that starts or finishes it.

**Task status** is tracked per task in the phase files. Each phase has an append-only **work log** so it can be resumed in a new session.

**Estimation scale:** story points (SP), Fibonacci; 1 SP is about half a developer-day or one focused agent session; estimates include the tests the definition of done requires.

**Summary** (written from the phase files by `harness plan summary`; edit a phase file, not this table)

<!-- plan-summary:start -->
| Phase | Theme | Story points | Agent complexity | Status |
| ----- | ----- | ------------ | ---------------- | ------ |
| 1 | Adoption, presets, examples and the proof | 12 | C1–C2 | ✅ Done |
| 2 | Security and review automation | 17 | C2–C3 | ⬜ Not started |
| 3 | Stabilization, migrations and local adapters | 61 | C1–C2 | 🟡 In progress |
| 4 | Reaching and holding the structure of documents | 27 | C1–C2 | 🟡 In progress |
|  | **Total of Phases 1–4** | **117** | | |
<!-- plan-summary:end -->

<!-- plan-issues:start -->
**Issue queue** (not a phase; its size is not in the totals above): [0 open](./issues/README.md), 0 SP; 5 archived.
<!-- plan-issues:end -->

<!-- plan-backlog:start -->
**Backlog** (not a phase; its size is not in the totals above): [1 open](./backlog/README.md), 5 SP; 0 archived.
<!-- plan-backlog:end -->

**Order of development** (the owner's decision of 2026-11-03). The framework is developed first; the project it was extracted from, AndLD/bot-rts,
is its first consumer and takes releases to prove them. This table is the only place that says which release a task belongs to and in what order the releases come; a phase file
says only the order inside the phase, and a task only what it needs first. Releases group the tasks:

| Release | Tasks, in order | The first consumer |
| ------- | --------------- | ------------------ |
| `0.1.1` | 3.6, 3.7, 3.8, then 3.11 (the first migration note) | takes it; it closes the consumer's extraction phase |
| `0.1.2` | 3.17, 3.18, 3.3, 3.9, 3.1, 3.2 | skips it on purpose, so that `0.2.0` is the first chained migration |
| `0.2.0-dev.1` | 3.5 (`migrate`), 3.12 (scripts and the migration test), 3.14 (rollback), 3.10 (task files), 3.13 (the issue queue), 3.16 (reports: intake and upstream), 3.15 (probe areas); then Phase 4: 4.1, 4.2, 4.3, 4.4, 4.4a, 4.5, the decision of 4.6 (nothing is built for it before the owner decides), and 4.8 (a note for every version, so that this version has its own) | takes it on a draft pull request, to find what blocks the release |
| `0.2.0-dev.2` | 4.7 (the RFC and risk-register templates; it moves to `0.3.0` if the run of `dev.1` finds a blocker), and the fixes of the blockers that run found (I-2 to I-5, reports 61 to 64); more development versions follow while blockers remain | takes it again when a blocker was fixed |
| `0.2.0-dev.3` | 3.20 (the backlog queue for feature requests), then B-1 (formerly I-6, report 65, a feature request that 3.20 moved to the backlog) and I-1 (report 30) | takes it again |
| `0.2.0` | the final cut of the tasks above, with its note complete from the previous final version | moves its branch to it and finishes the task |
| `0.3.0` | 3.4 (local adapters) | takes it |
| next | Phase 2 (earlier if the repository goes public or a second person uses the framework) | takes it |

Task 3.13 turned this plan's open-ended phase into a normal phase that keeps every id, so the order above stays valid: Phase 3 ends with 3.4 in
`0.3.0`, and its only defect that had not started became issue I-1 of the new queue, under its old id as well (`Formerly: 3.19`).

---

## Resuming work in a new session

"Start Phase N", "Continue Phase N", "Work the issue queue", "Fix I-<n>"; the phrase approves the pull requests of the named phases and issues. The session reads the phase index and the file of its task first, not the other tasks (to work the queue: the [open issues](./issues/README.md) and the file of the issue, never the archive), as the session protocol of the method says.

**Reports from consumers come first.** This repository's switch is `reports.intake: auto` with a limit of 3 (task 3.16): at the session start the hook lists the open reports and those not triaged yet, and the agent triages at most three before other work by the procedure `triage-reports` (never as a new issue before looking for the same or a close problem in the open index, the archive and the open tasks; answers and closings on the host need the owner's approval). The owner pauses the intake at once by `{ "reports": { "intake": "off" } }` in the ignored `harness-profile.local.json`. A release is cut only with the owner's approval, so a session stops when the tasks of a release are merged, and the owner hands the release to the consuming project.

---

## Contents

<!-- plan-contents:start -->
- [Phase 1 — Adoption, presets, examples and the proof (12 SP)](./phases/phase-1-adoption-presets-proof.md)
- [Phase 2 — Security and review automation (17 SP)](./phases/phase-2-security/README.md)
- [Phase 3 — Stabilization, migrations and local adapters (61 SP)](./phases/phase-3-stabilization/README.md)
- [Phase 4 — Reaching and holding the structure of documents (27 SP)](./phases/phase-4-document-extension/README.md)
<!-- plan-contents:end -->
