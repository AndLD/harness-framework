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
