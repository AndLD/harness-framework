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
| [I-12](./I-12.md) | The migration of `0.3.0` writes prose into the release table's id column, leaves a skipped release as the next one, and leaves a prose order of phases without a message | bootstrap and sync | C1 | 3 | ⬜ | — |
| [I-13](./I-13.md) | The first `check all` after taking `0.3.0` fails on the new releases file and on a generic word of the core, and the notes say nothing of either or of the cost of the gate | checks | C1 | 2 | ⬜ | — |
| [I-14](./I-14.md) | `harness flow status` takes a consumer's pull request for a development version as the take of the final version it extends | checks | C1 | 1 | ⬜ | — |
<!-- issue-queue:end -->
