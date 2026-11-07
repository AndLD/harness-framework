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

### 2026-11-07 17:05 — decision D3: the workers start in the mode `auto`, and the consumer is a repository of the flow
- **Options:** (a) `permissions.mode` `auto` and `repos.consumer` AndLD/bot-rts (`consumer-take`), as flow 2 has them; (b) leave the settings as they are.
- **Own analysis:** (a). In flow 2 the mode `acceptEdits` asked the owner for almost every command of a worker until the owner set `auto` (flow 2, 2026-11-07 11:00), and the take of the consumer (step 8, 6.8, and the take that step 9 inserts) runs in AndLD/bot-rts, which a step can name only when the flow's `repos` lists it; the local folder is in `harness-profile.local.json` (`repos.consumer`).
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a) · **Decided by:** the owner ("Yes, set both").

### 2026-11-07 17:30 — decision D2: I-27, a project's default for the workers' permissions, joins this release as step 8b
- **Options:** (a) a step of its own after 8a (8b, I-27, 2 SP, C2); (b) a later release; (c) `auto` as the framework's default.
- **Own analysis:** (a). The owner asked that `auto` be the default of the flows to come. (c) cannot be done as asked: the core names no mode of a runtime, and the runtime contract says an adapter never chooses one, since what a worker may do is the owner's decision; a default that the project's profile holds keeps both and gives the owner the same result (this repository sets it to `auto`). Flows 3 and 4 set the mode already, so nothing waits for it before flow 5; 8b is C2, since it touches the profile schema, the tools and the text of the runtime contract.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a): I-27 recorded, step 8b inserted, step 9 now needs 8b; the row `0.5.0` of the releases file names I-27 · **Decided by:** the owner's request ("You can put auto mode as default"), in the form the orchestrator chose.

### 2026-11-07 17:50 — decision D3: steps 4 and 5 no longer stop for the owner's review
- **Options:** (a) remove the stops `owner review` of steps 4 (6.4) and 5 (6.5); (b) keep them.
- **Own analysis:** (a). The stops were set on 2026-11-05, when a change of the meaning of a contract needed the owner's approval in its pull request whatever the mode; since I-20 (`0.4.0`) it is the kind `contract.change` (D3), which this seamless flow decides, logs with its options and lists in its digest. What stays the owner's without the column: a change of the meaning of a core rule or of a non-negotiable (6.4 may add one, its budgets being "a rule"), and a merge into `main` outside a cut the flow decides. The texts of the flow and of tasks 6.4 and 6.5 now say so.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a) · **Decided by:** the owner ("Yes, you can remove pauses").

### 2026-11-07 17:20 — running
- **Orchestrator:** a desktop session of the owner's account nil10035@gmail.com ("Run flow 3") · **Mode:** seamless · **Steps:** 1 to 9
- **Usage:** 5-hour 2% (resets 2026-11-07T20:10:00Z) · weekly 77% (resets 2026-11-08T21:00:00Z)

### 2026-11-07 17:20 — decision D1: flow 2 counts as finished, and `flow status` is wrong about a superseded take
- **Options:** (a) start the flow: flow 2 is finished; (b) stop, since `harness flow status 3` says it "waits for flow 2, which is not finished".
- **Own analysis:** (a). Flow 2's log ends with "stop: finished" (2026-11-07 16:05), and its only mismatch is step 7b, the take of `0.4.0-dev.1`: AndLD/bot-rts#302 merged, and the consumer's lock has since moved on to `0.4.0`. The status of a `consumer-take` step compares the lock with its version exactly, so every take that a later take supersedes reads ⬜ (flow 1 shows the same for its four takes), and every flow after one with a take would wait forever. It is a defect of the tool, recorded as I-28 with this step's record.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode).

### 2026-11-07 17:20 — decision D0: the gate reads the subscription from `--plan Pro`
- **Options:** (a) pass the plan the account reports (`--plan Pro`), since `harness-profile.local.json` sets no `usage.subscription`; (b) gate without an estimate.
- **Own analysis:** (a). `--plan pro` in lower case and `--subscription` give no estimate; `--plan Pro` maps to the Pro coefficients. The gate: GO, 5-hour 2% + 10.8% and weekly 77% + 1.6% with the safety factor.
- **Choice:** (a) · **Decided by:** the orchestrator.

### 2026-11-07 17:21 — step 1 started
- **Executor:** session · **Worker:** local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3 · **Account:** nil10035@gmail.com · **Model:** Sonnet 5.5 at high effort · **Permissions:** auto · **Estimate:** 5 SP, 5-hour 9%, weekly 1.3%
- **Usage before:** 5-hour 2% (resets 2026-11-07T20:10:00Z) · weekly 77% (resets 2026-11-08T21:00:00Z)

### 2026-11-07 17:25 — decision D2: I-28 and I-29 join step 8a
- **Options:** (a) record both and add them to step 8a; (b) record them for a later release.
- **Own analysis:** (a). I-28 (a superseded take reads ⬜, so a flow after a flow with takes looks blocked) and I-29 (the gate's `--plan` knows `Pro` but not `pro`, and `estimate` takes none) each cost every orchestrator a detour at the claim; they are 1 SP of C1, the kind of step 8a, and `0.5.0` is the next release. Step 8a is now 6 SP.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a): I-28 and I-29 recorded, step 8a holds them, the row `0.5.0` of the releases file names them · **Decided by:** the orchestrator (seamless mode).

### 2026-11-07 17:36 — step 1 ended: done
- **Usage after:** 5-hour 10% (resets 2026-11-07T20:10:00Z) · weekly 78% (resets 2026-11-08T21:00:00Z) · **Measured:** 5-hour +8%, weekly +1%, against an estimate of 5-hour 9% and weekly 1.3% · **Pull requests merged:** #183 (6.1), merged by the host's auto-merge once its required checks pass · **Ids done:** 6.1 · **Worker:** session local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3, 58 turns, context 19% after the step
- **Report:** a new optional role of the runtime contract, `transcripts` (`locate()` the sessions of a flow, `parse()` one into neutral records), filled by the Claude Code adapter, in the manifest schema, `core/contracts/runtime.md` and the conformance suite; `harness flow audit <n> [--orchestrator <id>] [--top <n>] [--json]`, which finds the workers in the "step started" entries; the baseline of flow 1 in the phase log: 1,137k tokens into context over 14 sessions, tool results 41% (shell commands 85% of them: `cat`, `grep`, `git show`, `sed`, `git fetch`), the orchestrator's peak context 485k, a median of 28.6k tool-result tokens a step and an aim of at most 19.1k; step 1f counted by hand agrees with the audit. 809 tests, `docs:check`, lint and typecheck pass locally. Deviations: no migration note (written at the cut) and no consumer fixture (6.8's); a changelog fragment; the orchestrator's id is a flag, since the log does not record it.

### 2026-11-07 17:38 — decision D1: the aim of the phase
- **Options:** (a) keep the phase's default, a third fewer tool-result tokens per comparable step (at most 19.1k against the median of 28.6k); (b) name another figure.
- **Own analysis** (written before the worker's recommendations): (a). The phase sets the third as its default and leaves another figure to the owner; the baseline gives no reason to move it, and 6.8 measures against it.
- **Worker's recommendation:** (a), the same.
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode).

### 2026-11-07 17:38 — decision D3: the runtime contract gains the optional role `transcripts` (`contract.change`)
- **Options:** (a) accept the role as built in #183; (b) refuse it and revert, and audit from a tool outside the contract.
- **Own analysis** (written before the worker's recommendations): (a). Task 6.1 needs the transcripts of a flow, and only the runtime knows where they are, so the core can read them only through the runtime adapter (design §4); the role is optional and additive, so every adapter conforms as it is, a runtime without it says "the audit cannot run", and the change is a minor version's, which `0.5.0` is. This entry is the approval that #183 needs as a change of the meaning of a contract (the procedure `run-flow`); #183 may merge before it, so the step's record cites it.
- **Worker's recommendation:** named as a decision of the kind `contract.change`, no pick.
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode, `contract.change` D3).

### 2026-11-07 17:39 — decision D1: the worker's recommendations
- **Options:** for each, take it now, hand it to its step, or leave it.
- **Own analysis:** the orchestrator's session id in the "running" entry: taken from now on where the session can read it (this one cannot read its own id; the audit takes `--orchestrator`). Hook output and whole-document reads as the first cuts of 6.2: handed to step 2 by its report, which the worker of step 2 reads in the phase log. An earlier restart of the orchestrator in 6.5 (in flow 1 it re-read 163M tokens from the cache): handed to step 5, the task's own subject.
### 2026-11-07 17:32 — step 2 started
- **Executor:** session, reused from step 1 · **Worker:** local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3 · **Account:** nil10035@gmail.com · **Model:** Sonnet 5.5 at high effort · **Permissions:** auto · **Estimate:** 3 SP, 4.8%
- **Usage before:** 5-hour 10% (resets 2026-11-07T20:10:00Z) · weekly 78% (resets 2026-11-08T21:00:00Z)

### 2026-11-07 17:41 — step 2 ended: done
- **Usage after:** 5-hour 15% (resets 2026-11-07T20:10:00Z) · weekly 79% (resets 2026-11-08T21:00:00Z) · **Measured:** 5-hour +5%, weekly +1%, against an estimate of 5-hour 5.4% and weekly 0.8% · **Pull requests merged:** #185 (6.2), by auto-merge once its checks pass (it was behind `develop`; the orchestrator updated its branch) · **Ids done:** 6.2 · **Worker:** session local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3 (reused, warm), 26 turns, context 24% after the step
- **Report:** `check all` prints the problems and one line `N checks passed` (`--verbose` restores the full text); the pre-push gate and the project checks write each step's output to a file and print nothing on a pass, and on a failure the file's path and the failing lines, capped by a new optional profile value `output.maxLines` (default 40); `flow dispatch --brief`. Measured on the branch's own push: the gate printed 212,567 characters with `--verbose` and 122 quiet, with the same exit codes; `check all` 1,365 to 38. The runtime hooks were left as they are (already silent or about 950 characters); `flow status`, `next`, `gate` and `plan summary` are already short. No migration note (written at the cut); the fragment `6.2-quiet-output` says to use `--verbose`. 815 tests, `docs:check`, lint and typecheck pass locally. Note: the times of the entries 17:36 to 17:39 above were written about six minutes ahead of the clock; this entry and the start of step 2 (corrected before its commit) use the clock.

### 2026-11-07 17:42 — decision D1: the optional profile value `output.maxLines` and the quiet output of passing checks
- **Options:** (a) accept them as a minor addition, with the fragment as the project's instruction; (b) treat them as a `contract.change` (D3); (c) keep the full output by default.
- **Own analysis** (written before the worker's recommendations): (a). The value is optional with a default, so every profile stays valid; the quiet output is what task 6.2 asks for, and a project that read the text of a passing check finds `--verbose` in the changelog. Neither changes what a contract promises (its exit codes and the checks it runs are the same), so it is not a `contract.change`.
- **Worker's recommendation:** the same judgement (not a change of the meaning of a contract).
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode).

### 2026-11-07 17:42 — decision D1: the worker's recommendations of step 2
- **Options:** for each, take it, hand it to its step, or leave it.
- **Own analysis:** the failing-lines pattern as a setting of the stack adapter: handed to step 3 (6.3, the stack's commands), whose report names whether it took it. The orchestrator uses `flow dispatch --brief`: taken from step 3. An audit of a flow's pushes before 6.8: left to 6.8, which measures the fall by the audit already.
- **Choice:** as above · **Decided by:** the orchestrator.

### 2026-11-07 17:44 — step 3 started
- **Executor:** session, reused from step 2 · **Worker:** local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3 · **Account:** nil10035@gmail.com · **Model:** Sonnet 5.5 at high effort · **Permissions:** auto · **Estimate:** 3 SP, 4.8%
- **Usage before:** 5-hour 15% (resets 2026-11-07T20:10:00Z) · weekly 79% (resets 2026-11-08T21:00:00Z)

### 2026-11-07 17:51 — decision D2: the weekly threshold of the usage gate is 95% for this flow
- **Options:** (a) `usage.stopAt.weekly` 95 in the flow's settings; (b) keep the default 90.
- **Own analysis:** none was needed: the settings of a flow are the owner's, and the owner asked for it. The 5-hour threshold stays 85%. With the weekly window at 79% and about 1–1.6% a step, the flow's remaining steps fit under 95% before the reset of 2026-11-08 21:00 UTC.
- **Worker's recommendation:** none (no worker is involved).
- **Choice:** (a) · **Decided by:** the owner ("take up to 95% weekly border").

### 2026-11-07 17:53 — step 3 ended: done
- **Usage after:** 5-hour 21% (resets 2026-11-07T20:10:00Z) · weekly 80% (resets 2026-11-08T21:00:00Z) · **Measured:** 5-hour +6%, weekly +1%, against an estimate of 5-hour 5.4% and weekly 0.8% · **Pull requests merged:** #187 (6.3), by auto-merge once its checks pass (behind `develop`; the orchestrator updated its branch) · **Ids done:** 6.3 · **Worker:** session local_a78ad07c-2b51-4fa1-b1c3-868ec0ad4ae3 (reused, warm, its third step), 26 turns, context 28% after the step
- **Report:** the profile roles `commands.lintQuiet`, `typecheckQuiet`, `formatQuiet`, `testQuiet` and `testCoverageQuiet`; an optional stack role `quiet-commands` in the manifest schema and the stack contract, filled by both presets where the stack defines the plain command; `open-pull-request`, `end-session`, `release` and `update-framework` cite the quiet variants (a project without them gets the plain command); the gate runs a step's `quiet` variant unless `--verbose`; the conformance suite checks the role when present; this repository's profile sets its quiet commands. Measured: the test run prints 212,044 characters plainly and 857 with the dot reporter. Not taken: the failing-lines pattern as a stack setting (with quiet variants a failure prints the runner's own lines, so it would serve only projects without them). Not verified: the Jest and pytest quiet options against a real project. No migration note (at the cut); the fragment `6.3-quiet-stack-commands` names the roles.

### 2026-11-07 17:54 — decision D3: the stack contract gains the optional role `quiet-commands`, and the profile its quiet commands (`contract.change`)
- **Options:** (a) accept them as built in #187; (b) refuse and revert.
- **Own analysis** (written before the worker's recommendations): (a). Task 6.3 asks for quiet variants that only the stack knows, so they belong to the stack adapter (design §4) and to the profile's command roles; the role and the roles are optional, a project that sets none runs the plain command, every adapter conforms as it is, and the change is a minor version's. This entry is the approval #187 needs as a change of the meaning of a contract; the step's record cites it if #187 merges first.
- **Worker's recommendation:** named as a `contract.change`, no pick.
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode, `contract.change` D3).

### 2026-11-07 17:54 — decision D1: the failing-lines pattern stays generic, and the recommendations of step 3
- **Options:** for the pattern: (a) leave it generic, as the worker did; (b) a setting of the stack adapter. For the recommendations: take, hand on, or leave.
- **Own analysis:** (a): the worker's reason holds; a new role for projects without quiet variants is not worth its weight. The check of the Jest options in a real project: handed to step 8 (6.8), whose take in bot-rts runs them first; the orchestrator adds it to that step's prompt. A hard line cap for the step report of 6.4: handed to step 4 as a note of its prompt (the agents' own output was 59% of the baseline).
- **Choice:** as above · **Decided by:** the orchestrator.

### 2026-11-07 17:55 — decision D0: step 4 runs on the command line
- **Options:** (a) the cli executor, the fallback of the session; (b) wait for the owner to start a session.
- **Own analysis:** (a). The app refuses a session start on a turn that a background task's end began ("Start sessions only on the user's own words"); the procedure says not to retry or wait. The worker of steps 1 to 3 reached its limit of three steps, so a fresh worker runs step 4.
- **Choice:** (a) · **Decided by:** the orchestrator.

### 2026-11-07 17:55 — step 4 started
- **Executor:** cli, the fallback of session: the app refuses a session start on a turn that a background task's end began · **Worker:** `claude -p` named flow-3-step-4, in a detached worktree of `origin/develop` (its session id comes with its report) · **Account:** nil10035@gmail.com · **Model:** Sonnet 5.5 at high effort · **Permissions:** auto · **Estimate:** 3 SP, 5-hour 5.4%, weekly 0.8%
- **Usage before:** 5-hour 21% (resets 2026-11-07T20:10:00Z) · weekly 80% (resets 2026-11-08T21:00:00Z)

### 2026-11-07 18:14 — step 4 ended: done
- **Usage after:** 5-hour 27% (resets 2026-11-07T20:10:00Z) · weekly 80% (resets 2026-11-08T21:00:00Z) · **Measured:** 5-hour +6%, weekly +0%, against an estimate of 5-hour 5.4% and weekly 0.8% (3.48 M cache-read tokens, 26k output, $1.04 at list price) · **Pull requests merged:** #189 (6.4), by auto-merge · **Ids done:** 6.4 · **Worker:** cli eb2445f0-4f56-4722-a5d7-f5f48d0f08fc; its `result` held only its last line, so the report was read from its transcript
- **Report:** method §8 "Output budgets and short reports" (read with a filter, short closing text, the step report's schema and cap) and a line in the definition of done (§4); every step prompt gets a `budget` section and the report schema (Status, Merged, Decisions, Deviations, Next step, Recommendations last), capped at 30 lines and 2,400 characters, the rest in the task's log; `harness flow report-check <file>`; `run-flow` treats a report over the cap as a deviation; `start-task`, `open-pull-request` and `end-session` cite the budgets. 828 tests pass. Deviations: no dry run under the audit (the next steps are the first to use the prompts); the report check is a command, not part of `check all`; `Recommendations` is a plain line, since the template splits sections on `##`.

### 2026-11-07 18:14 — decision D3: the procedures `run-flow`, `start-task`, `open-pull-request` and `end-session` and the step prompts take the budgets (`contract.change`)
- **Options:** (a) accept them as merged in #189; (b) revert.
- **Own analysis** (written before the worker's recommendations): (a). Task 6.4 asks for exactly this; the change is additive (a schema and a cap for reports, citations of the budgets), and a project's agents gain a check, not a new duty outside a flow. This entry is the approval #189 needed; it merged first.
- **Worker's recommendation:** D3, accept.
- **Choice:** (a) · **Decided by:** the orchestrator (seamless mode, `contract.change` D3).

### 2026-11-07 18:14 — decision D3: the new rules of the method (§8 and the line of §4), asked of the owner
- **Options:** (a) keep method §8 "Output budgets and short reports" and the line of the definition of done (§4) as merged in #189; (b) keep them as guidance, not rules (reworded as advice); (c) revert them and keep the budgets in the step prompts and the procedures only.
- **Own analysis** (written before the worker's recommendations): (a). They are the rule task 6.4 asks for, and the prompts and procedures already rest on them. But they add rules to the core method that bind every agent of every project, which is a change of the meaning of a core rule; the entry file keeps that for the owner whatever the mode, and the flow file says so for 6.4. The worker said no core rule changed; I read §8 and disagree, so I ask. #189 is merged already; (c) would be a revert pull request.
- **Worker's recommendation:** none on this point (it judged the method change a contract change, D3).
- **Choice:** asked of the owner; the flow stops here with step 4 ⏸.

### 2026-11-07 18:14 — stop: waits for the owner
- **Digest:** done: steps 1 to 4 (6.1 #183, 6.2 #185, 6.3 #187, 6.4 #189), with the records #184, #186 and #188; decided alone, for "review later": flow 2 counts as finished (17:20, D1), I-28 and I-29 into step 8a (17:25, D2), the runtime role `transcripts` (17:38, D3), the stack role `quiet-commands` (17:54, D3), the procedures' budgets (above, D3); usage: 5-hour 27% (resets 20:10 UTC), weekly 80% (resets 2026-11-08 21:00 UTC; the owner's threshold 95%); next: the owner answers the decision on method §8 and §4 above, then step 5 (6.5), whose worker starts fresh.
