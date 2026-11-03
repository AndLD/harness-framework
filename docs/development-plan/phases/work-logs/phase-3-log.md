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

### 2026-11-03 — 3.10: the split command rewrites the links
- **Tasks:** 3.10 (not started); its size stays 6 SP.
- **Branch:** `docs/3.10-rewrite-links`
- **Decisions / deviations from the plan:** the consuming project (AndLD/bot-rts, its task 12.7) will also split a finished phase, Phase 17, at the
  owner's request, as the example of a large phase in the new layout. 24 of its files link to that phase. So the split command rewrites every link into
  the phase and its logs, anchors included, and its tests prove that no link is left broken.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged: 3.6 to 3.8 first (`0.1.1`); then 3.10 at the start of the work toward `0.2.0`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — migrations: tasks 3.11 and 3.12; 3.5 and 3.10 adjusted; the release order
- **Tasks:** 3.11 and 3.12 added (not started); 3.5 and 3.10 changed (sizes unchanged).
- **Branch:** `docs/migration-notes-plan`
- **Decisions / deviations from the plan:** the owner expects many consumers to skip versions (from `0.1.0` straight to `0.3.0`, or wider), so the
  framework carries the migration, not the consumer's plan.
  - 3.11: a migration note for every version from the previous one, in a fixed shape; no release without it. Part of `0.1.1`.
  - 3.12: migration scripts for the mechanical changes, run in version order with the target's tools, recorded in the lock; a migration test from
    every released tag. Part of `0.2.0`.
  - 3.5 gets its fix: `sync` places the files and `harness migrate` (new tools, new process) runs the scripts and regenerates; it comes before 3.12.
  - 3.10's split is the first migration script; the split command stays for a phase split by choice.
  - The release order is in the plan index; the consuming project skips `0.1.2` on purpose.
- **Problems / blockers / findings:** none. Phase 3 is now 28 SP.
- **Next step:** 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — the issue queue, rollback, probe areas, local adapters; the release order
- **Tasks:** 3.13, 3.14 and 3.15 added; 3.4 rewritten as a build task (3 → 5 SP); 3.11 extended (2 → 3 SP). None started.
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** the owner's decisions, recorded as tasks so that none depends on a conversation:
  - **3.13, the issue queue.** The open-ended phase is not a phase (no goal, no end, a size that grows, a number in the sequence). It becomes an
    unnumbered queue next to the phases, and finished issues move to an archive, so the queue holds only work to do.
    - A move never renames a planned task: the old open-ended phase becomes a normal phase that keeps every id; only defects not yet started become
      issues, under their old ids too; a task in progress never moves. So the order of development, written by id, survives; `check plan` fails on
      an order that names a task that exists nowhere.
    - Here, Phase 3 becomes a normal phase that ends with 3.4 in `0.3.0`.
  - **3.14, rollback.** A copy of `docs/` and `harness/` would miss what a migration changes elsewhere (`AGENTS.md`, the skills, the profile file, the
    lock, the hooks), so it could not restore a project exactly. Rollback goes through Git: a recorded starting commit, the tool's changes in one
    commit, `harness rollback`, and a test that requires an empty diff.
  - **3.15, probe areas.** Probes belong to each project, so a note cannot name them. Notes list the areas a version touched (3.11); probes name the
    areas they exercise; `update-framework` reruns those that meet.
  - **3.4, local adapters.** The owner keeps the feature: it is built in `0.3.0`, after the migrations, which must leave local adapters alone and test
    them against a changed contract.
  - **The release order** (plan index): `0.1.1` = 3.6, 3.7, 3.8, 3.11; `0.1.2` = 3.3, 3.9, 3.1, 3.2; `0.2.0` = 3.5, 3.12, 3.14, 3.10, 3.13, 3.15,
    then Phase 4; `0.3.0` = 3.4; then Phase 2.
- **Problems / blockers / findings:** none. Phase 3 is now 41 SP.
- **Next step:** 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — the release order has one home
- **Tasks:** 3.4, 3.5, 3.10, 3.11, 3.12, 3.13, 3.14 and 3.15 reworded (sizes unchanged).
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** the owner agreed to keep each fact once. The release of a task and the order of releases are only in the
  plan index's order of development; a phase file says only the order inside it; a task row says only what it needs first ("Needs 3.7 first"), a
  fact about the work that the parallel-work measurements use. The rows lost their "Part of `0.x`"; Phases 2 and 4 point to the plan index.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — reports from consumers come first
- **Tasks:** none changed.
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** the owner runs one session per repository: this one builds and releases, the consuming project (AndLD/bot-rts)
  takes releases. Its defects reach this repository as issues; the plan index ("Resuming work") makes a session list them first and turn each into a
  task here. A session stops when a release's tasks are merged, since cutting a release needs the owner.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.16: reports, their switches, and duplicates
- **Tasks:** 3.16 added (not started); 3.13 extended (6 → 7 SP).
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** the owner's decisions:
  - Taking in reports and sending them upstream become skills and switches, not rules every session pays for. A consumer's upstream reporting is `off`
    by default, so it spends no tokens; the consuming project of the extraction turns it on at `ask`.
  - Intake has three settings (`off`, `notify`, `auto` with a limit per session) and a local override, so the owner can pause it at once when the flow
    breaks or reports flood in.
  - Triage never adds a report before it looks for the same or a close problem already recorded; several reports can point to one issue
    (`Reported:`), and the queue's indexes show title and area so the match starts there.
  - Until 3.16, the plan index's interim rule does the same by hand, at most three reports a session, unless the owner pauses it.
- **Problems / blockers / findings:** none. Phase 3 is now 48 SP.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — a session follows the order of development, not the table
- **Tasks:** 3.9 extended (2 → 3 SP).
- **Branch:** `docs/start-task-order`
- **Decisions / deviations from the plan:** the owner noticed that "Start Phase 3" could start with 3.1: this phase is ⬜, so the session-start hook
  prints nothing for it, and `start-task` picks "the next ⬜ task … in the plan's order", which reads as the table. The execution-order line of this
  phase now says "not the order of the table" and gives the rule (the earliest unfinished release of the plan index, in the order of its row), without a
  second copy of the order. 3.9, which already edits `start-task`, also makes step 2 follow the execution order and the hook print the next task by it.
  Until then, the owner's prompts name the release and the first task.
- **Problems / blockers / findings:** none. Phase 3 is now 49 SP.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.17: the Git guard judges the wrong repository
- **Tasks:** 3.17 added (not started).
- **Branch:** `docs/start-task-order`
- **Decisions / deviations from the plan:** found while recording the entry above: a session of the consuming project (on its integration branch)
  could not commit to this repository's clone on a feature branch, because the guard judges every Git command by the project's own branch, also after
  `cd` or with `-C`. The reverse is the unsafe case: a commit to another clone's integration branch passes while the project is on a feature branch.
  It goes first in `0.1.2` (the plan index), since it is a safety defect.
- **Problems / blockers / findings:** none. Phase 3 is now 51 SP.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.18: auto-merge, and every consumer set up for it
- **Tasks:** 3.18 added (not started).
- **Branch:** `docs/3.18-auto-merge-plan`
- **Decisions / deviations from the plan:** the owner's decisions:
  - A session never learns that its checks passed (the desktop app wakes it on failures only, and the rules forbid polling), so plan work waited for the
    owner after every pull request. The host's auto-merge closes that: an agent enables it on exactly the pull requests it may merge without asking.
  - The gaps it leaves are part of the task: "clean status", a fix pushed after enabling, a task that needs the previous one (one level of stacking and a
    script for the squash conflicts), and a pull request behind its base, which a workflow updates when the integration branch moves. The owner chose that
    workflow over dropping the up-to-date requirement.
  - Bootstrap sets this up for every consumer by default, with fallbacks for a repository that cannot be protected and a person without admin rights, and
    an opt-out; existing consumers rerun `harness host protect` from the version's migration note.
  - On the same day this repository became public, got its ruleset and "allow auto-merge", and #20 was the first pull request merged by the host.
- **Problems / blockers / findings:** none. Phase 3 is now 56 SP; `0.1.2` is 3.17, 3.18, 3.3, 3.9, 3.1, 3.2.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — 3.18: a switch for consumers, and the standing request removed
- **Tasks:** 3.18 (not started; size unchanged).
- **Branch:** `docs/3.18-consumer-switch`
- **Decisions / deviations from the plan:** the owner asked that auto-merge reach every consumer. 3.18 already makes it a core rule and sets up the
  host; it now also has a profile switch `autoMerge` (on by default where the host protects the branches, off where it cannot), so that a team that
  wants a person to merge can turn it off. Until 3.18, this repository and the consuming project carry a standing request for auto-merge in section 9
  of their entry file (#22 here); the version's migration note offers its removal, and 3.18 removes this repository's.
- **Problems / blockers / findings:** none.
- **Next step:** unchanged: 3.6 → 3.7 → 3.8 → 3.11, released as `0.1.1`.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.6 done: the framework's CORE scan names the tools no adapter covers
- **Tasks:** 3.6 (done); Phase 3 is 🟡.
- **Branch:** `feature/3.6-core-scan-tools` — done (details: `work-logs/phase-3/3.6.md`).
- **Decisions / deviations from the plan:** none.
- **Problems / blockers / findings:** none.
- **Next step:** task 3.7.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.7 done: a pinned project scans its vendored core
- **Tasks:** 3.7 (done).
- **Branch:** `feature/3.7-pinned-core-scan` — done (details: `work-logs/phase-3/3.7.md`).
- **Decisions / deviations from the plan:** the vocabulary of the words the core uses on purpose is `core/vocabulary.json`, so it travels with the core.
- **Problems / blockers / findings:** none.
- **Next step:** task 3.8.
- **Verify with:** `npm run docs:check`

### 2026-11-03 — task 3.8 done: exceptions, the report path, development versions
- **Tasks:** 3.8 (done).
- **Branch:** `feature/3.8-core-exceptions` — done (details: `work-logs/phase-3/3.8.md`).
- **Decisions / deviations from the plan:** `harness release --dev` was added, since a development tag must hold a `framework.json` with the tag's version.
- **Problems / blockers / findings:** none.
- **Next step:** task 3.11.
- **Verify with:** `npm run docs:check`
