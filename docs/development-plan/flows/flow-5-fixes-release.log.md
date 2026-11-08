[← Flow 5 — The fixes after the security release](./flow-5-fixes-release.md)

# Flow 5 — The fixes after the security release — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries

### 2026-11-08 16:10 — decision D2: the defects found by flow 4 are a flow of their own, for `0.6.1`
- **Options:** (a) a patch release `0.6.1` with I-40, I-41 and I-42; (b) a minor release `0.7.0`, leaving room for B-5 (the host-side gate of S-03) once promoted.
- **Own analysis** (written by the orchestrator of flow 4, which recorded it): (a): the three are defects of what exists, and B-5 waits for an identity the owner creates first.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a); the owner moved the features I-44 and I-45 to the backlog the same day (B-4, promoted to 2.12 in `0.6.0`, and B-5) · **Decided by:** the owner ("0.6.1").
