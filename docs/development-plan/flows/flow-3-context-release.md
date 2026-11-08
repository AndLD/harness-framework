[← Flows](./README.md)

# Flow 3 — The context optimization release

**Releases:** `0.5.0-dev.1`, `0.5.0` · **Needs:** flow 2 · **Log:** [`flow-3-context-release.log.md`](./flow-3-context-release.log.md)

Phase 6 (context optimization for agents and consumers), in the release `0.5.0` (named by the owner on 2026-11-05, who put it before the security release so that the security work runs on quiet output and short reports), after `0.4.0`: the audit and the baseline (6.1), quiet output of the framework's commands and hooks (6.2) and of the stack's commands (6.3), output budgets and a short step-report schema (6.4), a restart threshold for the orchestrator (6.5), delegated verbose reading (6.6), the decision about document briefs on the audit's numbers (6.7), and the consumers taking it with the fall measured (6.8). The steps follow the order of the phase: 6.1 first, since its baseline is the figure the others are judged by. 6.7 is C3 (Opus) and the other tasks C2 (Sonnet). Tasks 6.4 and 6.5 change what the procedures `run-flow` and others mean and the runtime contract; the flow decides those changes as the kind `contract.change` (D3, I-20) and lists them in its digest, so the two steps no longer stop for the owner's review (removed on 2026-11-07); a change of the meaning of a core rule that either makes still waits for the owner. The flow ends in a decision that inserts the cut step and the consumer's take. The estimates are the provisional Claude Pro coefficients (`harness flow estimate 3`). The owner set the mode to seamless on 2026-11-06, as for flows 2 and 4. Flow 4 (the security release, `0.6.0`) runs after this flow.

## Settings

```json
{
  "mode": "seamless",
  "askAt": "D2",
  "repos": {
    "consumer": { "remote": "AndLD/bot-rts", "role": "consumer", "kinds": ["consumer-take"] }
  },
  "usage": { "stopAt": { "fiveHour": 85, "weekly": 95 } },
  "permissions": { "mode": "auto", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"] }
}
```

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | 6.1 | — | — | 5 | 8.0% | C2 | ✅ |
| 2 | tasks | home | 6.2 | 1 | — | 3 | 4.8% | C2 | ✅ |
| 3 | tasks | home | 6.3 | 2 | — | 3 | 4.8% | C2 | ✅ |
| 4 | tasks | home | 6.4 | 3 | — | 3 | 4.8% | C2 | ✅ |
| 5 | tasks | home | 6.5 | 4 | — | 3 | 4.8% | C2 | ✅ |
| 6 | tasks | home | 6.6 | 5 | — | 2 | 3.2% | C2 | ✅ |
| 7 | tasks | home | 6.7 | 6 | — | 2 | 5.4% | C3 | ✅ |
| 8 | tasks | home | 6.8 | 7 | — | 2 | 3.2% | C2 | ✅ |
| 8a | tasks | home | I-23, I-24, I-25, I-26, I-28, I-29 | 8 | — | 6 | 1.5% | C1 | ✅ |
| 8b | tasks | home | I-27 | 8a | — | 2 | 0.5% | C2 | ✅ |
| 9 | decision | home | the cut step of `0.5.0`, the consumer's take and 6.9 (the measurement) to insert after this one (the version is named by the owner, 2026-11-05) | 8b | — | 1 | 0.3% | — | ✅ |
| 9a | cut | home | `0.5.0-dev.1` | 9 | — | 1 | 0.7% | C2 | ✅ |
| 9b | consumer-take | consumer | `0.5.0-dev.1` | 9a | — | 2 | 0.5% | C2 | ✅ |
| 9c | tasks | home | 6.9 | 9b | — | 1 | 1.6% | C2 | ✅ |
| 9d | decision | home | what the take of `0.5.0-dev.1` and 6.9 found: fix steps and a `dev.2`, or the final cut | 9c | — | 1 | 0.3% | — | ✅ |
| 9e | tasks | home | I-31, I-32 | 9d | — | 2 | 0.5% | C1 | ✅ |
| 9f | cut | home | `0.5.0` | 9e | — | 1 | 0.7% | C2 | ✅ |
| 9g | tasks | home | I-33 | 9f | — | 1 | 0.3% | C1 | ✅ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
