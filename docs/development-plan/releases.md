[← Development plan index](./README.md)

# Releases of harness-framework

The order of the releases and of the tasks in each, which the tools read to choose the next task. A row names tasks and
issues, in order, or "Phase N" for the tasks of a phase in its own order; never a backlog item, which the owner promotes into a task first.

Status: ⬜ planned · 🟡 developing · 🏷 a development version cut · ✅ released · ⏭ skipped on purpose.

| Release | Status | Tasks, in order | Consumers | Notes |
| --- | --- | --- | --- | --- |
| `0.1.1` | ✅ | 3.6, 3.7, 3.8, then 3.11 (the first migration note) | takes it; it closes the consumer's extraction phase |  |
| `0.1.2` | ✅ | 3.17, 3.18, 3.3, 3.9, 3.1, 3.2 | skips it on purpose, so that `0.2.0` is the first chained migration |  |
| `0.2.0-dev.1` | ✅ | 3.5 (`migrate`), 3.12 (scripts and the migration test), 3.14 (rollback), 3.10 (task files), 3.13 (the issue queue), 3.16 (reports: intake and upstream), 3.15 (probe areas); then Phase 4: 4.1, 4.2, 4.3, 4.4, 4.4a, 4.5, the decision of 4.6 (nothing is built for it before the owner decides), and 4.8 (a note for every version, so that this version has its own) | takes it on a draft pull request, to find what blocks the release |  |
| `0.2.0-dev.2` | ✅ | 4.7 (the RFC and risk-register templates; it moves to `0.3.0` if the run of `dev.1` finds a blocker), and the fixes of the blockers that run found (I-2 to I-5, reports 61 to 64); more development versions follow while blockers remain | takes it again when a blocker was fixed |  |
| `0.2.0-dev.3` | ✅ | 3.20 (the backlog queue for feature requests), then 3.22 (the probe switch of report 65: issue I-6, then backlog item B-1, built before 3.21 and promoted to this task), I-1 (report 30), and 3.21 (a backlog item is never started as it is: the owner promotes it into a task of a phase first) | takes it again |  |
| `0.2.0` | ✅ | the final cut of the tasks above, with its note complete from the previous final version | moves its branch to it and finishes the task |  |
| `0.3.0-dev.1` | ✅ | no task of its own: the tasks of `0.3.0` below, cut early as a development version (the owner's decision of 2026-11-05, flow 1) so that the consumer runs its checks before the final tag exists | takes it on a draft pull request, to find what blocks the release |  |
| `0.3.0-dev.2` | ✅ | I-12 and I-13, the fixes of what the take of `0.3.0-dev.1` found (the owner's decision of 2026-11-05, flow 1) | takes it again, to prove the fixes before the final tag |  |
| `0.3.0-dev.3` | ✅ | I-15, the fix of what the take of `0.3.0-dev.2` found (the owner's decision of 2026-11-05, flow 1) | takes it again, to prove the fix before the final tag |  |
| `0.3.0` | ✅ | 3.4 (local adapters), then Phase 5 (the release order in a file of its own, and flows run by an orchestrator; added on 2026-11-04), in the order of its ids, and I-11 (the permissions of a worker on the command line, which flow 1 needs; added on 2026-11-05), then I-12 and I-13 (the findings of the first take of `0.3.0-dev.1`, which the consumer's run found; added on 2026-11-05), then I-15 (the finding of the second take, the migration reading ids from a mere mention; added on 2026-11-05 at the owner's decision) | takes it | Tagged `v0.3.0` (merge commit `0de995f` on `main`) on 2026-11-05. The consumer's take is the open pull request "chore(framework): take 0.3.0" of AndLD/bot-rts (#300), not merged: that repository's owner decides, and its lock names `0.2.0` until it merges. Its development takes are the drafts "take 0.3.0-dev.1" to "take 0.3.0-dev.3" (#297 to #299). |
| `0.4.0` | ⬜ | 2.7 (workers of a flow as nested sessions), 2.6 (the write-permission switch), 2.3 (review measurements), 2.5 (the off-plan record), then the open issues of the queue, in the order of how much they cost a flow when it runs: I-18, I-7, I-17, I-14, I-16 | takes it | the owner named the version and scheduled the issues on 2026-11-05; the security tasks of Phase 2 moved to `0.5.0` the same day; flow 2 runs it |
| `0.5.0` | ⬜ | 2.1 (the frame of the security review method), 2.8 (probes for the project and its supply chain), 2.9 (probes and attack scenarios for the product), 2.2 (automated security checks), 2.4 (the first security review of the framework), 2.10 (security rules of core from its findings) | takes it, and may run the method on its own project | named by the owner on 2026-11-05 (the security methodology of Phase 2, reshaped the same day); flow 3 runs it |

## Not scheduled

- None.

## Notes

The order of development is the owner's decision of 2026-11-03. The framework is developed first; the project it was extracted from, AndLD/bot-rts,
is its first consumer and takes releases to prove them. This file is the only place that says which release a task belongs to and in what order the releases come; a phase file
says only the order inside the phase, and a task only what it needs first. Releases group the tasks. The development versions of `0.2.0` are released with it, and
the status of each row was worked out from its tasks by the migration of `0.3.0` and corrected by hand on 2026-11-04 (the tags `v0.2.0` and `0.2.0-dev.1` to `dev.3` exist).

Task 3.13 turned this plan's open-ended phase into a normal phase that keeps every id, so the order above stays valid: Phase 3 ends with 3.4 in
`0.3.0`, and its only defect that had not started became issue I-1 of the new queue, under its old id as well (`Formerly: 3.19`).
