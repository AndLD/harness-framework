[← Flows](./README.md)

# Flow 1 — Release 0.3.0 and its first consumer

**Releases:** `0.3.0-dev.1`, `0.3.0` · **Needs:** — · **Log:** [`flow-1-release-0-3-0.log.md`](./flow-1-release-0-3-0.log.md)

What remains of `0.3.0` once Phase 5 is merged: a development version first (`0.3.0-dev.1`, added on 2026-11-05 at the owner's decision, with the consumer taking it), its final cut, the first consumer taking it (an external step in AndLD/bot-rts), and the close of Phase 5, whose exit criteria include the tag. It replaces
the owner's local list of prompts from `0.3.0` on. Written in task 5.9, with the default settings: brainstorm mode, so the final cut (level D3) asks the owner before it merges. The estimates are the provisional
Claude Pro coefficients of the runtime adapter (`harness flow estimate 1`).

## Settings

```json
{
  "mode": "brainstorm",
  "askAt": "D2",
  "permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)", "Bash(gh *)", "Bash(npm *)", "Bash(node *)"] },
  "repos": {
    "consumer": { "remote": "AndLD/bot-rts", "role": "consumer", "kinds": ["consumer-take"] }
  }
}
```

`permissions` is what a worker started on the command line may do (issue I-11): edits, and the commands of Git, the host's command line and the project's checks; the owner's choice of 2026-11-05. The folder of `consumer` on this machine is `repos.consumer` of the ignored `harness-profile.local.json`, never of this file.

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | cut | home | `0.3.0-dev.1` | — | — | 1 | 0.6% | C2 | ⬜ |
| 1a | consumer-take | consumer | `0.3.0-dev.1` | 1 | — | 2 | 1.6% | C2 | ⬜ |
| 1b | cut | home | `0.3.0` | 1a | owner review (D3) | 1 | 0.6% | C2 | ⬜ |
| 2 | consumer-take | consumer | `0.3.0` | 1b | — | 2 | 1.6% | C2 | ⬜ |
| 3 | custom | home | close Phase 5 and the `0.3.0` row | 2 | — | 1 | 1.6% | C2 | ⬜ |

State: ⬜ not started · 🟡 running · ⏸ waits for the owner · ⛔ blocked · ✅ done. The State column is a cache of the repository's state; the log is the record.

## Step 3

Close Phase 5 now that `0.3.0` is tagged and its first consumer has taken it. Follow the procedure `finish-phase`: check the exit criteria of the phase index one by one (this flow's
first step supplied the tag and the migration note, step 2 the consumer's run), set the phase status, regenerate the plan summary, and record the result in the phase's work log. Set
the `0.3.0` row of the releases file to ✅ and the current release line to the next row, in the same pull request. Report any exit criterion that does not hold as a decision for
the owner, not as a footnote. Do not start another phase.
