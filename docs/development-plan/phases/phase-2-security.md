[← Development plan index](../README.md)

# Phase 2 — Security and review automation (17 SP)

**Status:** ⬜ Not started · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [phase-2-log](./work-logs/phase-2-log.md), and one fragment per task in `work-logs/phase-2/`

After `0.1.0`: a security review method next to the code review and the harness review, the automation of what a script can decide, the measurements that harness reviews ran by hand, and an off-plan record for work that no task covers. Planned with the owner on 2026-10-30; the method outline is in section 11.1 of the design.

**Execution order:** when the order of development in the [plan index](../README.md) says.

| #   | Task | Agent | SP  | Status |
| --- | ---- | ----- | --- | ------ |
| 2.1 | **Security review method**: `core/reviews/security/README.md` (dimensions S1 to S6 of section 11.1, scoring, procedure, findings, cadence) and `_template.md`, a bindings template, and the procedure `security-review`, packaged per runtime. The code review's security dimension (C7) links to it instead of repeating it. The CORE scan returns 0 on the new files. | C3 | 5 | ⬜ |
| 2.2 | **Automated security checks**: `harness check security`: a secret scan of the tracked files and of the history range of a push, with its patterns in the profile and no download; the dependency audit as a new optional stack role (`npm audit`, `pip-audit`); the host's CI checks (workflow `permissions:` declared, third-party actions pinned to a commit, no `pull_request_target` that checks out the head); and the runtime's settings checks (the `access.denyRead` rules present, no broad allow rule for shell or edits). Each check has tests with a planted defect. | C2 | 3 | ⬜ |
| 2.3 | **Automated review measurements**: `harness review measure` prints the measurements that four harness reviews ran by hand: words and normative words in the always-loaded set, rule-map statuses, the reference direction between layers, unreachable files and the highest fan-out, against the budgets of the bindings. The harness review method cites the command instead of the shell lines. Verified against the numbers of the last report on the same commit. | C2 | 3 | ⬜ |
| 2.4 | **First security review of the framework itself**: A report in the framework repository by the method of 2.1, on S1 to S4 (the framework has no product runtime, so S5 and S6 are "not applicable" with the reason), its findings triaged. | C3 | 3 | ⬜ |
| 2.5 | **Off-plan record (from the second source)**: Work that no task covers (documentation, tooling, CI, plan changes merged without a `Plan: <task id>` line) gets a record in its own pull request: what changed, why and who asked, and what it leaves to do. Unlike the second source's single append-only file, each record is a **fragment** (one file per pull request, like the changelog fragments), so parallel pull requests never edit the same lines; `harness plan log --off-plan` prints them in order. The core method states the rule ("nothing merges without a record: a task's log, a phase's log or an off-plan fragment"), and a check lists merged pull requests without a `Plan:` line and without a fragment. Tests with a fixture history. | C2 | 3 | ⬜ |

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** the security review method, `harness check security` and `harness review measure` work and are tested, the first security review of the framework is written and triaged, and the off-plan record is in the method and the checks.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 2` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-2/`.
