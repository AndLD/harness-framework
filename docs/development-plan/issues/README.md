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
| [I-23](./I-23.md) | The take of a version names no services that the project's gate needs | procedures | C1 | 1 | ✅ | — |
| [I-24](./I-24.md) | The tests fail on the tree that `harness release` leaves before its commit | checks | C1 | 1 | ⬜ | — |
| [I-25](./I-25.md) | The list of notes in `migrations/README.md` is written by hand and stops at `0.2.0` | bootstrap and sync | C1 | 1 | ⬜ | — |
| [I-26](./I-26.md) | `harness plan-write on` writes a settings file that the project's formatter rejects | runtime adapters | C1 | 1 | ⬜ | — |
| [I-27](./I-27.md) | A project cannot give its flows a default for the workers' permissions | plan format | C2 | 2 | ⬜ | — |
| [I-28](./I-28.md) | `harness flow status` reads a take that a later take superseded as not done | checks | C1 | 1 | ⬜ | — |
| [I-29](./I-29.md) | The usage gate does not know the plan `pro` in lower case | checks | C1 | 1 | ⬜ | — |
<!-- issue-queue:end -->
