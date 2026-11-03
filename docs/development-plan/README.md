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
| 3 | Stabilization, migrations and local adapters | 56 | C1–C2 | 🟡 In progress |
| 4 | Reaching and holding the structure of documents | 19 | C1–C2 | ⬜ Not started |
|  | **Total of Phases 1–4** | **104** | | |
<!-- plan-summary:end -->

<!-- plan-issues:start -->
**Issue queue** (not a phase; its size is not in the totals above): [1 open](./issues/README.md), 2 SP; 0 archived.
<!-- plan-issues:end -->

**Order of development** (the owner's decision of 2026-11-03). The framework is developed first; the project it was extracted from, AndLD/bot-rts,
is its first consumer and takes releases to prove them. This table is the only place that says which release a task belongs to and in what order the releases come; a phase file
says only the order inside the phase, and a task only what it needs first. Releases group the tasks:

| Release | Tasks, in order | The first consumer |
| ------- | --------------- | ------------------ |
| `0.1.1` | 3.6, 3.7, 3.8, then 3.11 (the first migration note) | takes it; it closes the consumer's extraction phase |
| `0.1.2` | 3.17, 3.18, 3.3, 3.9, 3.1, 3.2 | skips it on purpose, so that `0.2.0` is the first chained migration |
| `0.2.0` | 3.5 (`migrate`), 3.12 (scripts and the migration test), 3.14 (rollback), 3.10 (task files), 3.13 (the issue queue), 3.16 (reports: intake and upstream), 3.15 (probe areas), then Phase 4 | takes the development version before the final tag, then the release |
| `0.3.0` | 3.4 (local adapters) | takes it |
| next | Phase 2 (earlier if the repository goes public or a second person uses the framework) | takes it |

**Not scheduled:** issue I-1 (formerly task 3.19: the framework's tests that `harness sync` copies fail in a pinned project; [issue 30](https://github.com/AndLD/harness-framework/issues/30)) is a known defect of the [issue queue](./issues/README.md) that belongs to no release yet; the owner puts it into one when it is to be done.

Task 3.13 turned this plan's open-ended phase into a normal phase that keeps every id, so the order above stays valid: Phase 3 ends with 3.4 in
`0.3.0`, and its only defect that had not started became issue I-1 of the new queue, under its old id as well (`Formerly: 3.19`).

---

## Resuming work in a new session

"Start Phase N", "Continue Phase N", "Work the issue queue", "Fix I-<n>"; the phrase approves the pull requests of the named phases and issues. The session reads the phase index and the file of its task first, not the other tasks (to work the queue: the [open issues](./issues/README.md) and the file of the issue, never the archive), as the session protocol of the method says.

**Reports from consumers come first**, until task 3.16 replaces this with a procedure and switches. Before other work, unless the owner has paused intake, a session lists the open issues of this repository (`gh issue list`) and triages at most three of them. It never adds a report as a new task before it looks for the same or a close problem already recorded (the open index of the issue queue and its archive, titles and areas first and then the files of the candidates, and the open tasks of the phases): the same problem is added to the `Reported:` line of that issue, not added again; a close one becomes an issue that names the related one; a confirmed new defect becomes an issue of the queue, done before the next task of the order and closing the report by its pull request. Answers and closings on the host need the owner's approval. A release is cut only with the owner's approval, so a session stops when the tasks of a release are merged, and the owner hands the release to the consuming project.

---

## Contents

<!-- plan-contents:start -->
- [Phase 1 — Adoption, presets, examples and the proof (12 SP)](./phases/phase-1-adoption-presets-proof.md)
- [Phase 2 — Security and review automation (17 SP)](./phases/phase-2-security/README.md)
- [Phase 3 — Stabilization, migrations and local adapters (56 SP)](./phases/phase-3-stabilization/README.md)
- [Phase 4 — Reaching and holding the structure of documents (19 SP)](./phases/phase-4-document-extension/README.md)
<!-- plan-contents:end -->
