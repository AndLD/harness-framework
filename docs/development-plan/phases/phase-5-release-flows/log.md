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
