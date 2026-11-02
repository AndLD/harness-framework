# Examples

Worked samples for a fictitious project, **Orbit Notes** (a shared notes service). The framework's own tests hold each one to the checks it exercises
(`tests/examples.test.mjs`), so a sample never drifts from what the tools accept. They are not distributed: a project reads them here, in the framework repository.

| Folder | What it is | Held to |
| ------ | ---------- | ------- |
| [`profile/`](./profile/harness-profile.json) | a filled `harness-profile.json`: the project, the adapters, the quality gates, the plan conventions with agent-complexity markers, the commands, the term lists, the bounded contexts, the document map and the product-knowledge settings | `harness check profile` |
| [`product/`](./product/README.md) | the product specification of the sample, written in the form the skeleton asks for: an index, one file per bounded context, a glossary, a register of open questions and a backlog | `harness check product-knowledge` |
| [`plan/`](./plan/README.md) | a plan index and one phase with two tasks (one done, one in progress), the work log of the phase and the log of each task | `harness plan summary --check` |

The **empty skeleton** of the product specification is not here: it is the `product-*.md` templates of `core/templates/scaffold/`, which the bootstrap writes into a
new project's `docs/product/` (they travel with the vendored framework, as the other scaffold files do). The files in `product/` show what a filled skeleton looks like.
