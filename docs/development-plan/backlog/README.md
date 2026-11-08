[← Development plan](../README.md)

# Backlog

The feature requests: things that are not there and that someone asked for, which are not defects. This is the place for what the owner has **not approved yet**: an
item is a proposal, not a phase and not the issue queue, with no release and no phase of its own. **An item is never started as it is.** When the owner decides to
do it, the item is promoted into a task of a phase (`harness plan promote <B-n> --phase <n> --approved`), and only that task is claimed, branched, built and logged.
Each item is a file of its own here (`B-<n>.md`, from the framework's backlog template). Its `Source:` says where it came from: `report` with the link of each
report, `owner`, or `agent`. This index lists the proposed items only; a promoted item moves to the [archive](./archived/README.md) when
`harness plan summary` runs, and names its task.

Before adding an item, look for the same or a close request in this index and the archive (title and area first, then the files); the same request is added to
the `Source:` line of the item that holds it. A defect found in use is an issue of the [issue queue](../issues/README.md), not an item.

<!-- backlog:start -->
| Item | Title | Area | SP | Status | Source |
| ---- | ----- | ---- | -- | ------ | ------ |
| [B-5](./B-5.md) | A host-side gate between an agent and a merge to production | host adapters | 3 | Proposed | agent |
| [B-6](./B-6.md) | A sandbox for agent sessions, with a list of hosts, in the runtime preset | runtime adapters | 3 | Proposed | agent |
| [B-7](./B-7.md) | A gate on the host for the release path | host adapters | 3 | Proposed | agent |
| [B-8](./B-8.md) | The host's secret scanning and push protection, in the bootstrap and the owner's settings | host adapters | 1 | Proposed | agent |
| [B-9](./B-9.md) | Automated dependency and configuration audits | stack adapters | 2 | Proposed | agent |
| [B-10](./B-10.md) | A record of agent sessions that the agent cannot write, and managed limits | runtime adapters | 3 | Proposed | agent |
<!-- backlog:end -->
