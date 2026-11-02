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
