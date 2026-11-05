[← Flow 3 — The security release](./flow-3-security-release.md)

# Flow 3 — The security release — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries

### 2026-11-05 23:40 — decision D2: the security tasks of Phase 2 are a flow of their own, for the release `0.5.0`
- **Options:** (a) keep the security tasks in flow 2 and in `0.4.0`; (b) move them to a release `0.5.0` and a flow of their own, flow 3, which needs flow 2; (c) move them to `0.5.0` and keep one flow for both.
- **Own analysis** (written by the session that recorded it, before the owner's answer): (b). A release belongs to at most one flow, and the tasks of `0.4.0` (nested sessions, the write-permission switch, two tasks of Phase 2 that are not security work, the open issues) are process work that should land and be taken by the consumer before a long research phase starts; the security tasks (2.1, 2.8, 2.9, 2.2, 2.4, 2.10) are about 90% of a 5-hour window by their estimates on their own. Flow 2 keeps its number and history, and is renamed `flow-2-release-0-4-0` (the links are updated), since its first decisions were about the `0.4.0` work.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b); flow 3 is in brainstorm mode, the default, until the owner sets another one; its permissions are those of flow 2; the step 7 decision stops for D3 for the version `0.5.0` and its cut · **Decided by:** the owner ("I agree with security goes to 0.5.0"); the flow structure, the numbering and the mode are the session's choice, open to the owner's change.

### 2026-11-05 23:55 — decision D3: the mode of the flow, brainstorm to seamless
- **Options:** (a) stay in brainstorm (`askAt` D2); (b) seamless: the orchestrator decides every level and keeps a "review later" digest of its D2 to D4 decisions; (c) seamless, and drop the stop of step 7.
- **Own analysis:** none was needed: the mode of a flow is the owner's setting (the procedure `run-flow`: the setting is the owner's choice, never mine), and the owner asked for it by name, as for flows 1 and 2. What stays in seamless: the hard limits (no administrator's bypass, no cut on a red check, the non-negotiables, no force-push or deletion of a remote branch), what the entry file keeps for the owner (a change of the meaning of a core rule or of a non-negotiable, another merge into the production branch, creating a report on the host), and the "Stops for" column. Note for the owner: step 6 (task 2.10) proposes security rules of core, and a rule of core needs the owner's approval in its pull request, so the flow will stop there even in seamless mode unless the owner approves the rules beforehand; the one stop in the table is step 7 (the decision for the cut of `0.5.0`, D3).
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b), with the stop of step 7 as it is · **Decided by:** the owner ("Enable seamless mode for Flow 3 as well"); the setting is `"mode": "seamless"` in the flow's settings block, and `askAt` stays in the block and is not read in this mode.

### 2026-11-05 23:58 — decision D3: the stop of step 7 goes, and the stop at step 6 is written in the table
- **Options:** (a) keep the stop of step 7 and let step 6 stop only by the entry file's rule; (b) clear the stop of step 7 and name the stop of step 6 in the table; (c) clear both.
- **Own analysis:** none was needed: both are the owner's answers to the note of the entry above. The version `0.5.0` was named by the owner, so a stop to confirm it asks nothing new; the rules of task 2.10 are changes of core, which need the owner's approval in their pull request, and a stop that is written in the "Stops for" column holds whatever the mode, so the table now says what the entry file says anyway.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b): "Stops for" of step 6 is `owner review`, of step 7 is — · **Decided by:** the owner ("Drop of Step 7 is unnecessary indeed. But I agree with the drop during Step 6", read as: drop the stop at step 7, keep the stop at step 6); if "drop" was meant for step 6 too, say so and (c) follows.

### 2026-11-05 23:59 — decision D2: Phase 6 comes first, so the security release is `0.6.0` and this flow runs after flow 4
- **Options:** (a) keep this flow for `0.5.0` and run Phase 6 after it; (b) put Phase 6 in `0.5.0` and a flow of its own (flow 4), and move this release to `0.6.0`, the flow keeping its number and `Needs` flow 4; (c) renumber the flows so that the numbers follow the order.
- **Own analysis** (written by the session that recorded it, before the owner's answer): (b). The owner asked for the order, so that the security work (long research tasks) runs on quiet output, short reports and an audit of where the tokens go. A flow's number is an identity that other documents and the owner's words cite (the plan method: the order between flows is the `Needs:` line), so renumbering (c) costs more than it gives; this flow's steps and its owner-review stop are unchanged, and only the version in its texts changes.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b): `Releases:` is `0.6.0`, `Needs:` is flow 4, the decision step names `0.6.0` · **Decided by:** the owner ("make security release to be 0.6.0, and put phase 6 as 0.5.0"); the numbering of flow 4 is the session's choice, open to the owner's change. The order of running is flow 2, flow 4, flow 3.
