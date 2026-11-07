[← Phase 6](./README.md)

# Phase 6 — work log

Append-only log of the phase-wide matters of this phase (the session protocol of the method): decisions that concern the whole phase, and
pauses. Newest entry at the bottom.

## Entry template

```markdown
### YYYY-MM-DD — short summary
- **Tasks:** x.y, x.z
- **Branch:** `<type>/x.y-slug` — done | WIP (what remains, what is uncommitted or unpushed)
- **Decisions / deviations from the plan:** …
- **Problems / blockers / findings:** …
- **Next step:** the exact next action
- **Verify with:** commands that show the current state is healthy
```

## Entries

### 2026-11-05 — the phase is planned
- **Tasks:** 6.1 to 6.8, all new.
- **Branch:** `docs/phase-6-context-optimization`
- **Decisions / deviations from the plan:** the owner asked for the phase directly, without a backlog item, and asked that all of it be delivered to consumers like the plan and the flows. The levers and their order come from the measurement named in the phase index: quiet output first (the biggest sink), then budgets and the report schema, the orchestrator's restart threshold, and delegated reading; briefs of the documents are decided on the audit's numbers (6.7), since the documents were not the main sink. The release of the phase is not named: it is listed as not scheduled in the releases file until the owner chooses.
- **Problems / blockers / findings:** the measurement counts everything that entered one very long session (chars divided by four), not the peak of a context, and mixes the orchestrator's own work with its commands; 6.1 replaces it with a per-step audit.
- **Next step:** the owner names a release for the phase; then 6.1.

### 2026-11-05 — the phase is the release `0.5.0`, before the security release
- **Tasks:** 6.1 to 6.8, unchanged.
- **Branch:** `docs/release-0-5-0-phase-6`
- **Decisions / deviations from the plan:** the owner named the release: Phase 6 is `0.5.0`, and the security release (Phase 2's security tasks) moved to `0.6.0`, so that the security research runs on quiet output and short reports. The phase has a flow of its own, flow 3 (`Needs` flow 2); the security flow is flow 4 and needs flow 3 (the flows were numbered to follow the order of the releases).
- **Problems / blockers / findings:** none.
- **Next step:** run flow 2 (`0.4.0`), then flow 3.
- **Verify with:** `npm run docs:check`
- **Verify with:** `npm run docs:check`

### 2026-11-07 — the baseline: flow 1 (`harness flow audit 1`), and the aim
- **Tasks:** 6.1.
- **Run:** `node tools/harness.mjs flow audit 1 --orchestrator local_4577d53f-df69-4d54-939b-d64b00415fda` on the owner's machine: 14 sessions (the orchestrator, 6 workers of the desktop app and 7 of the command line named by worktree), every one found. Tool results are characters ÷ 4 (no runtime reports the count of a result); the agent's output is the usage the runtime reports (output tokens, thinking included). The orchestrator's transcript is the whole "Run flow 1" session (2026-11-05 10:00 to 22:00), which is the length of the flow.
- **Totals:** 1,137k tokens entered the context: tool results 461k (41%), the agent's own output 675k (59%). The orchestrator alone: 593k (results 154k, output 438k), peak context 485k, 614 turns, 163M tokens read again from the cache. The 13 workers: 544k (results 307k, output 237k), 551 turns, peaks of 78k to 176k, 55M read again from the cache. Everything that entered is read again on each later turn, so the long orchestrator session costs about three times all its workers together in cache reads although it entered about as much as they did.
- **Where the tool results went:** shell commands 392k (85%; 958 calls), reads of files 39k (8%), the app's tools together under 4%. By the first words of the command: `cat` 44k (10%), `grep` 41k (9%), `git show` 36k (8%), `sed` 30k (7%), `git fetch` 29k (6%: the output of the hooks of a fetch and a push), `gh pr` 21k (4%; 113 calls), `npm run` 18k (4%), `git diff` 15k. The largest single results are 6.5k to 7.4k tokens: a changelog or a migration note shown whole by `git show` or `cat`.
- **Per step (tool-result tokens, the figure the other tasks are judged by; the workers of the steps, a step that was restarted is the sum of its sessions):** 1: 38.9k · 1a: 34.9k · 1b: 31.2k · 1c: 17.6k · 1d: 19.0k · 1e: 31.3k · 1f: 7.9k · 1g: 53.2k · 1h: 28.6k · 2: 24.5k · 3: 19.4k. The median is **28.6k** tokens of tool results per step; the median entered per step is 45k.
- **The aim (the phase's, unless the owner names another figure here):** a third fewer tool-result tokens on a comparable step, so the median per step of a flow of the same kinds of steps is **at most 19.1k** (two thirds of 28.6k), with no rise in failed checks or deviations. The steps are comparable by kind and size (a task of 3 SP against a task of 3 SP, a cut against a cut), not by number; 6.8 compares by the steps of the first flow of this release that has the same kinds.
- **Hand count:** the step `1f` was counted from its raw transcript with a separate script (45 results, 31,727 characters → 7,932 tokens; 40 answers, 15,754 output tokens; peak 78,130): the audit prints the same figures. The fixture of `flow-audit.test.mjs` is counted by hand in its comments.
- **Caveats:** the figures are one flow (flow 1 had many consumer-take and cut steps, which are short); the orchestrator's output includes thinking tokens, which the runtime counts in `output_tokens`; the audit does not yet separate the first context (the entry file and the hooks' context) from what a step entered, and does not attribute the orchestrator's turns to steps (`harness flow calibrate` may take that later).
- **Next step:** 6.2, quiet output of the commands and hooks, the largest sink by command (`git fetch`/`push` hooks, whole documents).
- **Verify with:** `node tools/harness.mjs flow audit 1 --orchestrator local_4577d53f-df69-4d54-939b-d64b00415fda` (needs the owner's machine's sessions), `node --test tools/lib/flow-audit.test.mjs`.

### 2026-11-07 — briefs of the documents: not built, on the numbers of flows 1 to 3
- **Tasks:** 6.7.
- **Branch:** `feature/6.7-document-briefs-decision` — done.
- **Run:** every tool result of the sessions that `harness flow audit` finds for flows 1 (with its orchestrator), 2 and 3 (21 sessions, 1,511 turns), attributed to the files it read: the `file_path` of a `Read`, the paths named by a `cat`, `sed`, `head`, `tail`, `grep`, `wc`, `git show` or `git diff` (a result naming several files is split evenly between them), and the procedures loaded as skills; characters ÷ 4, as the audit counts. A one-off script on the owner's machine, not kept (like the hand count of 6.1).
- **The figures:** 667k tokens of tool results (flow 1: 461k, 2: 108k, 3: 97k); 298k of them read a file of the repository. By kind of file: code and configuration **126k** (19% of all results; `tools/harness.mjs` alone 12.5k in 57 calls), the plan's files **68k** (10%; `releases.md` 9.8k, the log of flow 1 7.6k, `DEVELOPMENT-PLAN.md` 6.2k), release notes 31k (5%; the migration note of `0.3.0` 10k, a reading the cut requires whole), other 26k, and the **rule documents** (the entry file, the method, the procedures, the contracts, the design, the profile, the stack and testing files) **48k (7.2%)**. Procedures loaded as skills: 8.6k more (10 loads).
- **The rule documents read, tokens / reads:** profile 16.3k / 28 (9.0k of it two whole reads of a consumer's profile in flow 1), `release` 7.5k / 11, `update-framework` 5.1k / 4, entry file 4.8k / 12 (3.2k of it the diff of a change to it, not a reading), runtime contract 3.0k / 5, `run-flow` 3.0k / 9, design 2.0k / 8, testing 2.0k / 2, the rest under 1.3k each; the method itself 0.5k / 3. By flow the share is steady: 7.9%, 5.5%, 6.0% of each flow's results.
- **The saving briefs could give, at most:** whole reads of rule documents are 25.3k (a brief of a third of the size saves two thirds: 16.9k); section reads by `sed`/`grep` 18.9k (an exact read by anchor saves perhaps a third: 6.3k); skills 2.9k at a third. About **26k of 667k, 3.9% of the tool results** (1.7% of all that entered, 1,549k), about 1.2k per worker session against the 9.5k fall per step that the aim asks. The entry file, loaded in every session, is 18k characters (4.5k tokens): halving it would save about 3.4M of the 265M tokens read again from the cache (1.3%), and it is a core rule document, the owner's. The rules of 6.4 (read with a filter, a whole file only where a procedure says so) and 6.6 (delegated reading) already target the same whole reads, so what briefs would add is smaller still.
- **Decisions / deviations from the plan:** **do not build briefs or `harness docs get`.** The saving is a few percent while the cost is a generator, a currency check and a rule-id check (5 SP or more), a second text of every rule document to review on each change, and the risk that an agent acts on a brief that dropped the reason a rule is applied as it is. Section reads exist where they pay: `harness profile get <role>` for the profile, and the stable anchors with `sed -n`/`grep` that the agents already use. The same holds for consumers' documents (nothing is generated for them). The larger sinks are reads of code and of the plan's own files, which the budgets of 6.4 govern.
- **Problems / blockers / findings:** flows 2 and 3 are counted without their orchestrators (their ids are not recorded), and flow 3 has only its first steps; the figures are of sessions before the quiet output of 6.2 and 6.3 reached the runs, which does not change reads of documents.
- **Next step:** 6.8, the consumers take the phase and the fall is measured.
- **Verify with:** `node tools/harness.mjs flow audit 2` (the totals above, per flow), `npm run docs:check`.
