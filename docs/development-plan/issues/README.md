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
| [I-40](./I-40.md) | The template repository does not ask for the flows' permissions | bootstrap and sync | C2 | 1 | ⬜ | — |
| [I-41](./I-41.md) | Auto-merge can be turned on for a pull request with no changed files | Git rules | C2 | 1 | ⬜ | — |
| [I-42](./I-42.md) | The branch update by the workflow leaves a pull request with no checks | host adapters | C2 | 2 | ⬜ | — |
| [I-43](./I-43.md) | The security gate is off: the template still grants write at the top, and a local allow rule blocks every push | host adapters | C2 | 2 | ⬜ | the [first security review](../../quality-reviews/security/2026-11-08.md), findings S-20261108-06 and S-20261108-12; found again by the worker of I-39 (step 7c of flow 4) |
<!-- issue-queue:end -->
