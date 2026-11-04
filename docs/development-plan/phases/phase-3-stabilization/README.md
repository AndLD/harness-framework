[← Development plan](../../README.md)

# Phase 3 — Stabilization, migrations and local adapters (61 SP)

**Status:** 🟡 In progress · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

What the framework needed after its first release and its first consumer: the fixes found while taking `0.1.0`, the way a version is taken (`sync`,
`migrate`, migration scripts and notes, rollback), the layout of the plan itself, the intake of reports, and local adapters. It was the open-ended phase of the
plan until task 3.13; it is a normal phase now, keeps every id, and ends with 3.4. The defects and improvements found in use are issues of the
[issue queue](../../issues/README.md).

**Execution order:** **not the order of the table.** Work the earliest release in the order of development of the [plan index](../../README.md) that is not finished, in the order of its row; a task of a later release waits, even when its id is lower.

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [3.1](./3.1.md) | `repository.url` is not filled by the bootstrap | C1 | 1 | ✅ |
| [3.2](./3.2.md) | A new Python project is red in CI until `uv.lock` exists | C1 | 1 | ✅ |
| [3.3](./3.3.md) | The command line and the runtime hooks do nothing, with exit code 0, when started through a symbolic link | C1 | 2 | ✅ |
| [3.4](./3.4.md) | Adapters of a project's own repository (`local:`) | C2 | 5 | ⬜ |
| [3.5](./3.5.md) | `harness sync` generates the managed files with the tools of the old version | C2 | 2 | ✅ |
| [3.6](./3.6.md) | The framework's own CORE scan knows only the tools of its adapters | C1 | 1 | ✅ |
| [3.7](./3.7.md) | A pinned project does not scan its copy of `core/` with its own terms | C2 | 3 | ✅ |
| [3.8](./3.8.md) | A leak found by a consumer has no path into the framework, and blocks that consumer until a release fixes it | C2 | 2 | ✅ |
| [3.9](./3.9.md) | The claim rule does not say who owns a claim after its session ends | C2 | 3 | ✅ |
| [3.10](./3.10.md) | A phase is one long file, and a finished task is logged twice | C2 | 6 | ✅ |
| [3.11](./3.11.md) | A consumer has no instructions for taking a new version, and many will skip versions | C2 | 3 | ✅ |
| [3.12](./3.12.md) | Migration scripts, run in order, and a test that every old version migrates | C2 | 3 | ✅ |
| [3.13](./3.13.md) | The issues found in use are kept as a phase, though they are not one | C2 | 7 | ✅ |
| [3.14](./3.14.md) | A migration cannot be undone exactly | C2 | 2 | ✅ |
| [3.15](./3.15.md) | A migration is not checked for what it does to an agent | C2 | 2 | ✅ |
| [3.16](./3.16.md) | Reports from users are neither taken in nor sent upstream by any procedure | C2 | 6 | ✅ |
| [3.17](./3.17.md) | The Git guard checks the project's branch, not the branch of the repository a command acts on | C2 | 2 | ✅ |
| [3.18](./3.18.md) | Nothing merges a green pull request unless someone comes back, and a consumer is never set up for it | C2 | 5 | ✅ |
| [3.20](./3.20.md) | A feature request from a user has no place in the plan but the issue queue, which is for defects | C2 | 5 | ✅ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done.

**Exit criteria:** every task of the table is done; the last one is 3.4 (local adapters).

## Implementation log

Printed from the merged pull requests by `harness plan log 3` (every squash commit carries a `Plan: <task id>` line).
