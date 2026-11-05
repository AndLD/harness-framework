[← Flows](./README.md)

# Flow 2 — The security release

**Releases:** `0.4.0` · **Needs:** flow 1 · **Log:** [`flow-2-security-release.log.md`](./flow-2-security-release.log.md)

Phase 2 (security and review automation), the release `0.4.0` of the releases file (named by the owner on 2026-11-05; it was `next`), after `0.3.0`. Tasks 2.7 (workers of a flow as nested sessions, with the order of the executors) and 2.6 (the switch for the write permission of the plan's files) come first, so that the rest of the flow runs under them; the owner confirmed the executor order of 2.7 on 2026-11-05. The steps are split by model, since 2.1, 2.4 and 2.7 are C3 (Opus) and the rest C2 (Sonnet), and 2.2 and 2.3 are separate steps so that each fits one window on a small subscription: a
step is one model, so a worker is not reused across the line, and a C3 step is the only one that can be a 5 SP step on a small subscription (`harness flow check` flags a step that cannot
fit a window where the subscription is known). The owner named and confirmed the version `0.4.0`, so the flow ends in a decision that inserts the cut step. Written in task 5.9; the estimates are the provisional Claude Pro coefficients (`harness flow estimate 2`).

## Settings

```json
{
  "mode": "seamless",
  "askAt": "D2",
  "permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"] }
}
```

## Steps

| # | Kind | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | 2.7 | — | — | 5 | 13.5% | C3 | ⬜ |
| 2 | tasks | 2.6 | 1 | — | 3 | 4.8% | C2 | ⬜ |
| 3 | tasks | 2.1 | 2 | — | 5 | 13.5% | C3 | ⬜ |
| 4 | tasks | 2.2 | 3 | — | 3 | 4.8% | C2 | ⬜ |
| 5 | tasks | 2.3 | 4 | — | 3 | 4.8% | C2 | ⬜ |
| 6 | tasks | 2.4 | 5 | — | 3 | 8.1% | C3 | ⬜ |
| 7 | tasks | 2.5 | 6 | — | 3 | 4.8% | C2 | ⬜ |
| 8 | decision | the cut step of `0.4.0` to insert after this one (the version is confirmed by the owner, 2026-11-05) | 7 | — | 1 | 0.3% | — | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
