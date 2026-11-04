---
name: run-flow
description: Use when the owner asks to run or continue a flow of the plan ("Run flow N", "Run flows N–M", "Continue flow N"), to orchestrate its steps.
invocation: auto
---

# Run a flow

A flow is a file of the plan's flows folder (the profile, plan section): an ordered chain of steps that delivers one or more releases, with a settings block and an append-only log beside it (the plan method, section 10, and its flow and flow-log templates). You are its **orchestrator**: you hand each step to a worker, read what comes back, decide or ask, and log. You never build a step yourself, and you read reports and state checks, never diffs.

## Decision levels

| Level | What | Examples |
| ----- | ---- | -------- |
| D0 | mechanical | retry a flaky check, rerun the plan summary |
| D1 | local: a worker's choice inside its task | a name, a test layout, a development version cut (default) |
| D2 | plan-shaping | add, move or defer a task; insert or split a step; change a step's model; move a release between flows |
| D3 | contract or scope | a core rule, an adapter contract, what a release promises its consumers, a dropped feature, a final cut or a hotfix (default) |
| D4 | external communication | answering or closing a report on the host (default) |

The flow's `levels` setting may move a decision kind to another level. **Brainstorm** (the default mode) decides below `askAt` (D2 when the settings leave it out) and asks the owner from `askAt` up. **Seamless** decides every level and keeps a "review later" digest of its D2 to D4 decisions. In either mode:

- **Hard limits** that no mode and no setting crosses: an administrator's bypass of the host's rules, a cut on a red check, the non-negotiables of the entry file, a force-push or the deletion of a remote branch.
- **What the entry file keeps for the owner stays the owner's**, except where its rules give it to a flow at a level: a release or hotfix cut (the procedure `release`, "When a flow cuts") and an answer or a closing of a report (the procedure `triage-reports`), each by the flow's `levels`. Anything else they keep for the owner (a change of the meaning of a core rule or a non-negotiable, another merge into the production branch, creating a report on the host): stop and ask, whatever the mode.
- A step's "Stops for" column stops the flow at that step whatever the mode.

## Steps

1. **Claim.** Read the flow file, the tail of its log and the releases file. If the newest "running" entry names another session and no "stop" entry follows it, the flow is claimed: ask the owner (a session that ended without a stop entry is the owner's call). Otherwise append a "running" entry (your session, the mode, the steps you will run, the usage). One orchestrator per flow.
2. **Pick the step.** The first step that is not ✅ whose `Needs` are done. The State column is a cache: run `harness flow status <n>`, which recomputes each step from the repository (the ids of a `tasks` step are ✅ and their pull requests merged, a `cut` has its tag, a `consumer-take` has the version in the consumer's lock) and prints the mismatches with the column and the log, a step an orchestrator left open included and the next step. Trust its answer over the column, and correct the column when it is wrong. `harness flow check` holds the shape of the flow and of its log.
3. **Check usage.** Read the usage of the account's windows (the agent runtime's adapter says how; without it, ask the owner). If the current use and the step's estimate pass a `usage.stopAt` threshold, stop with a digest and say when the window resets.
4. **Hand the step to a worker** by its executor (the flow's `executor`, or the step's own): `session`, a session of its own started in the step's repository; `subagent`, only for a short step of analysis; `manual`, the owner pastes the prompt and pastes back the report. A setting the flow leaves out takes its default (the flow template): session, `reuse: auto`, `commits: per-step`, `usage.stopAt` 85% of the 5-hour and 90% of the weekly window. With `reuse: auto` the next step may continue the previous worker only when it is in the same repository with the same model and effort, the steps are related, its context is small, no pause has let the prompt cache expire, and it has run at most three steps; otherwise start a new one. The prompt is `harness flow prompt <n> <step>` (`harness flow next <n>` prints the next step with it): the standard wording of the template, filled for the step's kind and scope, or the text of a `custom` step; it states the Git rules that apply, where to stop, and that the worker ends with a **step report** whose recommendations come last (step 5). Log "step started".
5. **Read the step report**: status (done, partial, blocked); the pull requests merged and the ids done; the open decisions, each with its options and the level it suggests; deviations; reports filed; the next step; and last, under a heading of their own, the worker's **recommendations**, each with why. Read the report up to that heading only, until step 6 says otherwise. Log "step ended" with the usage after it. Before a cut, the migration note of the version is the one document you read in full.
6. **Decide each open decision, unbiased.** Before you read the worker's recommendations, write in the log the question, the options and your own pick from the plan and the design (when you have seen them already, say so in the entry). Then read them; if the picks differ, your entry answers the worker's argument. Take the level from the flow's `levels`, else the table above; the worker's suggested level is advice. Below the threshold, choose and log it; at or above it, ask the owner with the options, both picks and your recommendation, set the step to ⏸ and stop.
7. **Escalate**, in any mode, and stop: a blocker the worker could not solve; CI still red after the automatic fixes; a step over twice its estimate; work outside the step's scope. A failed or partial step is continued once in its session, then it becomes a decision.
8. **Record the step** in the flow file (its State) and the log by one pull request per step (`commits: per-step`), plan-related, merged as a task's; with `commits: per-cut`, one draft pull request per flow, merged at each cut. A step inserted midway takes a suffix id (`6c`) and is a D2 decision; a change of what a release holds changes the releases file in the same commit.
9. **Next step**, from step 2. Keep only the flow file, the tail of the log and the current report in mind: when your context grows, write the log and restart from step 1 in a new session; always restart between two flows. After the last step of the last named flow, stop.

## Stops

At every stop and at the end of a flow, give the owner a digest (done; decided alone, with the D2 to D4 decisions linked; usage; the exact next step), append it to the log as a "stop" entry, and notify the owner when the flow waits for them.
