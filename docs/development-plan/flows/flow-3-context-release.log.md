[← Flow 3 — The context optimization release](./flow-3-context-release.md)

# Flow 3 — The context optimization release — log

Append-only log of this flow, written by its orchestrator (the procedure `run-flow`); newest entry at the bottom. It is the record of the flow: a
session that continues the flow reads the flow file, the tail of this log and the current step report, nothing older.

Entries are written from the entry templates of the [flow-log template](../../../core/plan/flow-log-template.md).

## Entries

### 2026-11-05 23:59 — decision D2: Phase 6 is a flow of its own, for the release `0.5.0`, before the security release
- **Options:** (a) put Phase 6 in the flow of the security release; (b) a flow of its own, flow 3, for the release `0.5.0`, which needs flow 2, with the security flow (flow 4) after it; (c) append the steps to flow 2.
- **Own analysis** (written by the session that recorded it, before the owner's answer): (b). A release belongs to at most one flow, and Phase 6 is a release of its own by the owner's order; flow 2 delivers `0.4.0` and should end there, and the security flow moves behind this one by its `Needs`. The numbers follow the order of running (the owner asked for that, so that "Run flows N–M" reads by number). The steps follow the phase's own order (6.1 first, for the baseline). Two steps stop for the owner's review, 6.4 and 6.5, because each changes what a procedure and the runtime contract mean, which needs the owner's approval in the pull request (the same reason as step 6 of flow 4). The mode is left at the default, since it is the owner's setting.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b); brainstorm mode, the permissions of flow 2, and the decision step at the end that inserts the cut step of `0.5.0` and the consumer's take · **Decided by:** the owner ("I want phase 6 come before security release. So make security release to be 0.6.0, and put phase 6 as 0.5.0"); the flow structure and the mode are the session's choice, open to the owner's change.

### 2026-11-06 00:05 — decision D3: the mode of the flow, brainstorm to seamless
- **Options:** (a) stay in brainstorm (`askAt` D2); (b) seamless: the orchestrator decides every level and keeps a "review later" digest of its D2 to D4 decisions; (c) seamless, and drop the stops of steps 4 and 5.
- **Own analysis:** none was needed: the mode of a flow is the owner's setting (the procedure `run-flow`: the setting is the owner's choice, never mine), and the owner asked for it by name, as for flows 1, 2 and 4. What stays in seamless: the hard limits (no administrator's bypass, no cut on a red check, the non-negotiables, no force-push or deletion of a remote branch), what the entry file keeps for the owner (a change of the meaning of a core rule or of a non-negotiable, another merge into the production branch, creating a report on the host), and the "Stops for" column. Two stops remain by the table: steps 4 and 5 (tasks 6.4 and 6.5, `owner review`), because each changes what a procedure and the runtime contract mean, which needs the owner's approval in its pull request.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b), with the stops of steps 4 and 5 as they are · **Decided by:** the owner ("Make flow 3 seamless as well"); the setting is `"mode": "seamless"` in the flow's settings block, and `askAt` stays in the block and is not read in this mode.

### 2026-11-07 16:30 — decision D2: the issues found by flow 2 join this release as step 8a
- **Options:** (a) a step of their own before the cut decision (8a, Needs 8); (b) a later release.
- **Own analysis:** (a). I-23 (the take procedure names no services the gate needs), I-24 (the tests fail on the tree that `harness release` leaves before its commit) and I-25 (the list of notes in `migrations/README.md` stops at `0.2.0`) are 1 SP of C1 each, found by flow 2's take and cut; each costs every later take or cut a little, and `0.5.0` is the next release.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a): step 8a (I-23, I-24, I-25, 3 SP, C1) inserted, step 9 now needs 8a; the row `0.5.0` of the releases file names the three issues · **Decided by:** the owner ("I agree with your recommendations go apply them", on the orchestrator's advice after flow 2).

### 2026-11-07 16:50 — decision D2: I-26 joins step 8a
- **Options:** (a) add I-26 to step 8a; (b) a later release.
- **Own analysis:** (a). The take of `0.4.0` in bot-rts (AndLD/bot-rts#303) found that `harness plan-write on` writes `.claude/settings.json` in a form the project's Prettier check rejects; every project that turns the switch on and checks formatting meets it, and it is 1 SP of C1, the same kind as the other issues of 8a.
- **Worker's recommendation:** report the defect upstream; this repository is upstream, so it is recorded here as I-26.
- **Choice:** (a): step 8a is I-23 to I-26, 4 SP; the row `0.5.0` of the releases file names I-26 · **Decided by:** the orchestrator, under the owner's approval of the issues of flow 2 ("I agree with your recommendations go apply them").
