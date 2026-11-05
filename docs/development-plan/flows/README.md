[← Development plan index](../README.md)

# Flows of harness-framework

A flow is an ordered chain of steps that delivers one or more releases; an orchestrator runs it with the procedure `run-flow` and keeps its log. One file
per flow, `flow-<n>-<slug>.md` from the flow template of the plan method, and its log `flow-<n>-<slug>.log.md` from the flow-log template. Numbers are
identities; the order between flows is the `Needs:` line of a flow, else the number. A finished flow stays here.

The table is written from the flow files by `harness plan summary`; edit a flow file, not this table.

<!-- flows-index:start -->
| Flow | Releases | Mode | Size | Est. usage | Status |
| ---- | -------- | ---- | ---- | ---------- | ------ |
| [1 — Release 0.3.0 and its first consumer](./flow-1-release-0-3-0.md) | `0.3.0-dev.1`, `0.3.0` | brainstorm | 7 SP | 6% | ⬜ |
| [2 — The security release](./flow-2-security-release.md) | `next` | brainstorm | 18 SP | 36.3% | ⬜ |
<!-- flows-index:end -->
