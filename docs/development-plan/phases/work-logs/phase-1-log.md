[← Phase 1](../phase-1-adoption-presets-proof.md)

# Phase 1 — work log

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

### 2026-11-02 — the repository is bootstrapped from its own tree
- **Tasks:** none yet; this entry records the start (task 17.15 of the plan of the project this framework was extracted from).
- **Branch:** the bootstrap commit on `develop`, the first push by the owner.
- **Decisions / deviations from the plan:** the repository is the framework's own project in lock mode `self` (`harness bootstrap --self`, profile role `paths.frameworkDir` is `.`): the tools are at `tools/`, the core at `core/`, nothing is vendored. The staging folder of the old repository was copied in as it was at `0.1.0-dev`; the design moved to `docs/design.md`. The plan is the tables of the design, section 10: Phase 1 (12 SP) and Phase 2 (17 SP); Phase 3 is the open-ended phase.
- **Problems / blockers / findings:** (1) the CLI and the runtime hooks do nothing, without a message, when started through a symbolic link (`process.argv[1]` is the link, `import.meta.filename` the real path): a task for Phase 3. (2) Selecting an adapter that lives in the consuming project's own repository (`local:`) is not built. (3) GitHub offers no rulesets for a private repository on a free plan, so `host.protection` is `false` and the Git hooks and the agent runtime's hooks hold the branch rules; protect the branches with `node tools/harness.mjs host protect` when the repository is public or the plan changes, after setting `host.protection` to `true`.
- **Next step:** Phase 1, task 1.1 (`harness adopt`), after the first push and the tag `0.1.0-dev.1`.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — 1.1 done: `harness adopt`
- **Tasks:** 1.1 ✅ (its log: [`phase-1/1.1.md`](./phase-1/1.1.md))
- **Branch:** `feature/1.1-harness-adopt` — done, PR #2
- **Decisions / deviations from the plan:** one engine with an `adopt` mode; a new optional runtime role `hook-adoption`; nothing deleted or committed; the project's entry file keeps its text and gains the managed blocks at its end.
- **Problems / blockers / findings:** none that block. Older profile formats are not migrated.
- **Next step:** 1.2 (the Cursor preset), `C2`.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — decision: `0.1.0` ships with the Cursor preset unverified
- **Tasks:** 1.2, 1.5 and the `0.1.0` tag.
- **Branch:** `docs/phase-1-cursor-unverified`
- **Decisions / deviations from the plan:** the owner has no Cursor subscription yet and chose, on 2026-11-02, to tag `0.1.0` with the Cursor preset marked **unverified** rather than hold the release. In practice: (1) task 1.2 writes the preset
  from Cursor's documentation, records the event samples as written-from-documentation, and writes the owner's checklist for a real session into the adapter's README; the README, the manifest description and the changelog say that
  the preset is unverified in a live session. (2) Task 1.5 does its automated part only (the bootstrap of each combination, `harness check all`, the targeted review) and does **not** wait for a Cursor session. (3) "Continue Phase 1" is the owner's
  approval to tag `0.1.0` after 1.5: the session cuts the release by the release procedure (`harness release`, the release branch, its merges into the production and the integration branch, the tag) and **stops after the tag**; for this release only, the owner's decision is the approval of those merges that the Git rules otherwise ask for. (4) The checklist stays open; whoever runs it
  reports the result, and a fix ships as `0.1.1`. The consuming project's own exit criterion (the owner has run the Cursor preset in a real session) stays open there and is not reworded by this decision.
- **Problems / blockers / findings:** none.
- **Next step:** 1.2 (the Cursor preset), `C2`, then 1.3, 1.4, 1.5, then the `0.1.0` tag.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — 1.2 done: the Cursor preset
- **Tasks:** 1.2 ✅ (its log: [`phase-1/1.2.md`](./phase-1/1.2.md))
- **Branch:** `feature/1.2-cursor-preset` — done, PR #4
- **Decisions / deviations from the plan:** native and compat modes, decided by whether `claude-code` is selected; `.cursorignore` is a managed block that the sync adds (a new optional runtime role `managed-blocks`, `#` markers); the preset is documented as unverified in a live session, with the checklist in its README.
- **Problems / blockers / findings:** none that block.
- **Next step:** 1.3 (the Python preset, by the new-adapter procedure), `C2`.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — 1.3 done: the Python preset
- **Tasks:** 1.3 ✅ (its log: [`phase-1/1.3.md`](./phase-1/1.3.md))
- **Branch:** `feature/1.3-python-preset` — done, PR #5
- **Decisions / deviations from the plan:** the preset follows the new-adapter procedure; six deviations are fixed in the procedure and the guide (a summary command for a tool that writes no neutral summary, an ignore `pattern`, TOML version files, `.nvmrc` as lines, no hand-written lock file, uv in the framework's CI).
- **Problems / blockers / findings:** a project with two stacks gets duplicate CI job ids; task 1.5 fixes it.
- **Next step:** 1.4 (the examples), `C1`.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — 1.4 done: the examples
- **Tasks:** 1.4 ✅ (its log: [`phase-1/1.4.md`](./phase-1/1.4.md))
- **Branch:** `feature/1.4-examples` — done, PR #6
- **Decisions / deviations from the plan:** the product-knowledge skeleton is a set of scaffold templates (it must travel with the vendored copy), `examples/` holds it filled; the sample plan is a reference and is not written into a new project; the plan, phase and code-review bindings are not written by the bootstrap.
- **Problems / blockers / findings:** none that block.
- **Next step:** 1.5 (the proof), `C2`; it also fixes the duplicate CI job ids of two stacks (found in 1.3). Then the `0.1.0` tag.
- **Verify with:** `npm run docs:check`; `npm test`

### 2026-11-02 — 1.5 done: the proof of §3.4
- **Tasks:** 1.5 ✅ (its log: [`phase-1/1.5.md`](./phase-1/1.5.md))
- **Branch:** `feature/1.5-proof` — done, PR #7
- **Decisions / deviations from the plan:** the proof is a script in the repository (`tests/proof/`), so that it can be run again for `0.1.1`; the real Cursor session is not part of it (decision of 2026-11-02).
- **Problems / blockers / findings:** the proof held on all five projects (62 checks) after three defects were fixed in this task: duplicate CI job ids with two stacks, and a document map that dropped rows (which left the releases guide, the changelog and the plan method unreachable).
- **Next step:** finish Phase 1 and cut `0.1.0` by the release procedure (the decision of 2026-11-02 is the owner's approval of its merges), then stop.
- **Verify with:** `npm run docs:check`; `npm test`; `tests/proof/proof.sh <directory>`

