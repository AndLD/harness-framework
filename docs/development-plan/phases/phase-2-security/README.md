[← Development plan index](../../README.md)

# Phase 2 — Security and review automation (17 SP)

**Status:** ⬜ Not started · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

After `0.1.0`: a security review method next to the code review and the harness review, the automation of what a script can decide, the measurements that harness reviews ran by hand, and an off-plan record for work that no task covers. Planned with the owner on 2026-10-30; the method outline is in section 11.1 of the design.

**Execution order:** when the order of development in the [plan index](../../README.md) says.

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [2.1](./2.1.md) | Security review method | C3 | 5 | ⬜ |
| [2.2](./2.2.md) | Automated security checks | C2 | 3 | ⬜ |
| [2.3](./2.3.md) | Automated review measurements | C2 | 3 | ⬜ |
| [2.4](./2.4.md) | First security review of the framework itself | C3 | 3 | ⬜ |
| [2.5](./2.5.md) | Off-plan record (from the second source) | C2 | 3 | ⬜ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** the security review method, `harness check security` and `harness review measure` work and are tested, the first security review of the framework is written and triaged, and the off-plan record is in the method and the checks.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 2` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-2/`.
