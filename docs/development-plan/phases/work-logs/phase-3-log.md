[← Phase 3](../phase-3-issues.md)

# Phase 3 — work log

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

### 2026-11-03 — tasks 3.3 to 3.5 added
- **Tasks:** 3.3, 3.4, 3.5 (none started).
- **Branch:** `docs/phase-4-document-extension`
- **Decisions / deviations from the plan:** three issues of the consuming project's tasks 17.14 and 17.16 are recorded here as open tasks: the symbolic-link guard of the command line and the hooks (3.3), the missing adapters of a project's own repository (3.4, the owner decides whether to build it), and the sync that generates with the old tools (3.5).
- **Problems / blockers / findings:** none.
- **Next step:** none of them blocks Phase 4; pick them up as issues are, in the order of the owner.
- **Verify with:** `npm run docs:check`


### 2026-11-03 — tasks 3.6 to 3.8 added: the CORE scan of a consuming project
- **Tasks:** 3.6, 3.7, 3.8 (none started).
- **Branch:** `docs/core-scan-tasks`
- **Decisions / deviations from the plan:** the closing review of the extraction (AndLD/bot-rts, `docs/quality-reviews/harness/2026-11-03.md`, finding H-20261103-01)
  found that nothing automated scans the framework's `core/` with a consuming project's terms. In pinned mode the project skips the scan, and the framework's
  own lists have no product words. The owner chose two fixes:
  - B (3.6): a broader tool-name list in the framework itself, which catches tools before a release;
  - A (3.7, 3.8): the scan in the consuming project, with the words of that project.

  A is extended so that it works when other people use the framework. Their word lists stay in their own repositories, and false alarms on the framework's
  own vocabulary are excluded. A consumer is not blocked while a fix is on its way, and a confirmed leak reaches the framework as a defect and a patch release.
- **Problems / blockers / findings:** none. Phase 3 is now 15 SP.
- **Next step:** 3.6 and 3.7, then 3.8, in a patch release (`0.1.1`). The consuming project syncs to it, which closes its Phase 17 ("no regression" of the extraction).
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.9 added: who owns a claim after its session ends
- **Tasks:** 3.9 (not started).
- **Branch:** `docs/claim-and-skill-tasks`
- **Decisions / deviations from the plan:** finding H-20261103-02 of the closing review of the extraction (AndLD/bot-rts): the claim rule of method §6 and §7
  does not say whether a resuming session may continue a task that its own earlier session claimed. The owner asked to plan it. It comes before a second
  person or agent works on a project, since it is the rule that keeps two agents off one task.
- **Problems / blockers / findings:** none. Phase 3 is now 17 SP.
- **Next step:** after 3.6 to 3.8 (`0.1.1`), with the other defects of the phase.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.10 added: one source for the work logs
- **Tasks:** 3.10 (not started).
- **Branch:** `docs/claim-and-skill-tasks`
- **Decisions / deviations from the plan:** the owner asked to plan it after the closing review of the extraction (AndLD/bot-rts, H-20261103-05).
  - Agents log every finished task twice, in its fragment and in the phase log, because the session-start hook reads the "next step" only from the phase log.
  - A resuming agent reads the rows of finished tasks it does not need.
  - The consuming project keeps its routine probe budget and records this task as the reason P2 is over it.
- **Problems / blockers / findings:** none. Phase 3 is now 20 SP.
- **Next step:** after 3.6 to 3.8 (`0.1.1`), with the other defects of the phase.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.10 widened: a file per task and a generated phase index
- **Tasks:** 3.10 (not started), from 3 to 6 SP.
- **Branch:** `docs/task-files-plan`
- **Decisions / deviations from the plan:** the owner asked to split every open phase into an index and a file per task, here, in the templates and in
  the consuming project. That is the same problem as 3.10 (a resuming agent reads what it does not need; finished tasks are logged twice), so 3.10 now
  holds both.
  - A task's description and its log stay in separate files, side by side. In the consuming project's Phase 17 a task's log averages 831 words and its
    description 125, and most readers need only the description; the description is also edited by planning, the log only by the task's session.
  - The phase index is generated from the task files, so that two agents finishing different tasks never edit one file.
  - A split command migrates a project's open phases; finished phases keep the one-file layout.
  - It ships in `0.2.0`, before 4.2 and 4.3 of Phase 4.
- **Problems / blockers / findings:** none. Phase 3 is now 23 SP.
- **Next step:** 3.6 to 3.8 first (`0.1.1`); then 3.10 at the start of the work toward `0.2.0`.
- **Verify with:** `npm run docs:check`
