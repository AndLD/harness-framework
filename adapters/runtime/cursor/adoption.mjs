// The Cursor preset's part of `harness adopt` (design §6.4, role "hook adoption"): a project that has `.cursor/hooks.json` of its own gets the framework's hook entries
// added to it in native mode, and the hook commands that are not the framework's are named, so that the project removes the ones whose job the framework now does.
// Nothing of the project's own is deleted. The `.cursorignore` block needs no step here: the sync adds it at the end of the project's file. In compat mode the file is
// left as it is (`harness check scaffold` names the framework's entries that would run twice).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inFramework } from '../../../tools/lib/lock.mjs'
import { HOOKS, HOOKS_PATH, HOOKS_VERSION, hookEntry } from './hooks.mjs'
import { isCompat } from './mode.mjs'

/**
 * The hook file of a project with the framework's entries added.
 * @returns {{ files: { path: string, content: string }[], notes: string[] }} no file when the project has none (the scaffold writes it) or runs in compat mode
 */
export function adoptConfiguration({ root, profile }) {
  const path = join(root, HOOKS_PATH)
  if (!existsSync(path) || isCompat(profile)) {
    return { files: [], notes: [] }
  }
  const configuration = JSON.parse(readFileSync(path, 'utf8'))
  configuration.version ??= HOOKS_VERSION
  const hooks = (configuration.hooks ??= {})
  for (const hook of HOOKS) {
    const entry = hookEntry(profile, hook)
    const present = (hooks[hook.event] ??= []).some((item) => item.command === entry.command)
    if (!present) {
      hooks[hook.event].push(entry)
    }
  }
  const own = inFramework(profile, 'tools/runtime-hooks/')
  const notes = Object.values(hooks)
    .flat()
    .map((item) => item.command)
    .filter((command) => typeof command === 'string' && !command.includes(own))
    .map(
      (command) =>
        `${HOOKS_PATH}: the hook \`${command}\` is the project's own; remove it if the framework's hook does its job.`
    )
  return { files: [{ path: HOOKS_PATH, content: `${JSON.stringify(configuration, null, 2)}\n` }], notes }
}
