# Development plan

The plan of harness-framework: phases of tasks, each task one pull request. The method is the [plan method](../../core/plan/README.md).

**Phase status legend:** ⬜ not started · 🟡 in progress · ✅ done. A phase's status is kept in the summary table and in the phase file, and
is updated in the change that starts or finishes it.

**Task status** is tracked per task in the phase files. Each phase has an append-only **work log** so it can be resumed in a new session.

**Estimation scale:** story points (SP), Fibonacci; 1 SP is about half a developer-day or one focused agent session; estimates include the tests the definition of done requires.

**Summary** (written from the phase files by `harness plan summary`; edit a phase file, not this table)

<!-- plan-summary:start -->
| Phase | Theme | Story points | Agent complexity | Status |
| ----- | ----- | ------------ | ---------------- | ------ |
| 1 | Adoption, presets, examples and the proof | 12 | C1–C2 | ✅ Done |
| 2 | Security and review automation | 38 | C2–C3 | ⬜ Not started |
| 3 | Stabilization, migrations and local adapters | 71 | C1–C2 | ✅ Done |
| 4 | Reaching and holding the structure of documents | 27 | C1–C2 | 🟡 In progress |
| 5 | Releases in a file of their own, and flows run by an orchestrator | 43 | C2–C3 | ✅ Done |
| 6 | Context optimization for agents and consumers | 24 | C2–C3 | ⬜ Not started |
|  | **Total of Phases 1–6** | **215** | | |
<!-- plan-summary:end -->

<!-- plan-issues:start -->
**Issue queue** (not a phase; its size is not in the totals above): [5 open](./issues/README.md), 6 SP; 21 archived.
<!-- plan-issues:end -->

<!-- plan-backlog:start -->
**Backlog** (proposals the owner has not approved; not a phase, and not in the totals above): [0 proposed](./backlog/README.md); 3 promoted.
<!-- plan-backlog:end -->

**Releases** (the order of the releases and of their tasks is the file [releases](./releases.md), not a section of this index; the line below is written by `harness plan summary`)

<!-- plan-releases:start -->
No release is being developed. Next: `0.5.0` (⬜ planned). The order of the releases and of their tasks: [releases](./releases.md). The flows that run them: [flows](./flows/README.md).
<!-- plan-releases:end -->

---

## Resuming work in a new session

"Start Phase N", "Continue Phase N", "Work the issue queue", "Fix I-<n>", "Run flow N", "Run flows N–M", "Continue flow N"; the phrase approves the pull requests of the named phases and issues, and of a named flow what its settings let its orchestrator decide (the procedure `run-flow`; the flows are in [flows](./flows/README.md)). The session reads the phase index and the file of its task first, not the other tasks (to work the queue: the [open issues](./issues/README.md) and the file of the issue, never the archive), as the session protocol of the method says.

**Reports from consumers come first.** This repository's switch is `reports.intake: auto` with a limit of 3 (task 3.16): at the session start the hook lists the open reports and those not triaged yet, and the agent triages at most three before other work by the procedure `triage-reports` (never as a new issue before looking for the same or a close problem in the open index, the archive and the open tasks; answers and closings on the host need the owner's approval, or that of a flow the owner started at the level its settings give them). The owner pauses the intake at once by `{ "reports": { "intake": "off" } }` in the ignored `harness-profile.local.json`. A release is cut only with the owner's approval, or by a flow the owner started at the level its settings give the cut (the procedure `release`), so a session outside a flow stops when the tasks of a release are merged, and the owner hands the release to the consuming project.

---

## Contents

<!-- plan-contents:start -->
- [Phase 1 — Adoption, presets, examples and the proof (12 SP)](./phases/phase-1-adoption-presets-proof.md)
- [Phase 2 — Security and review automation (38 SP)](./phases/phase-2-security/README.md)
- [Phase 3 — Stabilization, migrations and local adapters (71 SP)](./phases/phase-3-stabilization/README.md)
- [Phase 4 — Reaching and holding the structure of documents (27 SP)](./phases/phase-4-document-extension/README.md)
- [Phase 5 — Releases in a file of their own, and flows run by an orchestrator (43 SP)](./phases/phase-5-release-flows/README.md)
- [Phase 6 — Context optimization for agents and consumers (24 SP)](./phases/phase-6-context-optimization/README.md)
<!-- plan-contents:end -->
