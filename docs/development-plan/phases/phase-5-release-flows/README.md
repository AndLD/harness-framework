[← Development plan index](../../README.md)

# Phase 5 — Releases in a file of their own, and flows run by an orchestrator (43 SP)

**Status:** ⬜ Not started · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

Planned with the owner on 2026-11-04. Today the order of the releases is a section of the plan index, and the owner runs it by hand from a
local list of prompts, one session per step. This phase moves the release order into a file of its own beside the index (5.1) and adds
**flows**: files of the plan, several per project like phases, each an ordered chain of steps that delivers one or more releases, which an
orchestrator agent runs and logs, asking the owner only for the decisions above a threshold (brainstorm) or none (seamless) (5.2, 5.3).
The tools check a flow, recompute its state from the repository and render the prompt of each step (5.4); the runtime adapter starts and
continues the workers (5.5); the orchestrator reads usage before each step, estimates it and improves the estimate from what it measures
(5.6, 5.7); a flow may drive steps in another repository, such as a consuming project (5.8). The framework runs its own next releases as
flows (5.9), and the projects that use it get the templates, the procedure and the tools with `0.3.0`. Parallel steps (waves) are not in
scope; the format keeps room for them.

**Execution order:** when the order of development in the [plan index](../../README.md) says (release `0.3.0`, after 3.4); inside the phase, the order of the ids.

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [5.1](./5.1.md) | The release order in a file of its own (`releases.md`) | C2 | 5 | ⬜ |
| [5.2](./5.2.md) | Flows: files of the plan that an orchestrator runs, with the procedure `run-flow` | C3 | 5 | ⬜ |
| [5.3](./5.3.md) | The authority of a flow: release cuts and answers to reports at their levels | C3 | 3 | ⬜ |
| [5.4](./5.4.md) | `harness flow`: check, status, next and prompt | C2 | 8 | ⬜ |
| [5.5](./5.5.md) | Executors in the runtime-adapter contract, and the reuse of a worker session | C3 | 8 | ⬜ |
| [5.6](./5.6.md) | Usage: read it, estimate each step, and gate the next one | C2 | 5 | ⬜ |
| [5.7](./5.7.md) | Calibrate the usage estimate from what flows used | C2 | 3 | ⬜ |
| [5.8](./5.8.md) | Flows across repositories: one home repository and external ones | C2 | 3 | ⬜ |
| [5.9](./5.9.md) | The first flows of this repository, and a probe of each mode | C2 | 3 | ⬜ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the task's log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** the release order is read from `releases.md` by the tools and the session-start hook, and the plan index links to it; the flow templates, the procedure `run-flow` and the tools `harness flow check`, `status`, `next`, `prompt` and `calibrate` exist with their tests; both runtime adapters pass the conformance suite with their executors; the Git rules and the procedures `release` and `triage-reports` let a flow cut releases and answer reports at its levels, with the owner's approval recorded in the pull request; this repository has its first flows and `harness flow check` passes on them; `0.3.0` is tagged, and its migration note says how a project moves its order of development and starts its first flow.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 5` (every squash commit carries a `Plan: <task id>` line). Each task writes
its own log, `<id>.log.md`, beside its task file.
