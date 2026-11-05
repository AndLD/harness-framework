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

### 2026-11-05 11:15 — step 1 started
- **Executor:** session · **Worker:** local_bb4b1578-6bf1-45bd-8cd4-7e6ad621786f · **Account:** andrey.larionov.me@gmail.com · **Model:** Sonnet 5.5 at high effort · **Estimate:** 1 SP, 0.6% (gate: 5-hour 4.8%, weekly 0.6% with the safety factor); the scope is now the cut `0.3.0-dev.1` (see the decision of 11:05)
- **Usage before:** 5-hour 75% (resets 2026-11-05T12:29:59Z) · weekly 14% (resets 2026-11-10T06:59:59Z)
- **Prompt:** the standard prompt of the step, with the orchestrator's additions: reuse `release/0.3.0` and PR #101, take off the final preparation by a revert commit, run `harness release --dev`, write `migrations/0.3.0-dev.1.md`, make #101 a draft.

### 2026-11-05 11:40 — step 1 ended: done
- **Usage after:** 5-hour 77% (resets 2026-11-05T12:29:59Z) · weekly 14% (resets 2026-11-10T06:59:59Z) · **Measured:** 5-hour +2%, weekly +0%, against an estimate of 5-hour 4.8% and weekly 0.6% · **Pull requests merged:** none (#101 is a draft, retitled `chore(release): 0.3.0-dev.1`, and stays unmerged: a development version is tagged on the release branch) · **Ids done:** none
- **Report:** the worker merged `origin/develop` into `release/0.3.0` (by merge commit), took the final preparation off by a revert commit (`1ff93f6`, no rewrite of history) keeping the I-11 story of the note, wrote `migrations/0.3.0-dev.1.md` against `0.2.0`, and ran `harness release --dev` (versions `0.3.0-dev.1`, fragments and `Unreleased` kept): head `003d02a`. Locally docs check, lint and coverage passed; it filed no report and raised no decision. Its recommendations: wait for green CI before tagging; finish `migrations/0.3.0.md` only in step 1b, with what the take of dev.1 finds; regenerate the final changelog in 1b.
- **Note review:** my list of the entry of 10:50 (written from the changelog before I read any note) holds for this version, and I read `migrations/0.3.0-dev.1.md` in full against it: all the changes, the four required actions (the migration, a prose order, `executors` of a local runtime adapter, the resume phrases), the manual repair after I-8 and the optional actions are there; no `TODO`; the note says it is the trial version, and the final note stays the complete story. Complete.

### 2026-11-05 11:40 — decision D1: cut `0.3.0-dev.1`
- **Options:** (a) tag the head of `release/0.3.0` as `0.3.0-dev.1` now; (b) send the note back or wait.
- **Own analysis:** (a): the level D1 is below the flow's `askAt` (D2), so the cut is the orchestrator's; the note is complete (the entry above), the four checks of #101 were green at `003d02a` (`pr-title`, `changes`, `static checks`, `verify`), and the version is a development tag with no `v`, which publishes nothing.
- **Worker's recommendation:** (a), after green CI.
- **Choice:** (a): the annotated tag `0.3.0-dev.1` on `003d02a`, pushed · **Decided by:** orchestrator; no merge into `main` (a development version stays on its release branch).

### 2026-11-05 11:45 — stop: usage
- **Digest:** done: step 1, the cut of `0.3.0-dev.1` (tag `0.3.0-dev.1` on `003d02a`, release pull request #101 a draft); decided alone: the cut of the development version, D1 (entry of 11:40) and the insertion of steps 1a and 1b, D2, as a consequence of the owner's choice of the development version first (entries of 11:05); usage: 5-hour 77% (resets 2026-11-05T12:29:59Z), weekly 14%; step 1a (the consumer takes `0.3.0-dev.1`, estimated 12% of the 5-hour window with the safety factor) would pass the 85% threshold, so the gate says WAIT until the reset; next: after 12:30 UTC run "Continue flow 1": step 1a, `harness flow gate 1 1a` first, then the worker in the consumer's folder; then 1b, the final cut, which stops for the owner's review (D3).

### 2026-11-05 12:35 — running
- **Orchestrator:** the desktop-app session of andrey.larionov.me@gmail.com, started by "Continue flow 1" (the claim of 10:25 ended with the "stop: usage" entry of 11:45) · **Mode:** brainstorm (askAt D2) · **Steps:** 1a to 3
- **Usage:** 5-hour 0% (resets 2026-11-05T17:30:00Z) · weekly 15% (resets 2026-11-10T07:00:00Z) (Pro)

### 2026-11-05 12:35 — step 1a started
- **Executor:** session, a fresh worker in the consumer's folder (the previous worker was in the home repository and its cache is long gone) · **Worker:** local_afe1c87f-6bb3-44ba-9538-5269505844d4 · **Account:** andrey.larionov.me@gmail.com · **Model:** Sonnet 5.5 at high effort · **Estimate:** 2 SP, 1.6% (gate: 5-hour 14.4%, weekly 1.9% with the safety factor)
- **Usage before:** 5-hour 0% (resets 2026-11-05T17:30:00Z) · weekly 15% (resets 2026-11-10T07:00:00Z)
- **Prompt:** the standard prompt of the step, with the facts of the framework repository: the tag `0.3.0-dev.1` on `003d02a`, both notes, and the instruction to open the pull request as a draft that names the version and not to merge it.

### 2026-11-05 13:10 — step 1a ended: done
- **Usage after:** 5-hour 5% (resets 2026-11-05T17:29:59Z) · weekly 15% (resets 2026-11-10T06:59:59Z) · **Measured:** 5-hour +5%, weekly +0%, against an estimate of 5-hour 12% and weekly 1.6% · **Pull requests merged:** none: the consumer's draft pull request #297 ("chore(framework): take 0.3.0-dev.1", AndLD/bot-rts) is open and not merged, as the step asked; the checks of the consumer were still running when I read its state, and the lock of the consumer names `0.2.0` until it merges (`harness flow status` shows the step as 🟡 for that reason) · **Ids done:** none
- **Report:** the worker took `0.3.0-dev.1` by `update-framework`: the migration in one commit, two commits of the consumer's own fixes; the lock now names `0.3.0-dev.1` on the branch. Action 1 (the migration) proved by `check generated` and `migrations.version`; actions 2 and 3 did not apply; action 4 left out because the consumer runs no flows. Locally `check all`, `flow check`, lint, typecheck, boundaries, i18n, `test:scripts` and the whole push gate (api 2539, client 883, mcp 74) passed; e2e, Lighthouse and the build were left to the consumer's CI; probes were left out (`probes.run` is `ask` and nobody could be asked; the nine probes are listed in the pull request). It filed no report. **What the notes missed**, as the worker names it: (1) `check layers` refuses the new `releases.md` until a layer holds it, with no hint in the notes; (2) the ordinary word "base" at `core/plan/README.md:217` of the vendored core fails the consumer's `check core` (its product terms hold "base"); (3) the migration script wrote the prose of the old table into the "Tasks, in order" column, which the tools read as ids, left a skipped release `0.1.2` at ⬜ so that the plan index said "Next: 0.1.2", and left the old arrow order of phases in Notes with no message; the worker repaired the table by hand; (4) the push gate and the CI run every package's whole suite after a take, since `harness/**` counts as code; the notes do not say so. Its recommendations: fix the migration script before `0.3.0`; have `migrate` or the note place `releases.md` in a layer; reword "base" in the core or say so in the note.
- **Findings for the home repository** (I read the three of them as defects of the framework's migration and note; the fourth is a missing line in the note): they are not yet in the issue queue.

### 2026-11-05 13:10 — decision D2: what the findings of the first take do to `0.3.0`
- **Options:** (a) record them as issues of the queue (I-12: the migration script writes the release table cleanly — no prose in the ids column, a skipped release not shown as next, a prose order of phases reported; I-13: the first `check all` after a take — the layer of `releases.md` placed or named in the note, "base" reworded in the core, the cost of the gate said in the note), add both to the release `0.3.0`, fix them in steps of this flow, cut `0.3.0-dev.2`, and have the consumer take it again before the final cut; (b) the same fixes, no second development version: the final take (step 2) checks them; (c) fix only the note now and move the script's fix to a `0.3.1`.
- **Own analysis** (written after the report was read in full, as the tool delivered it whole; the independence is partial, see the note of 10:50): (a). The reason for the development version was to find what a consumer's take blocks; the finding (3) is a defect in the one tool a consumer must run, and a corrected script is only proved by a second take, which after a final tag costs a `0.3.1`. The two issues are small (the script's table writing, and three lines of text) and fit one step each. The steps add about 3 SP and a second take of about 2 SP. Adding tasks to a release and steps to the flow is plan-shaping, so it is D2, and the flow's `askAt` is D2.
- **Worker's recommendation:** fix the script before `0.3.0` and place `releases.md` in a layer by `migrate` or the note; reword "base" or say so in the note: the same direction as (a) without the second development version; its suggestions of level (D4 for filing upstream, D1 for the consumer's own table, D2 for the probes) concern the consumer's repository and a report on the host, which this flow does not create; the consumer's own choices (the status of `0.3.0` and `0.1.2` in its table, the probes) are that repository's owner's, never this flow's.
- **Choice:** none yet: the flow's `askAt` is D2, so it is the owner's · **Decided by:** the owner (pending).
