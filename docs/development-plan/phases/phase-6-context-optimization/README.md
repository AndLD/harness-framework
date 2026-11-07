[← Development plan index](../../README.md)

# Phase 6 — Context optimization for agents and consumers (24 SP)

**Status:** ⬜ Not started · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

Planned with the owner on 2026-11-05, after a measurement of the long session that ran flow 1 (chars divided by four, over a compacted session): tool results were about 148k tokens, 80% of them from shell commands (single results of 8k to 30k characters: a whole migration note, the output of commit and push hooks, a pull request listing), and the agent's own output (commands, pull request bodies, log entries, messages) about 142k tokens more. Everything that enters a session is read again on every later turn, so a long session costs more than its size. The documents of the framework were **not** the main sink (the always-loaded entry file is about 4.4k tokens); the commands, the hooks, the reports and the length of the sessions were. This phase measures that, then cuts it: quiet output by default, output budgets and a short report schema, a restart threshold for the orchestrator, and delegating verbose reading; briefs of the documents only if the measurement shows that documents matter.

**Delivered to consumers.** Like the development plan, the flows and the procedures, everything of this phase is part of what a project that uses the framework gets, not only the framework's own repository: it lives in `core/` (neutral), `tools/`, the adapters and the templates; it is listed in `framework.json` (`distributable`); a project takes it by `harness sync` and gets it from `harness init` when it is new; each task has a migration note that says what a consumer must do (for instance, set the quiet commands in its profile); a consumer fixture of the migration test proves that it reaches a project. What belongs to a runtime (where the transcripts are, how the context is read) is a role of the runtime adapter, so core names no runtime. The framework's own repository takes it the same way (lock mode `self`), and the first consumer's take is the proof (6.8).

**Execution order:** 6.1 first, because it measures and its baseline is the figure every other task is judged by; then 6.2 to 6.6 (6.5 needs 2.7 and 6.1); 6.7 after the audit has shown whether documents matter; 6.8, then 6.9 after the cut of a version that holds 6.8 (the consumer's take and the measurement).

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [6.1](./6.1.md) | `harness flow audit`: where the tokens of a flow went, and the baseline | C2 | 5 | ✅ |
| [6.2](./6.2.md) | Quiet by default: the output of the framework's commands and hooks | C2 | 3 | ✅ |
| [6.3](./6.3.md) | Quiet variants of the stack's commands (lint, typecheck, test, coverage, format) | C2 | 3 | ✅ |
| [6.4](./6.4.md) | Output budgets for agents and a short schema for step reports | C2 | 3 | ✅ |
| [6.5](./6.5.md) | A restart threshold for the orchestrator, and steps paced for the cache | C2 | 3 | ✅ |
| [6.6](./6.6.md) | Delegating verbose reading to a subagent | C2 | 2 | ✅ |
| [6.7](./6.7.md) | Agent briefs and section reads of the documents, decided on the audit's numbers | C3 | 2 | ✅ |
| [6.8](./6.8.md) | The phase reaches consumers: distribution, the notes and a consumer fixture | C2 | 2 | ✅ |
| [6.9](./6.9.md) | The first consumer takes the phase, and the fall is measured | C2 | 1 | ✅ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the task's log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7); a plan without markers leaves the column out.

**Exit criteria:** `harness flow audit` reports where the tokens of a flow went, by tool, by command and by step, from a runtime adapter's transcripts, and a baseline of flow 1 is recorded; the framework's own commands, its hooks and the stack adapters' commands print failures and a one-line summary by default; the procedures state output budgets and the step report has a schema with a cap; a flow setting holds the orchestrator's restart threshold and a restart keeps the state in the log; the decision about briefs of the documents is made on the audit's numbers; a consumer takes the phase by `harness sync` and the comparable steps show a measured fall of tool-result tokens against the baseline (the baseline entry names the aim; a third is the starting aim) with no rise in failed checks or deviations.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 6` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log, `<id>.log.md`, beside its task file.

<!-- The block between the task markers is generated from the task files by `harness plan summary`; edit a task file, not the table. -->
