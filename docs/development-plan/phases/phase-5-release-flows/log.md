[← Phase 5](./README.md)

# Phase 5 — work log

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

### 2026-11-04 — planned with the owner
- **Tasks:** 5.1 to 5.9 (none started).
- **Branch:** `docs/plan-phase-5-release-flows` — the plan only.
- **Decisions / deviations from the plan:** the owner's decisions of 2026-11-04, from a discussion of how to hand the running of releases to an agent:
  - **The release order gets a file of its own**, `releases.md` beside the plan index. The index stays the one entry point and links to it
    (option A); the other way round (the releases file as the primary plan) was rejected, since it would move the entry point of every
    project and be empty for a project that ships no versions.
  - **Many flows per project**, like phases: a flow holds one or more releases, a release belongs to at most one flow, and one flow may hold
    them all for a run from start to end.
  - **Modes:** brainstorm (asks the owner from a threshold up) and seamless (decides everything, logs everything). The threshold `askAt`
    defaults to D2. Levels: D0 mechanical, D1 local, D2 plan-shaping, D3 contract or scope, **D4 external communication** (added by the owner:
    answering or closing reports on the host). Hard limits that no mode crosses: admin bypass, a cut on a red check, the non-negotiables,
    force-push or deleting a remote branch.
  - **The orchestrator may cut releases** itself, at the level its flow gives a cut: by default a development version D1, a final release or a
    hotfix D3 (the owner kept these defaults). This changes core rules (5.3).
  - **Executors:** a controlled session by default, a subagent for short analysis steps, manual (the owner pastes) as the fallback; a worker
    session is reused by the next step only under conditions (same repository, model and effort, related steps, small context, no long pause
    that would let the prompt cache expire, at most three steps), measured so the default can change (5.5, 5.7).
  - **The orchestrator's own changes go by one pull request per step** by default; one per release cut is a setting.
  - **External repositories are in this phase** (5.8), not deferred; a single-repository flow stays the default.
  - **The phase goes into `0.3.0`**, after 3.4. Since `0.3.0` holds the phase itself, its run is still driven by hand; the first flow of this
    repository starts with the cut of `0.3.0` (5.9).
- **Problems / blockers / findings:** the consuming project writes its order of development as prose (arrows of phase numbers), which the tools
  cannot read; the migration of 5.1 moves a table and tells a project with prose what to do.
- **Next step:** finish `0.2.0` and its consumer run, then 3.4, then start this phase with 5.1 ("Start Phase 5").
- **Verify with:** `npm run docs:check`

### 2026-11-05 — Phase 5 is done
- **Tasks:** 5.1 to 5.9 (9 of 9 ✅), and flow 1 step 3 (this close).
- **Branch:** `docs/close-phase-5` — done.
- **Decisions / deviations from the plan:** every exit criterion holds; what each rests on:
  1. *The release order is read from `releases.md` by the tools and the hook, and the plan index links to it* — 5.1 ([#87](https://github.com/AndLD/harness-framework/pull/87)): `tools/lib/releases.mjs` reads the file, `plan summary` writes the generated block of the index that links to it, and the session-start hook of this session named the flow and the next task from it.
  2. *The flow templates, the procedure `run-flow` and the tools `harness flow check`, `status`, `next`, `prompt` and `calibrate` exist with their tests* — 5.2 (#88), 5.4 (#91), 5.7 (#95): `core/plan/flow-template.md`, `core/plan/flow-log-template.md`, `core/procedures/run-flow.md`, and `tools/lib/flow-*.mjs` each with a `*.test.mjs` beside it; `node tools/harness.mjs flow check` passes on this tree.
  3. *Both runtime adapters pass the conformance suite with their executors* — 5.5 (#92): `harness adapter test adapters/runtime/claude-code` and `…/cursor` each pass 14 checks (0 skipped), among them "executors" and "usage", run again on this branch.
  4. *The Git rules and the procedures `release` and `triage-reports` let a flow cut releases and answer reports at its levels, with the owner's approval recorded in the pull request* — 5.3 (#89): the rules `agent.ask-merge` and `agent.plan-approval` of the entry file and the "When a flow cuts" section of `core/procedures/release.md` and the flow paragraph of `triage-reports.md` say it; the owner's approval of that change of core rules is the one recorded in #89.
  5. *This repository has its first flows and `harness flow check` passes on them* — 5.9 (#97): flows 1 and 2 (`docs/development-plan/flows/`), checked above; flow 1 has run since, and its three development takes and its final cut are in its log.
  6. *`0.3.0` is tagged, and its migration note says how a project moves its order of development and starts its first flow* — the tag `v0.3.0` is the merge commit `0de995f` of the release pull request #101 on `main`, and the GitHub release exists; `migrations/0.3.0.md` (actions 1 to 3 move or write the releases table, "Start your first flow" is its optional action) was reviewed by the cut step of flow 1.
  
  **What the consumer's take is, and is not.** No exit criterion names a consumer; the flow's step 2 supplies it, and it counts for this phase as a run, not as a lock. The consumer, AndLD/bot-rts, took `0.3.0-dev.1` to `-dev.3` on its draft pull requests #297 to #299 (the three takes found I-12, I-13, I-15 and I-16, the first three fixed before the tag), and takes `0.3.0` on its pull request "chore(framework): take 0.3.0" (#300), which is open and **not merged**: that repository's owner decides it, and its lock names `0.2.0` until it does. The close does not wait for that merge, since no criterion needs the consumer's lock to name `0.3.0`; the `0.3.0` row of `releases.md` says the same in its notes.
  
  **Also changed with the close:** the status of the phase (✅), the summary of the plan index (`plan summary`), and the releases file: `0.3.0` is ✅ and, as the rows of `0.2.0` were, so are its three development versions (🏷 → ✅), which would otherwise stay the "current release"; the line of the index now says no release is being developed, and the next one is `next` (Phase 2).
- **Problems / blockers / findings:** none open for this phase. Deferred, with their records: I-16 (what the migration still leaves for the project's hand), I-14, I-17 (open issues, not this phase's tasks); the usage coefficients of the flows are provisional until `flow calibrate` has data (5.7); parallel steps (waves) were out of scope by design.
- **Next step:** stop. Phase 2 is next in the order of development (the row `next`), when the owner asks for it; the owner or the consumer's owner merges #300; the orchestrator closes flow 1.
- **Verify with:** `npm run docs:check`, `node tools/harness.mjs flow check`, `node tools/harness.mjs plan summary --check`.
