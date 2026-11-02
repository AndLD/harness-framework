[← Development plan index](../README.md)

# Phase 1 — Adoption, presets, examples and the proof (12 SP)

**Status:** ⬜ Not started · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [phase-1-log](./work-logs/phase-1-log.md), and one fragment per task in `work-logs/phase-1/`

Finishes the first release. The tasks touch nothing in the project the framework was extracted from, so they run here: `harness adopt` for a project with copied harness scripts, the Cursor and Python presets, the examples that a new project receives, and the proof of the design (section 3.4) on a scratch project for every combination. The last task ends with the owner running the Cursor preset in a real Cursor session. When the phase is done, `0.1.0` is tagged and the project that consumes the framework syncs to it (its task 17.16).

| #   | Task | Agent | SP  | Status |
| --- | ---- | ----- | --- | ------ |
| 1.1 | **`harness adopt` (section 6.4)**: A fixture with copied harness scripts (profile under `scripts/`, the four hooks, link and plan scripts, one project check) is adopted: the profile moves and validates, the hooks call the framework, the redundant scripts are reported and not deleted, the project check runs in `harness check all`. | C2 | 3 | ⬜ |
| 1.2 | **Cursor preset**: Native and compat modes (section 9); recorded Cursor event samples; the `.cursorignore` block of `access.denyRead`, regenerated without touching the project's own lines; it passes the suite. The owner's checklist for a real session is written into its README. | C2 | 2 | ⬜ |
| 1.3 | **Python preset, written by following the new-adapter procedure**: uv, pytest with coverage.py, ruff, mypy; `gate.mjs` and `coverage.mjs`; CI templates; it passes the suite. Deviations from the procedure are fixed in the procedure. | C2 | 3 | ⬜ |
| 1.4 | **Examples**: A filled profile of a fictitious project, the product-knowledge skeleton, a sample plan; the bootstrap writes them into a new project's `docs/`. | C1 | 2 | ⬜ |
| 1.5 | **The proof of §3.4**: In a scratch directory outside the repository: bootstrap node-ts with Claude Code, python with Cursor, node-ts and python together with both runtimes (compat mode), and one detached project with a core rule edited; adopt one fixture with copied scripts. On each, `harness check all` and the stack's checks pass, and the harness review method runs (a short targeted review of D1, D3, D6). Recorded in the framework changelog and the task log. **The owner** then runs the Cursor preset in a real Cursor session, with the checklist of 1.2. | C2 | 2 | ⬜ |

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** `harness adopt` works on a fixture, the Cursor and Python presets pass the conformance suite, the examples are written into a new project, the proof of section 3.4 holds for each combination and is recorded in the changelog and the task log, the owner has run the Cursor checklist in a real session, and `0.1.0` is tagged.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 1` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-1/`.
