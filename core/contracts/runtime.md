# Agent-runtime adapter contract

An **agent-runtime adapter** says how a coding agent loads the rules and procedures, and which of the rules it can block before the action happens. A project
selects zero or more in `adapters.runtimes`; a project with none is valid and gets the entry file, the procedures linked from its reading map, the Git hooks and CI,
which is the agent-neutral minimum. The machine form is the `manifest.json` of the adapter (`x-roles.runtime`); `harness check adapters` holds a manifest to it.

| Role | Kind | The adapter says |
| ---- | ---- | ---------------- |
| `entry-file` | required | how the runtime loads the entry file (a pointer file, or nothing when it reads the entry file itself) |
| `always-loaded-rules` | required | what is loaded in every session; the entry file only, so that no text is loaded twice |
| `on-demand-rules` | required | how a document is read when a task needs it; the reading map of the entry file |
| `hook-configuration` | optional (none: every rule that needs a hook falls back to the Git hooks and CI) | the file that registers the hooks, and their events |
| `hook-io` | optional (needed with hooks) | how the runtime's event is read and its answer written (block, message, session context); the form of each supported runtime is in the framework's `tools/runtime-hooks/io.mjs`, which a new runtime extends |
| `project-directory` | required | the environment variable that holds the project directory |
| `read-exclusions` | required | how the runtime keeps the agent from reading the paths of `access.denyRead`, and what that does not cover |
| `procedure-packaging` | required | where the neutral procedures of `core/procedures/` (and those of the project's own folder, `paths.procedures`, whose `source` names the file) are written for the runtime, and in what form |
| `pull-request-tools` | optional (none: the agent checks the required checks with the host's command before it merges, and the rule on CI monitoring with automatic fixes is "not applicable") | attaching a pull request and monitoring its CI, and how a session waits for a pull request without checking it again and again (the monitor that wakes it, or one background wait per pull request) |
| `waiting-advice` | optional | notes on waiting for long-running commands |
| `model-map` | optional | the default of `plan.complexity.models` |
| `executors` | logic (since contract 2) | `executorsFor(profile) → { session?, subagent?, manual? }`: how an orchestrator of a flow hands a step to a worker (the section below); a runtime without automation returns `{ manual }` only |
| `hook-adoption` | logic-optional (needed for `harness adopt` on a project that has the runtime's configuration already) | `adoptConfiguration({ root, profile }) → { files: [{ path, content }], notes }`: the runtime's configuration of the project with the framework's hook entries and read exclusions added, and a note for each hook command that is the project's own; it deletes nothing |
| `managed-blocks` | logic-optional | `managedBlocks(profile) → [{ path, block, content }]`: blocks of files of the project that the sync keeps up to date, between `# harness:begin <block>` and `# harness:end <block>` lines (an ignore file, where an HTML comment would be a pattern); the sync adds the block at the end of the file when it lacks it, and the project's own lines stay as they are |
| `scaffold-files` | logic-optional | `scaffoldFiles(profile) → [{ path, content }]`: the entry-file pointer and the hook configuration that the bootstrap writes once into a new project |

**Executors** (the role `executors`, contract 2). The orchestrator of a flow (the procedure `run-flow`) hands each step to a worker through an executor of the runtime:

| Executor | What the worker is | Wake-ups |
| -------- | ------------------ | -------- |
| `session` | a session of its own that the orchestrator starts and controls, and the owner can open and steer, with the hooks and the CI monitoring of a session; the default for task, cut and consumer steps | yes |
| `subagent` | a worker in the orchestrator's own process, for a short step of analysis; its full result comes back | no |
| `manual` | the owner pastes the prompt into a session of their own and pastes back the report: the fallback of a runtime without automation | no |

Each executor is `{ means, wakeups, cacheMinutes, start, continue, report, context, account? }`: `means` says in one line what the worker is, `wakeups` whether it gets the CI
wake-ups of a session, and `cacheMinutes` how long the runtime's prompt cache lives between two prompts of one worker (0 when nothing can be counted on). Each operation
returns a list of **means**, the first preferred, empty when the runtime cannot do it:

| Operation | Request | It does |
| --------- | ------- | ------- |
| `start` | `{ prompt, model, effort, cwd, name }` | starts a worker with a model and an effort in the step's repository |
| `continue` | `{ worker, prompt, model, effort, cwd }` | gives the worker that ran the previous step its next prompt |
| `report` | `{ worker }` | fetches the worker's full final report (the notice of its end may be cut short) |
| `context` | `{ worker }` | reads the worker's context in percent of its window; empty: never reused |
| `account` (optional) | none | reads the account the orchestrator runs on, which a worker it starts runs on; absent or empty: accounts are not compared |

A means is one of `{ via, tool, input, reads? }` (a tool of the runtime the orchestrator calls), `{ via, command, reads? }` (a command, as a list of words),
`{ via, from }` (read from an answer it already has) or `{ via, owner }` (what the owner does); `via` names where it applies, `reads` what to take from the answer.
`prompt` is a slot (`<prompt>`): the adapter puts it where the prompt goes, and the tools fill it with the command that prints the step's prompt. The model is the
text of `plan.complexity.models` without its effort (`Sonnet 5.5`), and the adapter maps it to the runtime's own name. The framework's own manual executor stands in for
every executor a runtime does not return, and for a project with no runtime adapter. `harness flow dispatch` picks the executor of a step, decides whether the
previous worker continues it (`reuse: auto`: the plan method, section 10; a worker of another account than the orchestrator's never), and prints the means; beside a
continue, it prints the fresh start to fall back on when the continue fails.

**Defaults for a new project.** The manifest's `defaults` are values of the profile file that the adapter gives a project it bootstraps: the bootstrap writes them where the answers leave a role empty, and an answer always wins. The scaffolded files are the adapter's `scaffold-files` role.

**Where a rule is caught.** Each adapter's manifest declares the rules it enforces and at which moment: *early* (the runtime, before the action), *local* (a Git hook)
or *remote* (CI or the host). The core part of the rule-to-check map is generated from those declarations, so a project with other adapters gets a true map. A rule
the runtime cannot block early falls to the Git hooks and CI, and a rule nothing can check is judgment, said so in the map.

The `terms` of the manifest are the runtime's own words (its tool names and folders), joined into the CORE scan.

A new adapter is written by [the new-adapter guide](./new-adapter.md), and passes the conformance suite (`harness adapter test`).
