[← Development plan index](./README.md)

# Releases of harness-framework

The order of the releases and of the tasks in each, which the tools read to choose the next task. A row names tasks and
issues, in order, or "Phase N" for the tasks of a phase in its own order; never a backlog item, which the owner promotes into a task first.

Status: ⬜ planned · 🟡 developing · 🏷 a development version cut · ✅ released.

| Release | Status | Tasks, in order | Consumers | Notes |
| --- | --- | --- | --- | --- |
| `0.1.1` | ✅ | 3.6, 3.7, 3.8, then 3.11 (the first migration note) | takes it; it closes the consumer's extraction phase |  |
| `0.1.2` | ✅ | 3.17, 3.18, 3.3, 3.9, 3.1, 3.2 | skips it on purpose, so that `0.2.0` is the first chained migration |  |
| `0.2.0-dev.1` | ✅ | 3.5 (`migrate`), 3.12 (scripts and the migration test), 3.14 (rollback), 3.10 (task files), 3.13 (the issue queue), 3.16 (reports: intake and upstream), 3.15 (probe areas); then Phase 4: 4.1, 4.2, 4.3, 4.4, 4.4a, 4.5, the decision of 4.6 (nothing is built for it before the owner decides), and 4.8 (a note for every version, so that this version has its own) | takes it on a draft pull request, to find what blocks the release |  |
| `0.2.0-dev.2` | ✅ | 4.7 (the RFC and risk-register templates; it moves to `0.3.0` if the run of `dev.1` finds a blocker), and the fixes of the blockers that run found (I-2 to I-5, reports 61 to 64); more development versions follow while blockers remain | takes it again when a blocker was fixed |  |
| `0.2.0-dev.3` | ✅ | 3.20 (the backlog queue for feature requests), then 3.22 (the probe switch of report 65: issue I-6, then backlog item B-1, built before 3.21 and promoted to this task), I-1 (report 30), and 3.21 (a backlog item is never started as it is: the owner promotes it into a task of a phase first) | takes it again |  |
| `0.2.0` | ✅ | the final cut of the tasks above, with its note complete from the previous final version | moves its branch to it and finishes the task |  |
| `0.3.0` | 🟡 | 3.4 (local adapters), then Phase 5 (the release order in a file of its own, and flows run by an orchestrator; added on 2026-11-04), in the order of its ids | takes it |  |
| next | ⬜ | Phase 2 (earlier if the repository goes public or a second person uses the framework) | takes it |  |

## Not scheduled

- None.

## Notes

The order of development is the owner's decision of 2026-11-03. The framework is developed first; the project it was extracted from, AndLD/bot-rts,
is its first consumer and takes releases to prove them. This file is the only place that says which release a task belongs to and in what order the releases come; a phase file
says only the order inside the phase, and a task only what it needs first. Releases group the tasks. The development versions of `0.2.0` are released with it, and
the status of each row was worked out from its tasks by the migration of `0.3.0` and corrected by hand on 2026-11-04 (the tags `v0.2.0` and `0.2.0-dev.1` to `dev.3` exist).

Task 3.13 turned this plan's open-ended phase into a normal phase that keeps every id, so the order above stays valid: Phase 3 ends with 3.4 in
`0.3.0`, and its only defect that had not started became issue I-1 of the new queue, under its old id as well (`Formerly: 3.19`).
