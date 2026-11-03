# harness-framework — rules for agents

This file is the entry point for **any agent or human contributor** working on this repository, and is loaded into every agent session. It
holds the rules every task needs (the non-negotiables and the Git rules) and a reading map; the rest is read on demand. Every value the rules
cite by its role (the branches, the coverage gate, the commands) is in the [project profile](./docs/profile.md).

## Reading map

| To … | Read first |
| ---- | ---------- |
| start or continue a phase, or end a session | [method §6](./core/method/method.md#6-session-protocol-resuming-and-pausing-a-phase), then the phase file and its work log ([plan index](./docs/development-plan/README.md)) |
| write or change code | the [stack file](./docs/engineering/stack.md) and [method §2–§3](./core/method/method.md#2-solid-checklist-apply-per-file) (SOLID, testing) |
| see which tool holds a rule | the [rule-to-check map](./docs/engineering/rule-checks.md) |
| finish a task | [method §4](./core/method/method.md#4-definition-of-done) (definition of done) |
| find a value or a command | the [project profile](./docs/profile.md) |
| understand why the framework is built as it is, or change a contract | the [design](./docs/design.md) (section 4 for the adapter contracts), then the contract in `core/contracts/` |
| add or change an adapter (a stack, an agent runtime, a host) | the [new-adapter guide](./core/contracts/new-adapter.md) and `node tools/harness.mjs adapter test <path>` |

**Procedures** (steps for recurring work, also available as skills of the agent runtime):

<!-- harness:begin procedures -->
| When | Follow the procedure |
| ---- | -------------------- |
| asked to review the quality of the code (not the diff of one change) | [`core/procedures/code-review.md`](./core/procedures/code-review.md) |
| a session ends or pauses, and when a task finishes, to leave the state of the work in the repository | [`core/procedures/end-session.md`](./core/procedures/end-session.md) |
| the last task of a phase is merged, to close the phase and report it | [`core/procedures/finish-phase.md`](./core/procedures/finish-phase.md) |
| asked to review the quality of the harness (the documents, rules, hooks and checks that steer agents) | [`core/procedures/harness-review.md`](./core/procedures/harness-review.md) |
| a project needs an adapter the framework has no preset for (a language and its tools, a coding agent, or a repository host) | [`core/procedures/new-adapter.md`](./core/procedures/new-adapter.md) |
| a branch is ready and a pull request has to be opened, or a claim pull request marked ready | [`core/procedures/open-pull-request.md`](./core/procedures/open-pull-request.md) |
| cutting a release or a hotfix | [`core/procedures/release.md`](./core/procedures/release.md) |
| starting or resuming a phase or a task of the development plan, before any other work on it | [`core/procedures/start-task.md`](./core/procedures/start-task.md) |
<!-- harness:end procedures -->

---

## 1. Mission & non-negotiables

<!-- harness:begin non-negotiables -->
The principles (SOLID, scalability, testability, maintainability, low coupling, Git Flow, tests for every feature) are in
[method §1](./core/method/method.md#1-principles). If a rule conflicts with existing legacy code, the rule wins for **new
and modified** code — refactor the touched area to comply rather than perpetuating the anti-pattern.

Non-negotiables (a PR that violates these is rejected). **Changing one needs the owner's explicit confirmation of that change**, recorded
in the pull request; a mention in passing ("the gate is annoying") is not a confirmation, so ask. <!-- rule:nn.change -->

1. Every feature ships with **unit + integration tests**, and user-visible flows get **e2e** tests. <!-- rule:nn.tests -->
2. Coverage must stay at or above the coverage gate ([profile](./docs/profile.md#2-quality-gates)); CI fails below it. <!-- rule:nn.coverage -->
3. No new untyped public boundaries (the stack's lint rule names them). No new magic string logic without a typed constant. <!-- rule:nn.typed -->
4. No dead code, no commented-out blocks, no debug printing left in committed code (use the logger). <!-- rule:nn.clean -->
5. No secrets in the repo; add values only to `.env.example`, never `.env`. <!-- rule:nn.secrets -->
<!-- harness:end non-negotiables -->

---

## 7. Git Flow

<!-- harness:begin git-rules -->
**Role binding.** This repository fills the roles of §1 and §7 as follows, and this line is the only place in these two sections that names the values: the integration branch is `develop`, the production branch is `main`, the issue queue is the [open issues](./docs/development-plan/issues/README.md), the repository host is GitHub; every other value is in the [profile](./docs/profile.md).

### 7.1 Branches

Branch names, types and the merge strategy are in the [profile](./docs/profile.md#3-branches-and-merging); how branches flow <!-- rule:git.branches -->
(one branch per task, finishing a release) is in [method §5](./core/method/method.md#5-git-workflow).
**`<id>` is the task number from the development plan**, as in `feature/<id>-<slug>`.
Work that is not in the plan first becomes a task or an issue: a defect or an improvement found in use becomes an **issue** of the issue queue (`I-<n>`, a bugfix branch `bugfix/I-<n>-<slug>`), which is not a phase.
Documentation or tooling work that no task covers uses a branch slug only (the docs and chore branch types).

### 7.2 Merge strategy

Squash merge into the integration branch; a merge commit for release and hotfix branches ([profile](./docs/profile.md#3-branches-and-merging)). <!-- rule:git.merge -->

### 7.3 Branch retention

- **Branches are never deleted from the repository host after merging; they are kept for history.** Turn off "automatically delete head <!-- rule:git.retention -->
  branches" in the repository settings, and never run `git push --delete` / `git push origin :branch` on a remote branch.
- Deleting a *local* branch is fine when it is already merged. <!-- rule:git.local-delete -->
- The production and the integration branch are protected: no direct pushes (for administrators <!-- rule:git.protection -->
  too), no force-push, no deletion, every change through a PR, and the **required checks** green. The required checks are listed with
  what each job runs in the [profile](./docs/profile.md#2-quality-gates); that list is the only statement of the merge gates.
  The host enforces this with the repository ruleset that `harness host protect` sets from the profile.
  An administrator may bypass the rules only when merging a PR, for example past a red check. That bypass is the owner's: an agent <!-- rule:git.admin-bypass -->
  never uses it unless the owner asks for that specific merge.

### 7.4 Commit & PR rules

- Commit messages: the commit format of the [profile](./docs/profile.md#3-branches-and-merging) (its type and optional scope, for <!-- rule:git.commit-format -->
  example `feat(<scope>): …`), with the plan task id in the body (the plan-reference line of the profile).
- One logical change per commit; PRs should be small and single-purpose. <!-- rule:git.small-prs -->
- No direct commits to the production or the integration branch; merge via PR with at least one review (while the project is solo, the owner's <!-- rule:git.no-direct-commit -->
  approval to merge counts as the review).
- The required checks (§7.3) must be green before merge. <!-- rule:git.green-checks -->

### 7.5 Rules for agents

- If the current branch is the production or the integration branch, **create the right branch first** (names per §7.1) before changing files. Start every new branch, worktree and session from the integration branch as it is on the remote (fetch first). <!-- rule:agent.branch-first -->
- Committing and pushing to a feature/bugfix/docs/chore branch is routine and **needs no confirmation**. Never commit or <!-- rule:agent.routine-push -->
  push directly to the production or the integration branch.
- **Plan work (approval given by the request):** when the user asks to start or continue one or more phases, to work the issue queue or to fix issues (the resume phrases <!-- rule:agent.plan-approval -->
  of the [profile](./docs/profile.md#4-plan), for example "Start Phase N", "Work the issue queue" or "Fix I-<n>"), that request is the approval for **every task PR of the named phases and every PR of the named issues**. Create each
  task's pull request into the integration branch and squash-merge it **without asking**, once the required checks pass (before CI
  exists: once lint, typecheck and tests pass locally). Do not pause between tasks, and when a named phase's exit criteria are
  met, record it and start the next named phase. Stop after the last named phase with a summary, and earlier only when
  blocked or when a decision is needed that only the user can make. The approval does not extend to phases that were not named.
- **Plan-related PRs merge the same way.** Every PR that belongs to a named phase or issue is covered by the same approval: its task <!-- rule:agent.plan-related -->
  PRs, and also the documentation and chore PRs that exist because of the plan (the phase's implementation log, task and
  status updates in the phase file and the development plan, the work log, the matching specification updates, and
  the fixes of tooling or tests that block a task). Merge them without asking once the required checks pass. A PR counts as
  plan-related only when it serves a named phase; anything else follows the next rule.
- **Claim a task before working on it.** Push its branch and open a **draft** pull request for it first (title and body as in the claim row of the <!-- rule:agent.claim -->
  [profile](./docs/profile.md#4-plan)); a task with an open pull request belongs to the session that opened it, and a session that
  resumes a phase continues it only as [method §6](./core/method/method.md#6-session-protocol-resuming-and-pausing-a-phase) says (the log names it, or the owner does; otherwise ask).
  With several agents the orchestrator or the owner merges, and the CI events and review comments of a pull request go to the session
  that owns it ([method §7](./core/method/method.md#7-several-agents)).
- **Opening a pull request is automatic.** Create the PR as soon as a branch is ready (any branch type, including <!-- rule:agent.open-pr -->
  release and hotfix branches into the production branch) without asking.
- **Ask the user before merging any other pull request:** documentation or chore PRs that are not related to the development plan of a named phase, anything <!-- rule:agent.ask-merge -->
  targeting the production branch, and release and hotfix branches. Approval for one merge does not carry over to another.
- Never delete a remote branch, never force-push to the production or the integration branch, never rewrite published history. <!-- rule:agent.no-rewrite -->
- **Auto-merge merges a task's pull request; nothing waits for you to come back.** As the last step of a task, once its definition of done holds, <!-- rule:agent.auto-merge -->
  enable the host's auto-merge (squash) on exactly the pull requests this section lets you merge without asking: the task and plan-related
  pull requests of the named phases, into the integration branch. Never on a pull request into the production branch, on a release or a
  hotfix branch, or on one that needs the owner's approval; the shell guard refuses it there. When the checks are already green the host
  merges at once, which is expected. After you push to a pull request, check that auto-merge is still on, and merge a green pull request
  that is still open yourself. The final message lists the pull requests that wait for the owner.
- **A task that needs the previous one** branches from its branch (one level, no deeper) while that pull request is open; after the squash
  merge, retarget the pull request to the integration branch and run `harness branch update`, which brings it in and resolves the conflicts that only
  the squash causes; push after the retarget, because a retarget alone starts no checks. <!-- rule:agent.stack -->
- **Automatic CI fixes are on for plan work.** After opening a PR for a named phase, attach it to the session and turn on the agent <!-- rule:agent.ci-fixes -->
  runtime's CI monitoring with automatic fixes (the tools are in [stack §6](./docs/engineering/stack.md#6-agent-runtime)) without
  asking; it wakes the session on CI failures, merge conflicts and review comments. Never wait by checking the pull request again and
  again; the runtime adapter says how a session waits (stack §6).
  When CI is green, the host merges the pull request (auto-merge); go on to the next task, so work flows across phases.
<!-- harness:end git-rules -->

---

## 9. Project-specific rules

This repository is `harness-framework` itself, its own project in lock mode `self` (design §11): the tools are in `tools/`, the core documents in `core/`,
the adapters in `adapters/`, and nothing is vendored. The projects that use the framework take a tagged version of this tree.

- **Core stays neutral.** `core/` names no stack, agent runtime, repository host or project: those words belong to an adapter's manifest (`terms`), and
  `harness check core` (part of `npm run docs:check`) returns 0. A core document cites a value by its role in the profile file, never by its content.
- **Distribution.** `framework.json` lists the paths a sync copies (`distributable`) and the adapters the framework ships. A change to a distributed file
  reaches projects with the next version; the changelog says what a project must do about it. A change of the meaning of a core rule, or of a contract
  (design §1.4), needs the owner's approval in the pull request; a major version too.
- **Tools.** Plain Node 22, no dependency at run time (Prettier is the only dependency of this repository, for development). A check is a pure function with
  a test next to it (`*.test.mjs`, `node --test`); a seam (the host's command line, the clock, the file system root) is a parameter, so a test replaces it.
- **Adapters.** Every adapter passes the conformance suite: `node tools/harness.mjs adapter test adapters/<axis>/<name>`; the framework's tests run it on
  the presets and on deliberately broken copies (`tests/conformance/`). A new adapter follows the [new-adapter guide](./core/contracts/new-adapter.md).
- **The old repository.** The framework was extracted from the repository `AndLD/bot-rts` (Phase 17 of its plan), which keeps consuming it as a pinned
  copy. A defect found there is fixed here, and `bot-rts` takes the fix with a sync.
- **Branch protection.** The repository is public (since 2026-11-03), so `host.protection` is `true` in the profile and the `protected-branches` ruleset,
  set by `harness host protect`, holds the branch rules on GitHub; the Git hooks and the agent runtime's hooks hold them locally too.
- **`docs/temp/` is the owner's.** It is ignored by Git and holds the owner's scratch notes. An agent writes there only when the owner asks, and never links
  it from a tracked document.
