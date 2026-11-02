[← Development plan index](../README.md)

# Phase 1 — Write and edit notes (8 SP)

**Status:** 🟡 In progress · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [phase-1-log](./work-logs/phase-1-log.md), and one fragment per task in `work-logs/phase-1/`

A person can create a notebook, write notes in it and edit them, and see the history of a note. Everything after this phase (sharing, search) builds on the
notes and the notebooks that exist here.

| #   | Task | Agent | SP  | Status |
| --- | ---- | ----- | --- | ------ |
| 1.1 | **Notebooks and notes**: create, rename and delete a notebook; create, edit and delete a note in it (`notes.md`, "Writing a note"). Unit and integration tests, and an end-to-end spec of writing a note. | C2 | 5 | ✅ |
| 1.2 | **History of a note**: every saved change is kept with its author and time, and an earlier version can be restored (`notes.md`, "History"). Tests as above. | C2 | 3 | 🟡 |

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** a person can write a note, change it, see who changed it when, and restore an earlier version; the coverage gate holds.

## Implementation log

Printed from the merged pull requests by `node harness/tools/harness.mjs plan log 1` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-1/`.
