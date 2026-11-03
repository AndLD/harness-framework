[← Phase 2](./README.md)

# Phase 2 — work log

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

### 2026-11-03 — the place of this phase in the order
- **Tasks:** none changed.
- **Branch:** `docs/queue-rollback-probes-local-adapters`
- **Decisions / deviations from the plan:** the owner's order of development puts this phase after `0.3.0` (local adapters), and earlier if the
  repository goes public or a second person uses the framework.
- **Problems / blockers / findings:** none.
- **Next step:** after `0.3.0`.
- **Verify with:** `npm run docs:check`
