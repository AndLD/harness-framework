[← README](../README.md) · rules: [`AGENTS.md`](../AGENTS.md)

# Project profile

Every injectable value of this project's harness, named by its **role**. Rules elsewhere cite the role ("the coverage gate",
"the integration branch") and link here; they do not repeat the value.

**This document is generated** from [`harness-profile.json`](../harness-profile.json) and the template `profile/roles.md` of the
framework. To change a value, change it in the file and run `npm run harness -- sync --local`; never edit this document by hand.
`npm run docs:check` fails when the file, this document and `harness.lock.json` disagree. The hooks and scripts read the file through
`harness profile get <role>`. A role that has no value in the file is left out of this document.

The method documents keep their own `bindings.md` (plan, phases, code review, harness review). A binding that needs a value
below links to its row instead of copying it.

---

## 1. Project

| Role | Value |
| ---- | ----- |
| Project name | `harness-framework` (harness-framework) |
| Repository | `AndLD/harness-framework` on GitHub |

## 2. Quality gates

| Role | Value | Mechanism |
| ---- | ----- | --------- |

## 3. Branches and merging

| Role | Value |
| ---- | ----- |
| Protected branches | the production and the integration branch |

Branch types:

| Type | Name | Purpose | Branched from | Merges into | Merge strategy |
| ---- | ---- | ------- | ------------- | ----------- | -------------- |
| feature | `feature/<id>-<slug>` | new work | integration | integration | squash merge |
| bugfix | `bugfix/<id>-<slug>` | non-release fixes | integration | integration | squash merge |
| docs | `docs/<slug>` | documentation-only changes | integration | integration | squash merge |
| chore | `chore/<slug>` | tooling, CI, dependencies, config | integration | integration | squash merge |
| release | `release/<x.y.z>` | release stabilization (fixes only) | integration | production **and** integration | merge commit |
| hotfix | `hotfix/<x.y.z>` | urgent production fix | production | production **and** integration | merge commit |

`<id>` is a plan task id (section 4); a docs or chore branch that implements a plan task may carry it too
(`docs/15.1-project-profile`). A squash merge produces one Conventional Commit per pull request; a merge commit keeps release history traceable.

| Role | Value |
| ---- | ----- |
| Commit format | [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, optional scope in parentheses, `!` and a `BREAKING CHANGE:` footer for breaking changes |
| Plan reference in a commit | a `Plan: <task id>` line in the body |
| Pull-request title | the squash commit's message, checked by the CI job `pr-title` |

## 4. Plan

| Role | Value |
| ---- | ----- |
| Plan index | [`development-plan/README.md`](./development-plan/README.md) |
| Milestone | a phase, a folder `docs/development-plan/phases/phase-<n>-<slug>/` (its index `README.md`, a file `<id>.md` per task); a phase of the older layout is one file `docs/development-plan/phases/phase-<n>-<slug>.md` |
| Task id | `<phase>.<number>`, with an optional letter suffix (`2.1`, `2.1a`) |
| Session log | `docs/development-plan/phases/phase-<n>-<slug>/log.md`, one per phase, append-only: the phase-wide entries (decisions before the start, pauses); a phase of the older layout keeps `docs/development-plan/phases/work-logs/phase-<n>-log.md` |
| Phases with per-task records | every phase: each task writes its own log `<task id>.log.md` beside its task file in the phase folder (template: `core/plan/task-log-template.md`); a phase of the older layout keeps its fragments in `work-logs/phase-<n>/` |
| Plan-log command | `node tools/harness.mjs plan log <n>` |
| Implementation log | printed from the merged pull requests by the plan-log command (the `Plan: <task id>` lines of the squash commits); the phases with one log keep the table written in the phase file |
| Task claim | a draft pull request titled `chore(plan): claim task <task id>` with `Plan: <task id>` in the body, opened before any other work on the task |
| Status symbols | ⬜ not started · 🟡 in progress · ✅ done |
| Estimation scale | story points (SP), Fibonacci; 1 SP is about half a developer-day or one focused agent session; estimates include the tests the definition of done requires |
| Resume phrases | "Start Phase N", "Continue Phase N", "Work the issue queue", "Fix I-<n>"; the phrase approves the pull requests of the named phases and issues |
| Issue queue | [`development-plan/issues`](./development-plan/issues): the defects and improvements found in use, not a phase; a file `I-<n>.md` per issue with its log beside it, branch `bugfix/I-<n>-<slug>`, the open ones in the folder's `README.md`, the finished ones in `archived/` |
| Agent complexity | every open task carries a marker in the `Agent` column of its phase file: `C1` routine: mechanical, fully specified, obvious to verify; `C2` standard engineering: a component to a clear specification with tests, tools to work out; `C3` judgment: research, correctness-critical design, synthesis |
| Agent models | `C1` Sonnet 5.5 at medium effort; `C2` Sonnet 5.5 at high effort; `C3` Opus 5.5 at high effort |

## 7. Runtime versions

| Role | Value |
| ---- | ----- |
| Runtime | Node.js 22 LTS |

## 8. Commands

Run from the repository root unless a package is named.

| Role | Command |
| ---- | ------- |
| Lint (ESLint of every package and the Prettier check) | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests with the coverage gate | `npm run test:coverage` |
| Every check of the framework (`harness check all`): the vendored copy, the profile file, the layer map, links, backticked paths, the CORE scan, the plan summary, the changelog fragments and the product knowledge | `npm run docs:check` |
| Take the framework again from its source into `harness/`; regenerate the managed files only; show a local change of `harness/` | `npm run harness -- sync`; `npm run harness -- sync --local`; `npm run harness -- diff` |

A release is refused without the migration note of its version in `migrations/`.

## 9. Review values

The harness review's term lists (M1, M2 of its method) and the bounded contexts of the product knowledge.

Stack terms (case-insensitive), which must not appear in CORE or DOMAIN text:

```bash
STACK='\bjest\b|\bnpm\b|\btypescript\b|\beslint\b|\bprettier\b|istanbul|node_modules|package\.json|\b(?:postgres(?:ql)?|mysql|mariadb|sqlite|mongodb|redis|memcached|dynamodb|cassandra|elasticsearch|rabbitmq|kafka)\b|\b(?:prisma|typeorm|sequelize|sqlalchemy|drizzle|hibernate|knex)\b|\b(?:nestjs|nextjs|next\.js|reactjs|react\.js|react native|vue|angular|svelte|django|flask|fastapi|spring boot)\b|\b(?:cypress|playwright|selenium|puppeteer|vitest|mocha|jasmine)\b|\b(?:docker|kubernetes|k8s|terraform|vercel|netlify|heroku|aws|azure|gcp|cloudflare)\b|\b(?:gitlab|bitbucket|gitea|jenkins|circleci|copilot|windsurf|aider|codex)\b'
```

Product terms, which must not appear in CORE sections (the CORE scan skips the generic words below):

```bash
PRODUCT='(?!)'
```

Generic words of the product list, judged in context and not scanned in CORE text:

```bash
PRODUCT_GENERIC='(?!)'
```

Project values, which must not appear in CORE text except on the **Role binding** line of `AGENTS.md` (the CORE scan of
`npm run docs:check` reads this list from the profile file; the CORE files are listed in the [harness bindings](./quality-reviews/harness/bindings.md)):

```bash
PROJECT_VALUES='`main`|`develop`|AndLD/harness-framework'
```

A hit of the CORE scan in the vendored framework core that the project reported upstream and waits for the fix of is recorded in `terms.exceptions` of the profile file (the file, the word, the link to the report and the framework version it holds for); `npm run docs:check` accepts it while the lock is at that version and fails on the exception after a sync to another one.

## 10. Document map

| Role | Document |
| ---- | -------- |
| Agent rules (always loaded) | [`AGENTS.md`](../AGENTS.md) |
| Engineering method (read on demand) | [`core/method/method.md`](../core/method/method.md) |
| Stack, layering, conventions (read on demand) | [`engineering/stack.md`](./engineering/stack.md) |
| Rule-to-check map (read on demand) | [`engineering/rule-checks.md`](./engineering/rule-checks.md) |
| Project profile | this file |
| Project overview, setup, environment variables | [`README.md`](../README.md) |
| Changelog | [`CHANGELOG.md`](../CHANGELOG.md) |
| Changelog fragments (entries of unreleased changes, collected by the release script) | [`core/templates/changelog-fragments.md`](../core/templates/changelog-fragments.md) |
| Plan index | [`development-plan/README.md`](./development-plan/README.md) |
| Plan method | [`core/plan/README.md`](../core/plan/README.md) |
| Releases | [`operations/releasing.md`](./operations/releasing.md) |
| Code quality reviews | [`core/reviews/code/README.md`](../core/reviews/code/README.md) |
| Harness quality reviews | [`core/reviews/harness/README.md`](../core/reviews/harness/README.md) |
| Harness review bindings | [`quality-reviews/harness/bindings.md`](./quality-reviews/harness/bindings.md) |
