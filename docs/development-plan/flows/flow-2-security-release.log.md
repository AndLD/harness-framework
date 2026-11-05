[← Flow 2 — The security release](./flow-2-security-release.md)

# Flow 2 — The security release — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries

### 2026-11-05 12:20 — decision D3: what the workers of this flow may do when they are started on the command line
- **Options:** (a) the same as flow 1: the mode `acceptEdits` and an `allow` list for Git, the host's command line and the checks; (b) `acceptEdits` alone; (c) a more permissive mode.
- **Own analysis** (written by the session that set the flow up; no orchestrator has run the flow yet): (a). The steps build tasks (branches, pull requests, the checks) and a security review that reads and writes documents; nothing in them needs more than flow 1's steps do, and a tool that a step needs and the list lacks makes its worker report itself blocked, which is cheap to fix by editing the setting.
- **Worker's recommendation:** none (no worker is involved; issue I-11).
- **Choice:** (a), `"permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)"] }` · **Decided by:** the owner asked for relevant permissions for this flow after choosing them for flow 1; the list is the session's proposal, the same as flow 1's.

### 2026-11-05 12:20 — decision D2: split step 2 (tasks 2.2 and 2.3) into two steps
- **Options:** keep one 6 SP step; one step per task.
- **Own analysis** (written by the session that set the flow up): split. By the provisional Claude Pro coefficients a 6 SP Sonnet step is 72% of an empty 5-hour window, which `harness flow check` refuses once the subscription is known (the gate could never start it); at 3 SP each fits (36%). The two tasks are of one release and one model, so the second step's worker may still be the first's (`reuse: auto`). Step 2.1 (5 SP, Opus) cannot be split, and is left to be measured.
- **Worker's recommendation:** none.
- **Choice:** one step per task; the steps after it move down by one (an early plan change, before any run, so the ids are renumbered rather than suffixed) · **Decided by:** the owner ("I agree with you").

