[← Development plan](../README.md)

# Phase 3 — Issues and stabilization (2 SP, grows as issues are added)

**Status:** ⬜ Not started · **Work log:** [phase-3-log](./work-logs/phase-3-log.md)

The open-ended phase: a defect or an improvement found in use becomes a task of this phase (the Git rules of the entry file), and its size
grows with its tasks. The planned phases of the project get files of their own next to this one.

| #   | Task | Agent | SP  | Status |
| --- | ---- | ----- | --- | ------ |
| 3.1 | **`repository.url` is not filled by the bootstrap**: a new project's profile has the slug but no web address, so `harness release` writes `undefined` into the compare and tag links of the changelog (found cutting `0.1.0`; worked around in this repository's own profile). The host adapter gives the address from the slug and the host; a test bootstraps a project and releases it. | C1 | 1 | ⬜ |
| 3.2 | **A new Python project is red in CI until `uv.lock` exists**: the scaffold cannot write a lock file, and `mypy .` exits 2 on a project with no Python file. Say so in the next steps of the bootstrap and in the project's stack file, or scaffold a first module that makes both pass (found in the proof, 1.3 and 1.5). | C1 | 1 | ⬜ |

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done.

**Exit criteria:** none; the phase stays open.

## Implementation log

Printed from the merged pull requests by `harness plan log 3` (every squash commit carries a `Plan: <task id>` line).
