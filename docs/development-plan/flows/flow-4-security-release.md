[← Flows](./README.md)

# Flow 4 — The security release

**Releases:** `0.6.0-dev.1`, `0.6.0-dev.2`, `0.6.0` · **Needs:** flow 3 · **Log:** [`flow-4-security-release.log.md`](./flow-4-security-release.log.md)

The security methodology of Phase 2, in the release `0.6.0` (named by the owner on 2026-11-05, who moved the security tasks out of `0.4.0` and then put Phase 6 before them), after `0.5.0`: the frame of the method (2.1), the two probe catalogues researched from named sources (2.8 for the project and its supply chain, 2.9 for the product, with attack scenarios), the automated checks that start from the scriptable probes (2.2), the first security review of the framework itself (2.4), and the security rules of core that its findings give (2.10). The steps are split by model: 2.1, 2.8, 2.9, 2.4 and 2.10 are C3 (Opus) and 2.2 is C2 (Sonnet); a C3 step of 5 SP is the largest one that can fit a window on a small subscription (`harness flow check` flags a step that cannot fit a window where the subscription is known). The flow's decision of step 7 (2026-11-08) inserted the rest: I-37, I-38, I-39, I-43 (added at step 7c) and 2.12 (a security policy file, added on the owner's word) before a development version `0.6.0-dev.1`, the consumer's take, and a decision on the final cut that stops for the owner. The owner chose at step 7h (2026-11-08) to fix what the first take found (I-46, I-47) and to cut `0.6.0-dev.2` and take it again, before a decision on the final cut that stops for the owner. The estimates are the provisional Claude Pro coefficients (`harness flow estimate 4`). The owner set the mode to seamless on 2026-11-05, as for flow 2. The flow runs after [flow 3](./flow-3-context-release.md); it was flow 3 until the owner put Phase 6 before it and the flows were renumbered to follow the order (the log says so).

## Settings

```json
{
  "mode": "seamless",
  "askAt": "D2",
  "repos": {
    "consumer": { "remote": "AndLD/bot-rts", "role": "consumer", "kinds": ["consumer-take"] }
  },
  "usage": { "stopAt": { "fiveHour": 85, "weekly": 99 } },
  "permissions": { "mode": "auto", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)", "Bash(sed *)", "Bash(ls *)"] }
}
```

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | 2.1 | — | — | 5 | 13.5% | C3 | ✅ |
| 2 | tasks | home | 2.8 | 1 | — | 5 | 13.5% | C3 | ✅ |
| 3 | tasks | home | 2.9 | 2 | — | 5 | 13.5% | C3 | ✅ |
| 4 | tasks | home | 2.2 | 3 | — | 3 | 4.8% | C2 | ✅ |
| 5 | tasks | home | 2.4 | 4 | — | 3 | 8.1% | C3 | ✅ |
| 6 | tasks | home | 2.10 | 5 | owner review | 3 | 8.1% | C3 | ✅ |
| 6a | tasks | home | I-30 | 6 | — | 2 | 0.5% | C2 | ✅ |
| 7 | decision | home | the cut step of `0.6.0` to insert after this one (the version is named by the owner, 2026-11-05) | 6a | — | 1 | 0.3% | — | ✅ |
| 7a | tasks | home | I-37 | 7 | — | 2 | 0.5% | C2 | ✅ |
| 7b | tasks | home | I-38 | 7a | — | 2 | 0.5% | C2 | ✅ |
| 7c | tasks | home | I-39 | 7b | owner review | 3 | 0.8% | C2 | ✅ |
| 7d | tasks | home | I-43 | 7c | — | 2 | 0.5% | C2 | ✅ |
| 7e | tasks | home | 2.12 | 7d | — | 1 | 0.3% | C2 | ✅ |
| 7f | cut | home | `0.6.0-dev.1` | 7e | — | 1 | 0.7% | C2 | ✅ |
| 7g | consumer-take | consumer | `0.6.0-dev.1` | 7f | — | 2 | 0.5% | C2 | 🟡 |
| 7h | decision | home | the final cut of `0.6.0`, or a `0.6.0-dev.2` first, after the consumer's take | 7g | owner review | 1 | 0.3% | — | ✅ |
| 7i | tasks | home | I-46, I-47 | 7h | — | 2 | 0.5% | C2 | ✅ |
| 7j | cut | home | `0.6.0-dev.2` | 7i | — | 1 | 0.7% | C2 | ✅ |
| 7k | consumer-take | consumer | `0.6.0-dev.2` | 7j | — | 2 | 0.5% | C2 | ⏸ |
| 7l | decision | home | the final cut of `0.6.0`, after the second take | 7k | owner review | 1 | 0.3% | — | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
