[← Flow 1 — Release 0.3.0 and its first consumer](./flow-1-release-0-3-0.md)

# Flow 1 — Release 0.3.0 and its first consumer — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries

### 2026-11-05 12:00 — decision D3: what the workers of this flow may do when they are started on the command line
- **Options:** (a) the mode `acceptEdits` and an `allow` list for Git, the host's command line and the checks; (b) `acceptEdits` alone; (c) a more permissive mode.
- **Own analysis** (written by the session that set the flow up, before the owner answered; no orchestrator has run the flow yet): (a). A worker of a task, a cut or a take opens branches and pull requests and runs the checks, which (b) would refuse at the first command; (c) would let every worker do anything, which no step of this flow needs.
- **Worker's recommendation:** none (no worker is involved; the question came from the finding of issue I-11).
- **Choice:** (a), `"permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)"] }` · **Decided by:** the owner ("acceptEdits + git/gh"; the list also holds `npm` and `node` for the checks and the framework's own tools, as the option offered, and is narrowed by editing the setting). Flow 2 has no value yet; it is set before it runs.
