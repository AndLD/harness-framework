[← Phase 4](./README.md)

# Phase 4 — work log

Append-only log of the phase-wide matters of this phase (the session protocol of the method): decisions that concern the whole phase, and
pauses. Newest entry at the bottom.

## Entry template

```markdown
### YYYY-MM-DD — short summary
- **Tasks:** x.y, x.z
- **Branch:** `<type>/x.y-slug` — done | WIP (what remains, what is uncommitted or unpushed)
- **Decisions / deviations from the plan:** …
- **Problems / blockers / findings:** …
- **Next step:** the exact next action
- **Verify with:** commands that show the current state is healthy
```

## Entries

### 2026-11-03 — planned, before the closing review of the extraction
- **Tasks:** 4.1 to 4.6 (none started).
- **Branch:** `docs/phase-4-document-extension` — the plan only.
- **Decisions / deviations from the plan:** the owner asked, on 2026-11-03, to write this phase before the closing review (task 17.17 of the project this framework was extracted from), so that the review's findings can name its tasks. The review's probes P8 and P9 (add a phase; put a defect into the open-ended phase) test the gap this phase closes. The phase is provisional until that review. Tasks 3.3 to 3.5 of the open-ended phase come from the same analysis and from 17.16.
- **Problems / blockers / findings:** none.
- **Next step:** wait for the report of that review; then re-read this phase against its findings, record the order in this log, and start 4.1 ("Start Phase 4").
- **Verify with:** `npm run docs:check`

### 2026-11-03 — the closing review is out; task 4.4a added
- **Tasks:** 4.4a added (not started); 4.1 to 4.6 unchanged.
- **Branch:** `docs/claim-and-skill-tasks`
- **Decisions / deviations from the plan:** the closing review of the extraction (AndLD/bot-rts, `docs/quality-reviews/harness/2026-11-03.md`) ran P8 and P9.
  - Both passed with detours that this phase addresses. The P9 probe took the shape of a task from the rows of the open-ended phase, not from the phase
    rules (4.2, 4.3). Three phase files write the exit criteria in a different form (4.2).
  - Its finding H-20261103-03 (the agent cannot load seven of the eight procedures as skills) is added as 4.4a, before 4.5, so that 4.5 measures the block
    with the new values. Phase 4 is now 18 SP.
  - The re-read of this phase against the review (order, "provisional", the decision of 4.6) is still the owner's, at the start of the phase.
  - At the owner's request, 4.5 also says how a probe of another repository runs: as a separate session started there. In the review, the probe of a
    bootstrapped project ran as a subagent, so it inherited the reviewing repository's entry file and got no session-start hook. The size stays 2 SP.
- **Problems / blockers / findings:** none.
- **Next step:** after `0.1.1` (3.6 to 3.8) and the consuming project's sync. The owner re-reads this phase, then "Start Phase 4".
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.10 of Phase 3 comes first
- **Tasks:** none changed here.
- **Branch:** `docs/task-files-plan`
- **Decisions / deviations from the plan:** task 3.10 of Phase 3 makes a phase a folder with a generated index and a file per task. 4.2 (the plan checks
  hold a phase's structure) and 4.3 (the procedure `change-plan`) are written for that layout, so 3.10 is built first and ships in the same `0.2.0`.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged, after 3.10.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — 4.4 takes a version through the migrations
- **Tasks:** 4.4 changed (size unchanged).
- **Branch:** `docs/migration-notes-plan`
- **Decisions / deviations from the plan:** with tasks 3.5, 3.11 and 3.12 of Phase 3, the procedure `update-framework` takes a version across any number
  of versions: `sync`, `harness migrate` when the old `sync` did not start it, the migration notes in order. Tasks 3.5 and 3.12 come before this phase
  with 3.10.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged, after 3.5, 3.12 and 3.10.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — 4.4 verifies a migration; more of Phase 3 comes first
- **Tasks:** 4.4 (2 → 3 SP).
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** `update-framework` ends with a verification: `check all` and the project's gate, the check of every
  required action, and the probes that 3.15 selects, compared with the project's last review; on a failure, `harness rollback` (3.14). Tasks 3.14,
  3.13 and 3.15 of Phase 3 join 3.5, 3.12 and 3.10 before this phase.
- **Problems / blockers / findings:** none. Phase 4 is now 19 SP.
- **Next step:** unchanged, after the Phase 3 tasks of `0.2.0`.
- **Verify with:** `npm run docs:check`

### 2026-11-04 — tasks 4.1 to 4.5 merged; the decision of 4.6 is the owner's, and the development version is next
- **Tasks:** 4.1, 4.2, 4.3, 4.4, 4.4a, 4.5 done (pull requests #49 to #54); 4.6 not started: the decision is brought to the owner first, nothing is built.
- **Branch:** `docs/phase-4-decision-brief` — the record only.
- **Decisions / deviations from the plan:**
  - *The numbers for 4.6.* The `procedures` block of the entry file costs about 23 words a row. This repository's block has 12 rows and 277 words in an entry file of 2454 words; a bootstrapped project's has 10 rows and 233 words in 1973 (about 12 %). The ceilings of the bindings are 16 rows and 400 words (4.5), so there is room for four rows and about 120 words.
  - *The evidence.* The extension probes of the closing review (add a phase; put a defect into the plan) passed with detours that 4.2 (structure checks) and 4.3 (`change-plan`) answer. No probe has run since, and none exists for the other documents: the product knowledge (a glossary term, an open question, a backlog item) and a change of the harness of a project. The product-knowledge documents that have a template (the glossary, the register of open items, the backlog) are held by `check product-knowledge`, so a copy that drifts is found; the specification sections, the RFCs and the risks have no template in the framework. A project can now write the procedures of its own (4.1), as this repository did for `change-framework`.
  - *The options for 4.6.* (A) `record-product-knowledge` and `change-harness`, two rows, about 46 words. (B) one router `extend-document`, one row, about 23 words, that sends the agent from the document map to the template, the rules and the check of a document; it adds a hop. (C) build neither now: run the extension probes (P5 and P6 of the stub, plus one for the product knowledge and one for a change of the harness) on the `0.2.0` development version, and build what the detours name.
  - *Recommendation:* (C), with `record-product-knowledge` as the first one to build if the product-knowledge probe shows a detour (it is the one family whose documents have templates and a check). `change-harness` is better written by each project in its own `paths.procedures`.
- **Problems / blockers / findings:** the dev version has no migration note for `0.2.0` (it is written with the release), so a consuming project that takes `0.2.0-dev.1` is shown the notes of `0.1.1` and `0.1.2` only and no area of the plan format; write `migrations/0.2.0.md` before the development tag, or with it. The probe in which "continue Phase 1" loads `start-task` as a skill (4.4a) and the probes P5 and P6 (4.3, 4.5) were not run by an agent: a headless session could not authenticate.
- **Next step:** the owner decides 4.6 (A, B or C) and cuts `0.2.0-dev.1` (with the note of `0.2.0`); the consuming project takes it and runs the probes.
- **Verify with:** `npm run docs:check`

### 2026-11-04 — task 4.7 added: templates for an RFC and a risk register
- **Tasks:** 4.7 added (not started), 3 SP; Phase 4 is now 22 SP.
- **Branch:** `docs/phase-4-templates-task`
- **Decisions / deviations from the plan:** the discussion of 4.6 found that the framework names an owner for a design record (RFC) and for risks (the plan method) but ships no template for either, so a procedure for them would have nothing neutral to point at. The owner agreed to add the templates as a task of their own, not inside 4.6 (a decision task). It ships in `0.2.0-dev.2`: it is independent of the consuming project's run of `dev.1`, so a framework session builds it while that run goes on; if the run finds a blocker, 4.7 moves to `0.3.0` rather than hold `0.2.0`. The owner does not want the RFC and risk extension probes run now, so the choice among the options of 4.6 stays open and nothing for it is built.
- **Problems / blockers / findings:** none.
- **Next step:** the owner cuts `0.2.0-dev.1` (with the note of `0.2.0`); a framework session does 4.7 meanwhile.
- **Verify with:** `npm run docs:check`

### 2026-11-04 — task 4.8 added: a migration note for every version, development versions included
- **Tasks:** 4.8 added (not started), 5 SP; Phase 4 is now 27 SP.
- **Branch:** `docs/phase-4-dev-notes-task`
- **Decisions / deviations from the plan:** the note of a version was written at the final cut, after the development version, so `0.2.0-dev.1` had none and the tools did not require it. The owner chose a note per version, development versions included, over one note extended between development versions: a shipped note is never changed under a project that followed it. The tools know only `x.y.z` notes today, so 4.8 teaches `migrate` and `release` the development notes and makes the release refuse a version without its note; it comes before `0.2.0-dev.1`, whose note is its first use. The final note stays the complete story from the previous final version and the scripts stay per final version.
- **Problems / blockers / findings:** none.
- **Next step:** a framework session does 4.8; then the owner cuts `0.2.0-dev.1`.
- **Verify with:** `npm run docs:check`
