[← Harness review method](../../../core/reviews/harness/README.md)

# Harness review bindings

The values of the [harness review method](../../../core/reviews/harness/README.md) for harness-framework: its layers, measurements, bounded
contexts, budgets and cold-start probes (section 4 of the method). The first harness review writes them; until then this file holds what the
tools already know.

- **Values:** the [project profile](../../profile.md), with the term lists of the CORE scan (its section 9).
- **Checks:** `npm run docs:check` runs every check of the framework.
- **Reports:** one dated file per review next to this one, from the report template of the method.

## Layers

<!-- harness:begin layers -->
| Layer | Files and sections |
| ----- | ------------------ |
| **CORE** | `AGENTS.md` (the managed blocks non-negotiables, git-rules), `harness/**` (the vendored copy) |
| **DOMAIN** | – |
| **ADAPTER** | `docs/engineering/**`, `docs/operations/**`, `docs/procedures/**`, `.github/**`, `.claude/**`, `scripts/**` |
| **PROFILE** | `harness-profile.json`, `harness.lock.json`, `docs/profile.md`, `**/bindings.md` |
| **STATE** | `docs/development-plan/**`, `docs/design.md`, `docs/quality-reviews/harness/20*.md`, `docs/quality-reviews/security/20*.md`, `CHANGELOG.md`, `changelog.d/**` |
| **ENTRY** | `AGENTS.md`, `CLAUDE.md`, `README.md` |

Not in the map: nothing.
The map covers the tracked files that match `AGENTS.md`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `changelog.d/**`, `docs/**`, `.github/**`, `.claude/**`, `scripts/**`, `harness-profile.json`, `harness.lock.json`.
<!-- harness:end layers -->

## Cold-start probes

The probes of this repository, each naming the areas it exercises (the areas of the [migration notes](../../../migrations/README.md#areas); `harness check probes` holds the names), so that a version taken
by a project that uses the same probes reruns the ones it touches (`harness probes <from> <to>`). The first harness review writes the words each read.

| Probe | Scenario                                         | Areas                                                            | Words read at the last review |
| ----- | ------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------- |
| P1    | Start the next task of the plan                  | entry rules, Git rules, plan format, procedures                  | —                             |
| P2    | Resume a phase or a task that a session left     | plan format, procedures, engineering method                      | —                             |
| P3    | Open the pull request for a finished branch      | Git rules, procedures, host adapters                             | —                             |
| P4    | Take the newest version of the framework         | bootstrap and sync, profile file, templates and scaffold, checks | —                             |
| P5    | Add a phase to the plan                          | plan format, procedures, templates and scaffold                  | —                             |
| P6    | Put a defect found in use into the plan          | plan format, procedures                                          | —                             |

Run a probe as a separate session started in this repository (method, step 5): a subagent of the reviewing session inherits that session's entry file and gets no session-start hook. P5 and P6 extend a document; the starting probes of the framework (`core/reviews/harness/starting-probes.md`) say what to record.

## Budgets

The ceilings of the numbers the method budgets (section 3). Task 4.5 of the plan measured the baseline on 2026-11-04 and set the ceilings with room for the procedures Phase 4 and the next releases add; the first harness review confirms or changes them.

| Number | Baseline | Ceiling |
| ------ | -------- | ------- |
| Rows of the `procedures` block of `AGENTS.md` (M6, M20) | 12 | 16 |
| Words of the `procedures` block of `AGENTS.md` (M6) | 277 | 400 |
| Words in the always-loaded set (M6) | 2,729 | — |
| Normative words in the always-loaded set (M20) | 33 | — |
| Exception words in the always-loaded set (M20) | 5 | — |
| Highest fan-out of one document (M21) | 25 | — |
| Unreachable Markdown files (M7) | 82 | — |
| References that break the dependency rule (M3) | 19 | — |

`harness review measure` prints these numbers (method, section 4, step 3). The baselines above are its output at the commit of task 2.3 (2026-11-07); a ceiling stays open until the first harness review proposes it and the owner approves it.
