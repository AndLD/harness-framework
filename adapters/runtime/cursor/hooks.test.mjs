import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { HOOKS, hooksFor, scaffoldProblems } from './hooks.mjs'

const native = { adapters: { runtimes: ['cursor'] } }
const compat = { adapters: { runtimes: ['claude-code', 'cursor'] } }
const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

function project(configuration) {
  const root = mkdtempSync(join(tmpdir(), 'cursor-hooks-'))
  dirs.push(root)
  mkdirSync(join(root, '.cursor'))
  if (configuration !== undefined) {
    writeFileSync(
      join(root, '.cursor', 'hooks.json'),
      typeof configuration === 'string' ? configuration : JSON.stringify(configuration)
    )
  }
  return root
}

test('native mode calls the vendored hooks for the four events of the preset, the edit guard for Write only', () => {
  const configuration = hooksFor(native)
  assert.equal(configuration.version, 1)
  assert.deepEqual(Object.keys(configuration.hooks), [
    'sessionStart',
    'beforeShellExecution',
    'preToolUse',
    'afterFileEdit'
  ])
  assert.deepEqual(configuration.hooks.beforeShellExecution, [
    { command: 'node "$CURSOR_PROJECT_DIR/harness/tools/runtime-hooks/guard-shell.mjs"' }
  ])
  assert.deepEqual(configuration.hooks.preToolUse, [
    { command: 'node "$CURSOR_PROJECT_DIR/harness/tools/runtime-hooks/guard-edit.mjs"', matcher: 'Write' }
  ])
  assert.equal(HOOKS.length, 4)
  assert.match(
    hooksFor({ ...native, paths: { frameworkDir: '.' } }).hooks.sessionStart[0].command,
    /\$CURSOR_PROJECT_DIR\/tools\//
  )
})

test('compat mode has no hook file, because Cursor runs the hooks of .claude/settings.json', () => {
  assert.equal(hooksFor(compat), null)
  assert.equal(hooksFor({ adapters: { runtimes: [{ adapter: 'claude-code' }, 'cursor'] } }), null)
})

test('a file written from the profile passes the scaffold check, in native mode', () => {
  assert.deepEqual(scaffoldProblems({ root: project(hooksFor(native)), profile: native }), [])
})

test('a missing entry, a hook of another matcher-less script and a wrong version each fail, naming it', () => {
  const configuration = hooksFor(native)
  delete configuration.hooks.sessionStart
  configuration.hooks.preToolUse[0].command = 'node scripts/guard-edit.mjs'
  configuration.version = 2
  assert.deepEqual(
    scaffoldProblems({ root: project(configuration), profile: native }).map((problem) =>
      problem.replace('.cursor/hooks.json: ', '')
    ),
    [
      'the sessionStart hook must run harness/tools/runtime-hooks/session-start.mjs',
      'the preToolUse hook for Write must run harness/tools/runtime-hooks/guard-edit.mjs',
      '"version" must be 1'
    ]
  )
})

test('a missing file and a file that is not JSON fail in native mode', () => {
  assert.match(
    scaffoldProblems({ root: project(undefined), profile: native })[0],
    /missing; the cursor runtime expects it/
  )
  assert.match(scaffoldProblems({ root: project('{'), profile: native })[0], /not valid JSON/)
})

test('compat mode needs no file, and fails on a framework hook in it, which would run twice', () => {
  assert.deepEqual(scaffoldProblems({ root: project(undefined), profile: compat }), [])
  const own = { version: 1, hooks: { stop: [{ command: './my-hook.sh' }] } }
  assert.deepEqual(scaffoldProblems({ root: project(own), profile: compat }), [])
  const doubled = hooksFor(native)
  assert.deepEqual(
    scaffoldProblems({ root: project(doubled), profile: compat }).map((problem) => problem.match(/the (\w+) hook/)[1]),
    ['sessionStart', 'beforeShellExecution', 'preToolUse', 'afterFileEdit']
  )
  assert.match(
    scaffoldProblems({ root: project(doubled), profile: compat })[0],
    /Cursor also runs from \.claude\/settings\.json/
  )
})

test('an entry file other than AGENTS.md fails in both modes, because nothing else points Cursor at it', () => {
  for (const runtimes of [native, compat]) {
    const profile = { ...runtimes, paths: { entryFile: 'RULES.md' } }
    assert.match(
      scaffoldProblems({ root: project(hooksFor(profile) ?? undefined), profile })[0],
      /paths\.entryFile is RULES\.md: Cursor reads AGENTS\.md itself/
    )
  }
})
