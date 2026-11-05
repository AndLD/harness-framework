[← Flow 1 — Release 0.3.0 and its first consumer](./flow-1-release-0-3-0.md)

# Flow 1 — Release 0.3.0 and its first consumer — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries
