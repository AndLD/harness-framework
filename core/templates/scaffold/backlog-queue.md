[← Development plan]({{rel:paths.planIndex}})

# Backlog

The feature requests: things that are not there and that someone asked for, which are not defects. They are not a phase and not the issue queue: nothing here is
built until the owner puts an item into a release (by naming it in the order of development of the plan) or asks for it by name. Each item is a file of its own
here (`B-<n>.md`, from the framework's backlog template), and a branch `feature/B-<n>-<slug>`. Its `Source:` says where it came from: `report` with the
link of each report, `owner`, or `agent`. This index lists the open and in-progress items only; an item that is done moves to the
[archive]({{rel:paths.backlog}}archived/README.md) when `harness plan summary` runs.

Before adding an item, look for the same or a close request in this index and the archive (title and area first, then the files); the same request is added to
the `Source:` line of the item that holds it. A defect found in use is an issue of the [issue queue]({{rel:paths.issues}}/README.md), not an item.

<!-- backlog:start -->
{{#if plan.complexity.scale}}
| Item | Title | Area | Agent | SP | Status | Source |
| ---- | ----- | ---- | ----- | -- | ------ | ------ |
{{/if}}
{{#unless plan.complexity.scale}}
| Item | Title | Area | SP | Status | Source |
| ---- | ----- | ---- | -- | ------ | ------ |
{{/unless}}
<!-- backlog:end -->
