[← Development plan index](../../README.md)

# Phase 2 — Security and review automation (38 SP)

**Status:** 🟡 In progress · **Branches:** see the [implementation log](#implementation-log) · **Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)

After `0.1.0`: a security review method next to the code review and the harness review, written for a project to review itself, with a researched and growing catalogue of probes and attack scenarios behind it (from the OWASP lists and testing guides, supply-chain and agent-security work, each probe with its sources); the automation of what a script can decide; security rules of core distilled from the findings of the first review, so that each review leaves the projects safer; the measurements that harness reviews ran by hand; and an off-plan record for work that no task covers. Reshaped with the owner on 2026-11-05 (tasks 2.8 to 2.10). Planned with the owner on 2026-10-30; the method outline is in section 11.1 of the design.

**Execution order:** when the release order in [`releases.md`](../../releases.md) says.

<!-- phase-tasks:start -->
| # | Task | Agent | SP | Status |
| - | ---- | ----- | -- | ------ |
| [2.1](./2.1.md) | Security review method: the frame, the probe format and the rules of engagement | C3 | 5 | ✅ |
| [2.2](./2.2.md) | Automated security checks | C2 | 3 | ✅ |
| [2.3](./2.3.md) | Automated review measurements | C2 | 3 | ✅ |
| [2.4](./2.4.md) | First security review of the framework itself | C3 | 3 | ✅ |
| [2.5](./2.5.md) | Off-plan record (from the second source) | C2 | 3 | ✅ |
| [2.6](./2.6.md) | A switch that lets an agent write the plan's files without a prompt | C2 | 3 | ✅ |
| [2.7](./2.7.md) | A flow starts its workers as nested sessions, and logs why when it uses the command line | C3 | 3 | ✅ |
| [2.8](./2.8.md) | Security probe catalogue for the project and its supply chain (S1 to S4) | C3 | 5 | ✅ |
| [2.9](./2.9.md) | Security probe catalogue and attack scenarios for the product (S5 and S6) | C3 | 5 | ✅ |
| [2.10](./2.10.md) | Security rules of core, distilled from the first review | C3 | 3 | ✅ |
| [2.11](./2.11.md) | A nested worker session asks no more than a worker on the command line under the same settings | C3 | 2 | ✅ |
<!-- phase-tasks:end -->

Task status: ⬜ not started · 🟡 in progress (branch noted in the work log) · ✅ done. Agent: the task's agent-complexity marker (plan method, section 7).

**Exit criteria:** the security review method and its probe catalogue (project and product levels, with attack scenarios and rules of engagement) are in core, each probe with its sources and an independent pass logged; `harness check security` and `harness review measure` work and are tested; the first security review of the framework is written and triaged; a short set of security rules distilled from its findings is in core, each tied to a check or a probe; and the off-plan record is in the method and the checks.

## Implementation log

Printed from the merged pull requests by `node tools/harness.mjs plan log 2` (every squash commit carries a `Plan: <task id>` line). Each task writes its own log fragment in `work-logs/phase-2/`.
