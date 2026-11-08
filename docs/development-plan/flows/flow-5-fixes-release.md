[← Flows](./README.md)

# Flow 5 — The fixes after the security release

**Releases:** `0.6.1` · **Needs:** flow 4 · **Log:** [`flow-5-fixes-release.log.md`](./flow-5-fixes-release.log.md)

Three small defects that flow 4 found while it ran, in the patch release `0.6.1` after `0.6.0`: the template repository does not ask for the flows' permissions, auto-merge can be turned on for a pull request with no changed files, and the branch update by the workflow leaves a pull request with no checks. The owner scheduled them on 2026-11-08 and named the version. The issues are built in one step, since each is 1 or 2 SP on C2; the consumer takes the version to prove it. The mode is the template's default until the owner sets another; the repositories and the permissions are those of flow 4.

## Settings

```json
{
  "mode": "brainstorm",
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
| 1 | tasks | home | I-40, I-41, I-42 | — | — | 4 | 1% | C2 | ⬜ |
| 2 | cut | home | `0.6.1` | 1 | — | 1 | 0.7% | C2 | ⬜ |
| 3 | consumer-take | consumer | `0.6.1` | 2 | — | 2 | 0.5% | C2 | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.
