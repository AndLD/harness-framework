# Cursor preset

> **Unverified in a live session.** The preset is written from Cursor's documentation (checked on 2026-10-21; the ignore-files page on 2026-10-30) and passes the conformance suite, which replays event
> samples written from that documentation (see [`events/`](./events/README.md)). It has not run in a real Cursor session: the owner has no Cursor access yet (decision of 2026-11-02), so `0.1.0`
> ships it as it is. Whoever runs the [checklist](#checklist-for-a-live-session) reports the result; a fix ships as `0.1.1`.

The runtime adapter for [Cursor](https://cursor.com). It fills the [runtime contract](../../../core/contracts/runtime.md) in one of two modes, chosen by the profile (`adapters.runtimes`).

| | Native (`cursor` is the only runtime) | Compat (`claude-code` is selected too) |
| - | ------------------------------------- | -------------------------------------- |
| Entry file | none: Cursor reads `AGENTS.md` itself, nested files too | the same; `CLAUDE.md` of the Claude Code preset is read by the Cursor CLI as well |
| Hooks | `.cursor/hooks.json` (`version: 1`): `sessionStart`, `beforeShellExecution`, `preToolUse` on `Write`, `afterFileEdit` | none: Cursor loads the hooks of `.claude/settings.json` and runs them once |
| Skills | `.cursor/skills/<name>/SKILL.md` | none: Cursor loads `.claude/skills/` |
| Read exclusions | the `deny-read` block of `.cursorignore` | the same |
| Project directory | `CURSOR_PROJECT_DIR` (the alias `CLAUDE_PROJECT_DIR` also works) | the same |

Why two modes: Cursor loads Claude Code's `.claude/` hooks and skills by default (the setting "Include Third-Party Plugins, Skills, and Other Configs" is on), and its CLI has no opt-out. A project
with both runtimes would run every hook and list every skill twice, so the Cursor preset steps aside there. `harness check scaffold` fails on a framework hook in `.cursor/hooks.json` in compat mode.

## What it writes

| File | Written by | Kept up to date by |
| ---- | ---------- | ------------------ |
| `.cursor/hooks.json` (native) | the bootstrap, once (`scaffold-files`) | `harness check scaffold` holds the entries; `harness adopt` adds them to a project's own file |
| `.cursor/skills/<name>/SKILL.md` (native) | `harness sync` (`procedure-packaging`) | `harness check generated` |
| the `deny-read` block of `.cursorignore` | `harness sync` (`managed-blocks`), at the end of the project's file when the block is missing | `harness check generated`; the project's own lines are never touched |

No `.cursor/rules` file is written: an always-applied `.mdc` would load the rules a second time, and the reading map of the entry file does the on-demand part. No commands are written either:
Cursor's documentation no longer describes `.cursor/commands`; an explicit procedure is a skill with `disable-model-invocation: true`, invoked as `/<name>`. The entry file must be `AGENTS.md`
(`harness check scaffold` says so otherwise), because nothing else points Cursor at it.

## What it holds

| Rule | Native mode | Compat mode |
| ---- | ----------- | ----------- |
| No commit, push or deletion of a protected branch | `guard-shell` on `beforeShellExecution` | the Claude Code hooks, run by Cursor |
| Never edit an environment file | `guard-edit` on `preToolUse` (`Write`) | the Claude Code hooks, run by Cursor |
| Formatting after an edit | `format-edited` on `afterFileEdit` | the Claude Code hooks, run by Cursor |
| Session context (branch, phase in progress, next step) | `session-start` on `sessionStart`, as `additional_context` (not in Cursor's cloud agents) | the Claude Code hook, run by Cursor |
| Never read secrets (`access.denyRead`) | the `.cursorignore` block: the agent is blocked, its terminal and MCP tools are not | the same |

The guards answer in JSON (`permission: "deny"` with `agent_message`) and exit with code 2, which Cursor treats as a block. They do not set `failClosed`: a hook that crashes lets the call proceed, and the
Git hooks and CI still hold the rules, as in the Claude Code preset. No model map is given (Cursor offers many vendors' models, so the project sets `plan.complexity.models`), and there are no pull-request
tools: the agent checks the required checks with the host's command before it merges.

## Terms

`terms` in the manifest joins the CORE scan: `cursor`, `.cursor/`, `.cursorignore`, `.mdc`, `cursor_version`, `cursor_project_dir`, `beforeShellExecution`, `afterFileEdit`.

## Checklist for a live session

For the owner, in a project bootstrapped with `harness init --stack node-ts --runtime cursor` (native), and again in one with `--runtime claude-code,cursor` (compat). Report each line as it is, and a
mismatch as a bug of the preset (a fix ships as `0.1.1`; if the real events differ from [`events/`](./events/README.md), replace the samples with the recorded ones).

Native mode:
- [ ] The field names of `tool_input` for `Write` are `file_path` and `contents`, as the samples say. (If they differ, `guard-edit` does not see the path and lets the edit through.)
- [ ] `git push origin main` in the agent's terminal is refused, and the agent sees the reason. Note whether the reason comes from `agent_message` or from standard error on exit code 2.
- [ ] A write of `.env` is refused by the `preToolUse` hook on `Write`.
- [ ] `$CURSOR_PROJECT_DIR` is expanded in the `command` of `.cursor/hooks.json`, and the hook finds `harness/tools/runtime-hooks/`. (If Cursor runs a project hook from another directory, the path needs a change.)
- [ ] A `sessionStart` context (branch, phase in progress, next step) appears in the IDE.
- [ ] After the agent edits a source file, `afterFileEdit` runs the formatter (the file is formatted).
- [ ] The skills of `.cursor/skills/` are listed, an explicit procedure is invoked as `/<name>` and is not chosen on its own, and a skill with `paths` in its frontmatter takes them in the form the preset writes (`paths: a, b`).
- [ ] A file matching the `.cursorignore` block (`.env`) cannot be read by the agent.

Compat mode:
- [ ] Cursor runs each hook of `.claude/settings.json` once (not twice), and the guards refuse in the same cases as in native mode.
- [ ] Cursor does not load the rules twice, natively from `AGENTS.md` and again through `CLAUDE.md`.
- [ ] The skills of `.claude/skills/` are listed once.
- [ ] The `.cursorignore` block works as in native mode.

Where a line fails, the sources are in the [design, section 9](../../../docs/design.md#9-cursor-rules-hooks-and-commands-checked-2026-10-21).
