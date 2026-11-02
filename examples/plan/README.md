# Development plan

The plan of Orbit Notes: phases of tasks, each task one pull request. The method is the plan method of the framework (`core/plan/` there).

**Phase status legend:** ⬜ not started · 🟡 in progress · ✅ done. A phase's status is kept in the summary table and in the phase file, and
is updated in the change that starts or finishes it.

**Task status** is tracked per task in the phase files. Each phase has an append-only **work log** so it can be resumed in a new session.

**Estimation scale:** story points (SP), Fibonacci; 1 SP is about half a developer-day or one focused agent session; estimates include the tests the definition of done requires.

**Summary** (written from the phase files by `harness plan summary`; edit a phase file, not this table)

<!-- plan-summary:start -->
| Phase | Theme | Story points | Agent complexity | Status |
| ----- | ----- | ------------ | ---------------- | ------ |
| 1 | Write and edit notes | 8 | C2 | 🟡 In progress |
|  | **Total of Phase 1** | **8** | | |
<!-- plan-summary:end -->

---

## Scope definition

The first release lets a person write notes in a notebook and find them again. Sharing with a team and search follow in the next phases; real-time editing
by several people at once comes after them.

---

## Resuming work in a new session

"Start Phase N", "Continue Phase N"; the phrase approves the pull requests of the named phases. The session reads the phase file and its work log first (the session protocol of the method).

---

## Contents

<!-- plan-contents:start -->
- [Phase 1 — Write and edit notes (8 SP)](./phases/phase-1-first-notes.md)
<!-- plan-contents:end -->
