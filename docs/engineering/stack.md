[← README](../../README.md)

# Stack

The tools of this repository and how its code is laid out. The adapters of the framework fill the roles of the method; this file says what this
repository adds to them. The reasons for the layout are in the [design](../design.md).

## 1. Tech stack and test tooling

- **Runtime.** Node.js 22 (`.nvmrc`), ES modules (`.mjs`), no dependency at run time. The only dependency is Prettier, for development.
- **Tests.** The built-in runner, `node --test` (`npm test`): every `*.test.mjs` file, next to the code it tests or in `tests/`. There is no coverage tool, so the coverage gate of the
  profile has no package to hold (`coveragePackages` is empty); the rule of the entry file — every feature ships with tests — is held by review and by the conformance
  suite.
- **Lint and format.** `npm run lint` is `prettier --check .`; `npm run format` writes. **Type check.** The code has no types; `npm run typecheck` checks that every module parses.
- **Documentation checks.** `npm run docs:check` is `harness check all`: the managed files, the profile, links, paths, the CORE scan, the plan and the changelog.

## 2. Architecture and layering

| Folder | What it holds | May import |
| ------ | ------------- | ---------- |
| `core/` | neutral documents: rules, method, plan and review methods, procedures, contracts, templates | nothing (documents) |
| `profile/` | the schema of the profile file, its description and the starting values | nothing |
| `tools/lib/` | the checks and engines, as pure functions with seams | `tools/lib/`, `adapters/` (through the loaders) |
| `tools/` | the `harness` command line, the Git hooks, the runtime hooks, the conformance suite | `tools/lib/` |
| `adapters/<axis>/<name>/` | a stack, an agent runtime or a host: a manifest, its logic modules, its templates | `tools/lib/lock.mjs` and the Node standard library |
| `tests/` | the tests of the suite, and recorded fixtures | anything |
| `examples/` | a filled profile, a product-knowledge skeleton and a plan (Phase 1) | nothing |

The core never depends on an adapter; the tools reach an adapter only through its manifest. A new axis would be a new contract first.

## 3. Conventions

- A module exports named functions; a function does one thing and takes its collaborators as parameters (the host's command line is `cli`, the file system root is `root`).
- An expected failure is a returned value (`{ problems, messages }`), an unexpected one an exception that names what to do.
- No magic strings: a name that two modules share is an exported constant. A user-facing message says what is wrong and what to do about it.

## 4. Test tooling

`node --test` with `node:assert/strict`. A test that needs Git builds a throwaway repository in a temporary folder and removes it. The conformance suite
(`tools/conformance/`) is run by `harness adapter test` and by `tests/conformance/conformance.test.mjs` on every preset and on broken copies. The recorded event samples are
in the claude-code adapter (`events/`) and in `tests/fixtures/events/`.

## 5. Definition of done: stack items

Beyond [method §4](../../core/method/method.md#4-definition-of-done): `npm run lint`, `npm run typecheck`, `npm test` and `npm run docs:check` pass; a behaviour change has a line in
`CHANGELOG.md` under Unreleased; a change to a distributed file that projects must react to says so there; an adapter change keeps `harness adapter test` green for the presets.

## 6. Agent runtime

The agent-runtime adapters of the profile: claude-code (Claude Code: CLAUDE.md that imports the entry file, hooks in .claude/settings.json, Read deny rules, skills in .claude/skills). The repository host: github (GitHub: workflows, pull requests with the gh command line; no rulesets on this repository's plan, see section 9 of the entry file).
