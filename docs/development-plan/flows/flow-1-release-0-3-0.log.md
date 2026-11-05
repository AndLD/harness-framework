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

### 2026-11-05 10:25 — running
- **Orchestrator:** the desktop-app session of andrey.larionov.me@gmail.com, started by "Run flow 1" · **Mode:** brainstorm (askAt D2) · **Steps:** 1 to 3
- **Usage:** 5-hour 68% (resets 2026-11-05T12:30:00Z) · weekly 13% (resets 2026-11-10T07:00:00Z) (Pro)

### 2026-11-05 10:30 — step 1 started
- **Executor:** session · **Worker:** local_b5383ee4-3eb2-4cdd-881e-81222187117b · **Account:** andrey.larionov.me@gmail.com · **Model:** Sonnet 5.5 at high effort · **Estimate:** 1 SP, 0.6% (gate: 5-hour 4.8%, weekly 0.6% with the safety factor)
- **Usage before:** 5-hour 68% (resets 2026-11-05T12:30:00Z) · weekly 13% (resets 2026-11-10T07:00:00Z)

### 2026-11-05 10:50 — step 1 ended: done
- **Usage after:** 5-hour 71% (resets 2026-11-05T12:30:00Z) · weekly 13% (resets 2026-11-10T07:00:00Z) · **Measured:** 5-hour +3%, weekly +0%, against an estimate of 5-hour 4.8% and weekly 0.6% · **Pull requests merged:** none (release pull request #101 into `main` is open, not merged, not tagged) · **Ids done:** none (a cut has none)
- **Report:** the worker cut `release/0.3.0` from `origin/develop` (e97df63, after it first found its worktree on `main`), added the story of I-11 to `migrations/0.3.0.md` (the note predated it), ran `harness release` (versions `0.3.0`, 14 fragments into `CHANGELOG.md`), and passed `docs:check`, lint and the coverage run locally. Static checks of #101 were still running when I read it; `pr-title` and `changes` were green. It filed no report. It raised one decision (the next entry). Its recommendations: check the note against the changelog; merge `main` back into `develop` promptly.
- **Note review** (the unbiased analysis, as the procedure `release` asks of a cut): the report reached me whole, with its recommendations, before I could stop at their heading, so the independence below is partial; I wrote my own list from `CHANGELOG.md` of the release branch before I read `migrations/0.3.0.md`. List: added: local adapters (3.4), the releases file (5.1), flows and the flow tools (5.2, 5.4), usage (5.6) and `calibrate` (5.7), cross-repository steps and `remote-state` (5.8), the note (5.9); changed: the flow's authority over cuts and reports (5.3), the runtime contract version 2 with the required `executors` (5.5); fixed: I-8 (a damaged repository needs a manual repair), I-9, I-10, I-11. Required actions I expected: take the migration; a prose order written as a table; `executors` in a local runtime adapter; the resume phrases. The note says all four, names the manual repair after I-8, and links I-8 to I-11 and the smaller fixes of 5.9. It has no `TODO` and its headings match. I found it complete.

### 2026-11-05 10:50 — decision D2: cut `0.3.0-dev.1` before the final cut, or go straight to the final tag?
- **Options:** (a) go straight to the final cut, as the flow is written; (b) cut `0.3.0-dev.1` first (the procedure `release`, step 3), with a development note, have the consumer take it, and cut the final version after: it inserts steps into the flow (a D2 change).
- **Own analysis** (written after the report was read, see the note above): (b). The procedure says "tag a development version first" so that the consumer runs its checks before the final tag exists; the flow's step 1 was written as the final cut only, and the rule decides against it. A blocker found after the final tag costs a `0.3.1`; `0.2.0` had three development versions and its first run found four blockers (I-2 to I-5). This version changes the runtime contract and adds a migration script, which `bot-rts` has not run.
- **Worker's recommendation:** (a): the take of step 2 is itself the consumer's check, and a skip is a D2 deviation to log.
- **Choice:** none yet: the flow's `askAt` is D2, so it is the owner's, asked together with the final cut (D3) · **Decided by:** the owner (pending). The worker's argument holds for the checks, not for the cost of a published tag: a published final version cannot be taken back.

### 2026-11-05 11:05 — decision D2: cut `0.3.0-dev.1` before the final cut (the answer to the entry of 10:50)
- **Options:** (a) go straight to the final cut; (b) cut `0.3.0-dev.1` first, have the consumer take it, then cut the final version.
- **Own analysis:** see the entry of 10:50 (pick (b)); the worker had picked (a). The owner was asked because the flow's `askAt` is D2.
- **Worker's recommendation:** (a).
- **Choice:** (b) · **Decided by:** the owner ("Cut dev.1 first"); the picks of the orchestrator and the owner agree, and the worker's argument is answered in the entry of 10:50.

### 2026-11-05 11:05 — decision D2: insert the development version into the flow
- **Options:** (a) a new `0.3.0-dev.1` cut and take before step 1; (b) re-scope step 1 to the development cut and insert the take (1a) and the final cut (1b) after it, so no step is renumbered (a step with a suffix must stand after its base, which rules out putting the new cut before step 1).
- **Own analysis:** (b), the only shape `harness flow check` accepts that keeps every id. Step 1 now cuts `0.3.0-dev.1`, 1a is the consumer taking it, 1b is the final cut `0.3.0` with its stop for the owner's review (D3), and 2 and 3 keep their ids and scopes. The releases file gains the row `0.3.0-dev.1` in the same commit, and the flow declares both releases.
- **Worker's recommendation:** none (a decision of the flow's shape; no worker was asked).
- **Choice:** (b) · **Decided by:** orchestrator, as a consequence of the owner's choice above.
- **What happens to the work already done:** the release branch `release/0.3.0` (pull request #101, final versions and changelog prepared at commit `ea544d9`, the note of the I-11 story at `b002db3`) is the starting point of the new step 1: the worker takes the final preparation off the branch (the fragments and the `Unreleased` section back, the versions to a development version), writes `migrations/0.3.0-dev.1.md`, runs `harness release --dev`, and leaves #101 a draft. The final preparation comes back in step 1b. The entry of 10:50 ("step 1 ended: done") stands as what it was, the first preparation of the final cut, which this decision supersedes; the State of step 1 returns to ⬜.
