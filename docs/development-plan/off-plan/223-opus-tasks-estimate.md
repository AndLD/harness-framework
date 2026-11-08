# The Opus tasks estimate on Claude Pro, from the steps of flow 3

**What changed:** the `tasks` row of Opus on Claude Pro is 4% of the 5-hour and 0.6% of the weekly window a SP (it was the default row, 20% and 2.7%); the default row and the larger
subscriptions are unchanged (`adapters/runtime/claude-code/usage.mjs`, with the tests that used an Opus step as a large one).

**Why and who asked:** the owner asked the orchestrator of flow 3 to choose the estimate, on 2026-11-08, from `harness flow calibrate --subscription pro`. This record was added after the
merge, by task 2.1, because the pull request merged without one and the check `off-plan` then refused every push.

**What it leaves to do:** nothing.
