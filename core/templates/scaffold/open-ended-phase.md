[← Development plan]({{rel:paths.planIndex}})

# Phase {{plan.openEndedPhaseNumber}} — Issues and stabilization (0 SP, grows as issues are added)

**Status:** ⬜ Not started · **Work log:** `log.md`, and a log beside each task (`<id>.log.md`)

The open-ended phase: a defect or an improvement found in use becomes a task of this phase (the Git rules of the entry file), and its size
grows with its tasks. Each task is a file of its own in this folder (`<id>.md`, from the framework's task template), and the planned phases of the
project get folders next to this one.

<!-- phase-tasks:start -->
{{#if plan.complexity.scale}}
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
{{/if}}
{{#unless plan.complexity.scale}}
| # | Task | SP | Status |
| - | ---- | -- | ------ |
{{/unless}}
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the task's log) · ✅ done.

**Exit criteria:** none; the phase stays open.

## Implementation log

Printed from the merged pull requests by `harness plan log {{plan.openEndedPhaseNumber}}` (every squash commit carries a `Plan: <task id>` line).
