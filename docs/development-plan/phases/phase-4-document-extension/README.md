[← Development plan index](../../README.md)

# Phase 4 — Reaching and holding the structure of documents (27 SP)

**Status:** 🟡 In progress · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

Planned on 2026-11-03 from an analysis of the documents that a project edits or extends, and of how an agent reaches their templates and rules. The finding: the templates and rules are in the framework, but an agent reaches them only by following three links from the entry file, and `check plan` holds the structure of a phase file only in part, so "add a phase" or "put a defect into the plan" can end in a copy of an old phase that carries its drift. This phase gives a project procedures of its own (4.1), makes the plan checks hold the structure (4.2), adds the two procedures that the analysis ranked first (4.3, 4.4), measures what the procedures cost in the always-loaded entry file (4.5), and leaves the rest to a decision after the data (4.6).

**Provisional.** The sizes are estimates, and the order and the content are reviewed after the closing review of the extraction (task 17.17 of the project this framework was extracted from), whose probes P8 and P9 test exactly this gap; its findings may add, drop or reorder tasks. Nothing here is built before that review.

**Execution order:** when the [plan index](../../README.md) (its order of development) says; it needs tasks of Phase 3 first: 4.2 and 4.3 the layout of 3.10 and the queue of 3.13, 4.4 the migrations of 3.5, 3.12 and 3.14 and the probe areas of 3.15. Inside the phase: 4.1 to 4.6 (with 4.4a) in the order of the table. 4.7 was added on 2026-11-04 (the templates that 4.6 would need for an RFC and a risk): it does not depend on 4.6 and ships in `0.2.0-dev.2`. 4.8 was added the same day (a migration note for every version, development versions included): it must be done before `0.2.0-dev.1` is cut.

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [4.1](./4.1.md) | `paths.procedures`: a project's own procedures | C2 | 3 | ✅ |
| [4.2](./4.2.md) | Structure checks for the plan | C2 | 3 | ✅ |
| [4.3](./4.3.md) | Procedure `change-plan` | C1 | 2 | ✅ |
| [4.4](./4.4.md) | Procedure `update-framework` | C1 | 3 | ✅ |
| [4.4a](./4.4a.md) | The agent cannot load most procedures as skills | C2 | 2 | ✅ |
| [4.5](./4.5.md) | Measure and budget the procedures block; default probes | C1 | 2 | ✅ |
| [4.6](./4.6.md) | The next procedures, decided after the closing review | C2 | 4 | ⬜ |
| [4.7](./4.7.md) | Templates for an RFC and a risk register | C2 | 3 | ⬜ |
| [4.8](./4.8.md) | A migration note for every version, development versions included | C2 | 5 | ✅ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** a project can add procedures of its own; `harness check plan` holds the structure of a phase file as the plan method states it; an agent asked to add a phase or to put a defect into the plan reads the template and the rules first (the extension probes pass on a scratch project); the cost of the procedures in the entry file is measured and budgeted; every version, development ones included, has a migration note of its own (4.8); the RFC and risk-register templates exist (4.7); the decision of 4.6 is recorded; `0.2.0` is tagged.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 4` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-4/`.
