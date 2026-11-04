[← Development plan](../README.md)

# Backlog

The feature requests: things that are not there and that someone asked for, which are not defects. They are not a phase and not the issue queue: nothing here is
built until the owner puts an item into a release (by naming it in the order of development of the plan) or asks for it by name. Each item is a file of its own
here (`B-<n>.md`, from the framework's backlog template), and a branch `feature/B-<n>-<slug>`. Its `Source:` says where it came from: `report` with the
link of each report, `owner`, or `agent`. This index lists the open and in-progress items only; an item that is done moves to the
[archive](./archived/README.md) when `harness plan summary` runs.

Before adding an item, look for the same or a close request in this index and the archive (title and area first, then the files); the same request is added to
the `Source:` line of the item that holds it. A defect found in use is an issue of the [issue queue](../issues/README.md), not an item.

<!-- backlog:start -->
| Item | Title | Area | Agent | SP | Status | Source |
| ---- | ----- | ---- | ----- | -- | ------ | ------ |
| [B-1](./B-1.md) | A profile switch for the probes of a migration: `auto`, `ask` (the default) or `disabled` | procedures | C1 | 5 | ⬜ | report — [GitHub issue 65](https://github.com/AndLD/harness-framework/issues/65) |
<!-- backlog:end -->
