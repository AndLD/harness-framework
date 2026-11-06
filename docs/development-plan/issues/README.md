[← Development plan](../README.md)

# Issue queue

The defects and improvements found in use. They are not a phase: they have no goal, no exit criteria and no end, and their size is not in the totals of the
plan. Each issue is a file of its own here (`I-<n>.md`, from the framework's issue template) with its log beside it (`I-<n>.log.md`), and a branch
`bugfix/I-<n>-<slug>`. This index lists the open and in-progress issues only; an issue that is done moves to the [archive](./archived/README.md)
when `harness plan summary` runs, so an agent that works the queue reads this file and never the archive.

Before adding an issue, look for the same or a close problem in this index and the archive (title and area first, then the files); the same problem is added to
the `Reported:` line of the issue that holds it.
A request for something new, which is not a defect, is an item of the [backlog](../backlog/README.md), not an issue.

<!-- issue-queue:start -->
| Issue | Title | Area | Agent | SP | Status | Reported |
| ----- | ----- | ---- | ----- | -- | ------ | -------- |
| [I-7](./I-7.md) | `harness branch update` left merge conflict markers in a file it reported as resolved, and no check refuses them | Git rules | C1 | 2 | ⬜ | — |
| [I-14](./I-14.md) | `harness flow status` takes a consumer's pull request for a development version as the take of the final version it extends | checks | C1 | 1 | ⬜ | — |
| [I-16](./I-16.md) | The notes of a development version and the migration say too little: the final note is not printed on a development-only path, a check is false after the next version, and the arrows action has no answer for phases no release holds | bootstrap and sync | C1 | 2 | ⬜ | — |
| [I-17](./I-17.md) | Pushing the tag of a release from the branch of the work fails the migration tests, and the procedure `release` does not say from which branch to push it | procedures | C1 | 1 | ⬜ | — |
| [I-18](./I-18.md) | A pull request that the update workflow brings up to date is left BLOCKED, because the required `pr-title` check of the new head never runs | checks | C1 | 2 | ⬜ | — |
| [I-19](./I-19.md) | The pre-push hook of a linked worktree runs the main checkout's tools, so it checks the worktree's generated files against the wrong `core/` | Git rules | C1 | 1 | ⬜ | — |
| [I-20](./I-20.md) | A flow cannot decide a change of the meaning of a contract at a level: it stops for the owner whatever the mode | procedures | C2 | 1 | 🟡 | — |
<!-- issue-queue:end -->
