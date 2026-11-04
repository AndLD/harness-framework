[← Development plan](../README.md)

# Issue queue

The defects and improvements found in use. They are not a phase: they have no goal, no exit criteria and no end, and their size is not in the totals of the
plan. Each issue is a file of its own here (`I-<n>.md`, from the framework's issue template) with its log beside it (`I-<n>.log.md`), and a branch
`bugfix/I-<n>-<slug>`. This index lists the open and in-progress issues only; an issue that is done moves to the [archive](./archived/README.md)
when `harness plan summary` runs, so an agent that works the queue reads this file and never the archive.

Before adding an issue, look for the same or a close problem in this index and the archive (title and area first, then the files); the same problem is added to
the `Reported:` line of the issue that holds it.

<!-- issue-queue:start -->
| Issue | Title | Area | Agent | SP | Status | Reported |
| ----- | ----- | ---- | ----- | -- | ------ | -------- |
| [I-1](./I-1.md) | The framework's tests that `harness sync` copies fail in a pinned project | bootstrap and sync | C1 | 2 | ⬜ | [issue 30](https://github.com/AndLD/harness-framework/issues/30) |
| [I-3](./I-3.md) | The migration adds the folders of the new plan layout to the layer map of a project with its own layers | profile file | C1 | 3 | ⬜ | [issue 62](https://github.com/AndLD/harness-framework/issues/62) |
| [I-5](./I-5.md) | A probe table of the older shape fails `check probes` without saying which columns it expects, and the note does not list the action | checks | C1 | 2 | ⬜ | [issue 64](https://github.com/AndLD/harness-framework/issues/64) |
| [I-6](./I-6.md) | A profile switch for the probes of a migration: `auto`, `ask` (the default) or `disabled` | procedures | C1 | 5 | ⬜ | [issue 65](https://github.com/AndLD/harness-framework/issues/65) |
<!-- issue-queue:end -->
