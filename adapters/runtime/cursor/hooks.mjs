// The Cursor preset's hook configuration (design §4.2 and §9): `.cursor/hooks.json`, whose entries call the vendored runtime hooks. Native mode only: in compat
// mode Cursor runs the hooks of `.claude/settings.json`, and a second file would run each hook twice. The bootstrap writes the file once; `harness check
// scaffold` then holds the invariants: every hook entry is present, and compat mode has none of the framework's.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inFramework } from '../../../tools/lib/lock.mjs'
import { isCompat } from './mode.mjs'

export const HOOKS_PATH = '.cursor/hooks.json'
export const HOOKS_VERSION = 1
// Cursor reads this entry file itself and the preset writes no rule file that would point at another (design §9)
export const ENTRY_FILE = 'AGENTS.md'

// The framework's hook entries: the event, the tool matcher, and the script
export const HOOKS = Object.freeze([
  { event: 'sessionStart', script: 'session-start' },
  { event: 'beforeShellExecution', script: 'guard-shell' },
  { event: 'preToolUse', matcher: 'Write', script: 'guard-edit' },
  { event: 'afterFileEdit', script: 'format-edited' }
])

export const hookCommand = (profile, script) =>
  `node "$CURSOR_PROJECT_DIR/${inFramework(profile, `tools/runtime-hooks/${script}.mjs`)}"`

/** The entry of one hook in the form of `hooks.json`. */
export const hookEntry = (profile, { matcher, script }) => ({
  command: hookCommand(profile, script),
  ...(matcher ? { matcher } : {})
})

/** The content of `.cursor/hooks.json` for a profile; null in compat mode, which has none. */
export function hooksFor(profile) {
  if (isCompat(profile)) {
    return null
  }
  const hooks = {}
  for (const hook of HOOKS) {
    ;(hooks[hook.event] ??= []).push(hookEntry(profile, hook))
  }
  return { version: HOOKS_VERSION, hooks }
}

const entriesOf = (configuration, event) => configuration.hooks?.[event] ?? []

/** The problems of the Cursor configuration of a project (design §6.3, the scaffold invariants). */
export function scaffoldProblems({ root, profile }) {
  const problems = []
  const entry = profile.paths?.entryFile
  if (entry && entry !== ENTRY_FILE) {
    problems.push(
      `paths.entryFile is ${entry}: Cursor reads ${ENTRY_FILE} itself and the preset writes no rule file, so the entry file must be ${ENTRY_FILE}`
    )
  }
  const path = join(root, HOOKS_PATH)
  const compat = isCompat(profile)
  if (!existsSync(path)) {
    return compat
      ? problems
      : [`${HOOKS_PATH}: missing; the cursor runtime expects it (the bootstrap writes it)`, ...problems]
  }
  let configuration
  try {
    configuration = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    return [...problems, `${HOOKS_PATH}: not valid JSON (${error.message})`]
  }
  for (const hook of HOOKS) {
    const present = entriesOf(configuration, hook.event).some(
      (item) => item.command === hookCommand(profile, hook.script)
    )
    if (compat && present) {
      problems.push(
        `${HOOKS_PATH}: the ${hook.event} hook runs ${hook.script}, which Cursor also runs from .claude/settings.json (compat mode); remove the entry`
      )
    } else if (!compat && !present) {
      problems.push(
        `${HOOKS_PATH}: the ${hook.event} hook${hook.matcher ? ` for ${hook.matcher}` : ''} must run ${inFramework(profile, `tools/runtime-hooks/${hook.script}.mjs`)}`
      )
    }
  }
  if (!compat && configuration.version !== HOOKS_VERSION) {
    problems.push(`${HOOKS_PATH}: "version" must be ${HOOKS_VERSION}`)
  }
  return problems
}
