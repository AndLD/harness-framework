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
| 1 | Adoption, presets, examples and the proof | 12 | C1–C2 | 🟡 In progress |
| 2 | Security and review automation | 17 | C2–C3 | ⬜ Not started |
| 3 | Issues and stabilization | 0 (grows) | — | ⬜ Not started |
|  | **Total of Phases 1–3** | **29** (Phase 3 grows as issues are added) | | |
<!-- plan-summary:end -->

---

## Resuming work in a new session

"Start Phase N", "Continue Phase N"; the phrase approves the pull requests of the named phases. The session reads the phase file and its work log first (the session protocol of the method).

---

## Contents

<!-- plan-contents:start -->
- [Phase 1 — Adoption, presets, examples and the proof (12 SP)](./phases/phase-1-adoption-presets-proof.md)
- [Phase 2 — Security and review automation (17 SP)](./phases/phase-2-security.md)
- [Phase 3 — Issues and stabilization (0 SP, grows as issues are added)](./phases/phase-3-issues.md)
<!-- plan-contents:end -->
