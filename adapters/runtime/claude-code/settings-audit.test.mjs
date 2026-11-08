import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { loadProfile } from '../../../tools/lib/profile.mjs'
import { auditSettings, broadRules } from './settings-audit.mjs'
import { settingsFor } from './settings.mjs'

const profile = loadProfile(join(import.meta.dirname, '..', '..', '..'))
const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

function project(settings) {
  const root = mkdtempSync(join(tmpdir(), 'settings-audit-'))
  dirs.push(root)
  if (settings !== undefined) {
    mkdirSync(join(root, '.claude'))
    writeFileSync(
      join(root, '.claude', 'settings.json'),
      typeof settings === 'string' ? settings : JSON.stringify(settings)
    )
  }
  return root
}
const rules = (...allow) => broadRules({ allow }, profile).map((problem) => problem.text.match(/`([^`]+)`/)[1])

test("the rule of this repository's own settings (an edit rule for the plan's folder) is not broad, and the settings pass whole", () => {
  assert.deepEqual(rules('Edit(docs/development-plan/**)'), [])
  const own = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', '.claude', 'settings.json'), 'utf8'))
  assert.deepEqual(broadRules(own.permissions, profile), [])
  assert.deepEqual(auditSettings({ root: project(settingsFor(profile)), profile }), [])
})

test('S4-002: an edit rule for a whole project, for any folder, outside it or in the settings, the hooks or Git is broad', () => {
  const broad = [
    'Edit(**)',
    'Edit(*)',
    'Edit',
    'Write(**/*)',
    'Edit(*.md)',
    'Edit(**/docs/**)',
    'Edit(/etc/**)',
    'Edit(~/.ssh/**)',
    'Edit(../x/**)',
    'Edit(.claude/**)',
    'Edit(.git/hooks/x)',
    'Edit(.claude/settings.json)',
    'MultiEdit(src)'
  ]
  assert.deepEqual(rules(...broad), broad)
  assert.deepEqual(rules('Edit(src/**)', 'Edit(docs/a/b.md)', 'Write(./docs/x/**)'), [])
})

test('S4-002: a shell rule that allows every command, an interpreter, a package runner or a fetcher with any argument, or a destructive command with a wildcard is broad', () => {
  const broad = [
    'Bash',
    'Bash(*)',
    'Bash(:*)',
    'Bash(* install)',
    'Bash(node *)',
    'Bash(node:*)',
    'Bash(python3 *)',
    'Bash(npx *)',
    'Bash(curl *)',
    'Bash(bash)',
    'Bash(rm -rf *)',
    'Bash(chmod 777 *)',
    'Bash(/usr/bin/env *)'
  ]
  assert.deepEqual(rules(...broad), broad)
})

test('S4-002: a prefix such as git or a named script, and an exact command, are not broad (the shell guard limits the first; the decision of task 2.2)', () => {
  assert.deepEqual(
    rules(
      'Bash(git *)',
      'Bash(git status)',
      'Bash(node tools/harness.mjs *)',
      'Bash(rm -rf node_modules)',
      'Bash(npm test)',
      'Read(**)',
      'WebFetch'
    ),
    []
  )
})

test('a rule that the profile accepts in security.allowedRules is not reported', () => {
  const accepting = { ...profile, security: { ...profile.security, allowedRules: ['Bash(node *)'] } }
  assert.deepEqual(broadRules({ allow: ['Bash(node *)', 'Bash(python *)'] }, accepting).length, 1)
})

test('S1-015: a missing file, an unreadable one and a missing deny rule are reported', () => {
  assert.match(auditSettings({ root: project(undefined), profile })[0].text, /the file is not there/)
  assert.match(auditSettings({ root: project('{'), profile })[0].text, /not valid JSON/)
  const found = auditSettings({ root: project({ permissions: { deny: ['Read(**/.env)'] } }), profile })
  assert.ok(found.length >= 3)
  assert.ok(found.every((problem) => problem.probe === 'S1-015'))
  assert.match(found[0].text, /permissions\.deny lacks Read\(/)
})

test('S4-001 and S4-010: a committed setting that turns the permission checks or the hooks off is reported', () => {
  const settings = { ...settingsFor(profile), disableAllHooks: true }
  settings.permissions = { ...settings.permissions, defaultMode: 'bypassPermissions' }
  assert.deepEqual(
    auditSettings({ root: project(settings), profile }).map((problem) => problem.probe),
    ['S4-001', 'S4-010']
  )
  assert.deepEqual(
    auditSettings({ root: project({ ...settingsFor(profile), skipDangerousModePermissionPrompt: true }), profile }).map(
      (problem) => problem.probe
    ),
    ['S4-001']
  )
})

test("S4-001, S4-002 and S4-010: the owner's local settings are read too, and need no deny rules of their own (I-37)", () => {
  const root = project(settingsFor(profile))
  assert.deepEqual(auditSettings({ root, profile }), [], 'no local file, no finding')

  const local = join(root, '.claude', 'settings.local.json')
  writeFileSync(local, JSON.stringify({ permissions: { allow: ['Edit(docs/**)'] } }))
  assert.deepEqual(auditSettings({ root, profile }), [], 'a narrow rule and no deny rules are fine')

  writeFileSync(
    local,
    JSON.stringify({
      disableAllHooks: true,
      permissions: { defaultMode: 'bypassPermissions', allow: ['Bash(node *)', 'Bash(git *)'] }
    })
  )
  const found = auditSettings({ root, profile })
  assert.deepEqual(
    found.map((problem) => problem.probe),
    ['S4-001', 'S4-010', 'S4-002']
  )
  assert.ok(found.every((problem) => problem.text.startsWith('.claude/settings.local.json:')))

  writeFileSync(local, '{ nope')
  assert.match(auditSettings({ root, profile })[0].text, /settings\.local\.json: not valid JSON/)
})
