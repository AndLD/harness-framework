[← Flows](./README.md)

# Flow 2 — The security release

**Releases:** `next` · **Needs:** flow 1 · **Log:** [`flow-2-security-release.log.md`](./flow-2-security-release.log.md)

Phase 2 (security and review automation), the release the releases file calls `next`, after `0.3.0`. The steps are split by model, since 2.1 and 2.4 are C3 (Opus) and the rest C2 (Sonnet), and 2.2 and 2.3 are separate steps so that each fits one window on a small subscription: a
step is one model, so a worker is not reused across the line, and a C3 step is the only one that can be a 5 SP step on a small subscription (`harness flow check` flags a step that cannot
fit a window where the subscription is known). The version of the release is not decided yet (the releases file calls it `next`), so the flow ends in a decision that fixes it and
inserts the cut step. Written in task 5.9; the estimates are the provisional Claude Pro coefficients (`harness flow estimate 2`).

## Settings

```json
{
  "mode": "brainstorm",
  "askAt": "D2",
  "permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"] }
}
```

## Steps

| # | Kind | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | 2.1 | — | — | 5 | 13.5% | C3 | ⬜ |
| 2 | tasks | 2.2 | 1 | — | 3 | 4.8% | C2 | ⬜ |
| 3 | tasks | 2.3 | 2 | — | 3 | 4.8% | C2 | ⬜ |
| 4 | tasks | 2.4 | 3 | — | 3 | 8.1% | C3 | ⬜ |
| 5 | tasks | 2.5 | 4 | — | 3 | 4.8% | C2 | ⬜ |
| 6 | decision | the version of the security release (the releases file's `next` row), and the cut step to insert after this one | 5 | D3 | 1 | 0.3% | — | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
