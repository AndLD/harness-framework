[← Flow 2 — The 0.4.0 release](./flow-2-release-0-4-0.md)

# Flow 2 — The 0.4.0 release — log

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


### 2026-11-05 22:00 — decision D3: `sed` and `ls` join what the workers of this flow may do
- **Options:** (a) add `Bash(sed *)` and `Bash(ls *)` to the `allow` list of the `permissions` setting; (b) leave the list as it is; (c) widen the mode.
- **Own analysis** (written by the orchestrator of flow 1, which saw the refusals, before the owner's answer): (a). The workers of flow 1 on the command line were refused `sed -i` edits, `ls` of a folder outside their own and some compound shell lines, so they spent turns on workarounds and left one pull request body unfixed; `sed` and `ls` are routine and, run through `Bash(…)` patterns, stay inside the mode `acceptEdits`; nothing else in the list changes. Some compound shell lines were refused too; whether a compound line whose parts are all allowed passes is not verified, so the first run of flow 2 shows whether the list is the whole fix.
- **Worker's recommendation:** the workers of steps 1d and 1g of flow 1 named the refusals and worked round them.
- **Choice:** (a), `"allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"]` · **Decided by:** the owner ("I think you should add sed and ls commands to permissions for new workers"). Flow 1 is finished and keeps its own list.

### 2026-11-05 21:30 — decision D2: add tasks 2.7 and 2.6 as the first two steps of this flow
- **Options:** (a) two new steps at the start, the others move down by two (the flow has not run, as in the entry of 12:20); (b) two steps inserted after step 1 with suffix ids (`1a`, `1b`); (c) leave them out of this flow and run them in a flow of their own.
- **Own analysis** (written by the session that recorded the tasks, before the owner's answer): (a). The owner asked for them at the beginning or early; 2.7 changes how the workers of the rest of the flow are started (nested sessions, the command line as a logged fallback), so it should be merged before the steps that it affects, and 2.6 removes the prompts for the plan's files in other projects; the log names no step number but the split of 12:20, so renumbering costs nothing. 2.7 goes first and carries "Stops for" D3, because the order of the executors is not decided as a whole and changes the meaning of the procedure `run-flow` (the owner confirms it in the pull request of the task). Step 3 (2.1) keeps its model, size and estimate. This flow's own run can start nested sessions in the home repository, since the experiment of the same day allowed three in a chain.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a): steps 1 (2.7, C3, 5 SP, stops for D3) and 2 (2.6, C2, 3 SP), then the former steps 1 to 6 as steps 3 to 8 · **Decided by:** the owner ("Add tasks 2.6 and 2.7 to flows. It should come earlier of flow 2 or in the beginning of flow 2"); the order between the two and the renumbering are the session's choice, open to the owner's change.

### 2026-11-05 21:50 — decision D3: the version of the release of this flow is `0.4.0`
- **Options:** (a) name it `0.4.0` now; (b) keep the name `next` until the last step of the flow; (c) another number.
- **Own analysis** (written by the session that recorded it, before the owner's answer): (a). The release holds a change to the procedure `run-flow` and to the runtime contract (task 2.7), which is more than a fix, so a minor version is the least that fits, and a number lets the tools and the consumer match a tag and a migration note to the row; step 8 can still confirm or change it against what the row holds when the flow gets there.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a): the row `next` of the releases file is `0.4.0`, `Releases:` of this flow is `0.4.0`, and step 8 now confirms the version instead of fixing it · **Decided by:** the owner ("Okay, let it be 0.4.0").

### 2026-11-05 22:10 — decision D3: the mode of the flow, brainstorm to seamless
- **Options:** (a) stay in brainstorm (`askAt` D2); (b) seamless: the orchestrator decides every level and keeps a "review later" digest of its D2 to D4 decisions; (c) seamless, and drop the stops of steps 1 and 8.
- **Own analysis:** none was needed: the mode of a flow is the owner's setting (the procedure `run-flow`: the setting is the owner's choice, never mine); the owner asked for it by name, as for flow 1. What stays in seamless: the hard limits (no administrator's bypass, no cut on a red check, the non-negotiables, no force-push or deletion of a remote branch), what the entry file keeps for the owner (a change of the meaning of a core rule or of a non-negotiable, another merge into the production branch, creating a report on the host), and the "Stops for" column. Two stops therefore remain by the table: step 1 (task 2.7, D3: the owner confirms the executor order, which changes the meaning of the procedure `run-flow` and of the runtime contract) and step 8 (the version, D3). Nothing is changed in the table.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b), with the stops of steps 1 and 8 as they are · **Decided by:** the owner ("Enable seamless mode instead of brainstorm for flow 2"); the setting is `"mode": "seamless"` in the flow's settings block, and `askAt` stays in the block and is not read in this mode.

### 2026-11-05 22:40 — decision D3: the executor order of task 2.7 and the version `0.4.0` are confirmed, and the two stops go
- **Options:** (a) keep the stops of steps 1 and 8 and ask when the flow gets there; (b) record the owner's confirmations now and clear both stops; (c) confirm the order and the version now, and keep the stop of step 1 for the pull request of 2.7.
- **Own analysis:** none was needed: both are the owner's decisions (a change of the meaning of the procedure `run-flow` and of the runtime contract; what a release promises by its version), and the owner gave them in words. (b) follows from them: the stops existed only to ask these two questions. The pull request of 2.7 still changes a contract, so it cites this entry as the owner's approval; the worker's prompt for step 1 must say so. Step 8 is no longer the version, only the cut step of `0.4.0` that the flow inserts (a D2 decision of the orchestrator in seamless mode).
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b) · **Decided by:** the owner ("I confirm the executor order in 2.7 as we discussed. I confirm 0.4.0 version."): the order is a session of the desktop app as the default, a worker on the command line as the fallback for one step at a time with its reason logged, `manual` as the fallback of that, a subagent outside the order for a short analysis only, and a step in another repository on the command line, logged as the fallback; the version is `0.4.0`. The "Stops for" of steps 1 and 8 is now —.

### 2026-11-05 23:10 — decision D2: Phase 2 is reshaped around a researched security methodology, and its new tasks are steps of this flow
- **Options:** (a) keep the five security tasks as they were, with a fixed S1 to S6 method; (b) reshape: 2.1 the frame, 2.8 and 2.9 the probe catalogue and attack scenarios (researched, with sources), 2.10 the security rules distilled from the first review; (c) the same as (b) and move the security tasks to a release of their own (`0.5.0`).
- **Own analysis** (written by the session that recorded it, before the owner's answer): (b). The owner is not a security expert and wants the framework to deliver a wide, researched methodology that a consumer's agent can use on its own project, and then a few core rules from its findings; one 5 SP task cannot hold that, and a list fixed in advance would stop at what section 11.1 of the design knew. Splitting the frame from the catalogue lets the catalogue grow by review. The catalogue is checked by an independent pass and marked draft until a person with security expertise has reviewed it, because a model can state a security fact confidently and be wrong. (c) is the owner's decision about the size of `0.4.0` and was not made here; the phase is 38 SP now, and the flow is about 90% of one 5-hour window by its estimates.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b); steps 4 (2.8), 5 (2.9) and 9 (2.10) are new, and the other steps move down (the flow has not run, as in the entry of 12:20); the release of the security tasks stays `0.4.0` until the owner decides (c) · **Decided by:** the owner ("Yes, agree with you"), who asked for the direction and the learning loop; the numbering and the order of the steps are the session's choice, open to the owner's change.

### 2026-11-05 23:40 — decision D2: the security tasks leave this flow for flow 3 and the release `0.5.0`; the flow is renamed
- **Options:** (a) keep the security tasks here; (b) move them to a release `0.5.0` and a flow of their own, flow 3; (c) move them to `0.5.0` and keep one flow for both.
- **Own analysis:** see the entry of the same time in the log of [flow 3](./flow-3-security-release.log.md): (b). This flow keeps its number, its history above and its settings (seamless); it now delivers `0.4.0` only: 2.7, 2.6, 2.3, 2.5 and the open issues (two steps of C1: I-18 and I-7; I-17, I-14 and I-16), then the decision that inserts the cut step. The entries above that speak of the security tasks (the steps of 2.1, 2.8, 2.9, 2.2, 2.4 and 2.10 and of the version for them) describe the flow as it was before this entry, and are not rewritten. The files are renamed `flow-2-release-0-4-0` (the title "The security release" went to flow 3).
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (b) · **Decided by:** the owner ("I agree with security goes to 0.5.0"); the renaming, the grouping of the issues into two steps and the order are the session's choice, open to the owner's change.
