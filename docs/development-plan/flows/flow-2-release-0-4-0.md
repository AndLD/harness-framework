[← Flows](./README.md)

# Flow 2 — The 0.4.0 release

**Releases:** `0.4.0-dev.1`, `0.4.0` · **Needs:** flow 1 · **Log:** [`flow-2-release-0-4-0.log.md`](./flow-2-release-0-4-0.log.md)

What the releases file holds for `0.4.0`, after `0.3.0`: the tasks that change how flows and sessions work (2.7, workers of a flow as nested sessions with the order of the executors; 2.6, the switch for the write permission of the plan's files), the two tasks of Phase 2 that are not security work (2.3, review measurements; 2.5, the off-plan record), and the open issues of the queue. The owner named and confirmed the version `0.4.0` on 2026-11-05; the security tasks of Phase 2 moved to `0.6.0` and [flow 4](./flow-4-security-release.md) the same day, after Phase 6 (`0.5.0`, [flow 3](./flow-3-context-release.md)). The owner confirmed the executor order of 2.7 on 2026-11-05. Task 2.7 was split on 2026-11-05 (2.7 and 2.11, steps 1 and 1a) when the gate found the 5 SP step of Opus larger than an empty 5-hour window. The steps are split by model: 2.7 is C3 (Opus), the other tasks C2 (Sonnet), and the issues C1. The flow ends in a decision that inserts the cut step. This file was written in task 5.9 as "the security release" and was reshaped on 2026-11-05; the estimates are the provisional Claude Pro coefficients (`harness flow estimate 2`).

## Settings

```json
{
  "mode": "seamless",
  "askAt": "D2",
  "repos": {
    "consumer": { "remote": "AndLD/bot-rts", "role": "consumer", "kinds": ["consumer-take"] }
  },
  "permissions": { "mode": "auto", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"] }
}
```

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | 2.7 | — | — | 3 | 8.1% | C3 | ✅ |
| 1a | tasks | home | 2.11 | 1 | — | 2 | 5.4% | C3 | ✅ |
| 2 | tasks | home | 2.6 | 1a | — | 3 | 4.8% | C2 | ✅ |
| 3 | tasks | home | 2.3 | 2 | — | 3 | 4.8% | C2 | ✅ |
| 4 | tasks | home | 2.5 | 3 | — | 3 | 4.8% | C2 | ✅ |
| 5 | tasks | home | I-19, I-18, I-7 | 4 | — | 5 | 8% | C1 | ✅ |
| 6 | tasks | home | I-17, I-14, I-16 | 5 | — | 4 | 6.4% | C1 | ✅ |
| 6a | tasks | home | I-22 | 6 | — | 1 | 0.25% | C1 | ✅ |
| 7 | decision | home | the cut steps of `0.4.0` to insert after this one (the version is confirmed by the owner, 2026-11-05) | 6 | — | 1 | 0.3% | — | ✅ |
| 7a | cut | home | `0.4.0-dev.1` | 6a | — | 1 | 0.7% | C2 | ✅ |
| 7b | consumer-take | consumer | `0.4.0-dev.1` | 7a | — | 2 | 0.5% | C2 | ⬜ |
| 7c | decision | home | what the take of `0.4.0-dev.1` found: fix steps and a `dev.2`, or the final cut | 7b | — | 1 | 0.3% | — | ⬜ |
| 7d | cut | home | `0.4.0` | 7c | — | 1 | 0.7% | C2 | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
