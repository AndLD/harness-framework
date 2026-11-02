# Event samples of the Cursor preset

**Written from Cursor's documentation (design §9), not recorded in a live Cursor session.** The owner has no Cursor access yet (decision of 2026-11-02), so the preset ships
unverified; see the checklist in the [adapter's README](../README.md#checklist-for-a-live-session). The conformance suite replays these files through the framework's hooks.

| File | The event | Mode |
| ---- | --------- | ---- |
| `session-start.json` | `sessionStart` | native |
| `before-shell-push-main.json` | `beforeShellExecution` with `git push origin main` | native |
| `before-shell-ls.json` | `beforeShellExecution` with `ls -la` | native |
| `pre-tool-write-env.json` | `preToolUse` for `Write` of an environment file | native |
| `pre-tool-write-source.json` | `preToolUse` for `Write` of a source file | native |
| `after-file-edit.json` | `afterFileEdit` | native |
| `compat-bash-push-main.json` | the Claude Code form (`PreToolUse` for `Bash`) with Cursor's `cursor_version`, which Cursor sends when it runs the hooks of `.claude/settings.json` | compat |

The field names of `tool_input` for `Write` (`file_path`, `contents`) are the first item of the checklist. When a live session has recorded the real events, replace these files
with them and drop this notice.
