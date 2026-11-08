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

### 2026-11-08 — Phase 2 is closed
- **Tasks:** 2.1 to 2.12 ✅ (the last ones by flow 4, released in `0.6.0`).
- **Branch:** `docs/close-phase-2`
- **Decisions / deviations from the plan:** the exit criteria were checked one by one: the method and the catalogue with sources and independent passes, `harness check security` and `harness review measure` with tests, the three rules of `AGENTS.md` each tied to a probe, and the off-plan record hold. The first security review was written, but seven findings had no place; on the owner's word they were filed (B-6 to B-10, I-48 and I-49), and the follow-up table of the report now names where each of the 14 went.
- **Problems / blockers / findings:** the catalogue is a draft until a person with security expertise reviews it. The findings the owner holds in the host's settings, and the private advisory for the high findings, stay the owner's.
- **Next step:** none in this phase; the owner promotes the backlog items and orders the issues.
- **Verify with:** `node tools/harness.mjs check all`
