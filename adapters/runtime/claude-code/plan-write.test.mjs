import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { scaffoldFiles } from './scaffold.mjs'
import { defaultFolders, foldersFor, planWrite } from './plan-write.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const profile = {
  paths: {
    plan: 'docs/plan',
    phases: 'docs/plan/phases',
    flows: 'docs/plan/flows',
    issues: 'docs/plan/issues',
    backlog: 'notes/backlog'
  }
}

function project(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'plan-write-'))
  dirs.push(root)
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content))
  }
  return root
}
const apply = (root, result) =>
  result.files.forEach(({ path, content }) => {
    const full = path.startsWith('/') ? path : join(root, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  })
const read = (root, path) => JSON.parse(readFileSync(join(root, path), 'utf8'))

test('the default folders are the plan roles of paths, without a folder that lies in another', () => {
  assert.deepEqual(defaultFolders(profile), ['docs/plan', 'notes/backlog'])
  assert.deepEqual(defaultFolders({}), [])
})

test('on writes one rule per folder to the tracked settings, keeps the other rules, and off removes only those', () => {
  const root = project({
    '.claude/settings.json': { hooks: { X: [] }, permissions: { allow: ['Bash(ls)'], deny: ['Read(**/.env)'] } }
  })
  const request = { root, profile, home: join(root, 'home') }
  const on = planWrite({ ...request, action: 'on' })
  assert.equal(on.on, true)
  assert.equal(on.path, '.claude/settings.json')
  assert.match(on.messages.at(-1), /run the project's formatter on \.claude\/settings\.json\.$/)
  apply(root, on)
  const settings = read(root, '.claude/settings.json')
  assert.deepEqual(settings.permissions.allow, ['Bash(ls)', 'Edit(docs/plan/**)', 'Edit(notes/backlog/**)'])
  assert.deepEqual(settings.permissions.deny, ['Read(**/.env)'])
  assert.deepEqual(settings.hooks, { X: [] })
  assert.equal(planWrite({ ...request, action: 'state' }).on, true)
  assert.deepEqual(planWrite({ ...request, action: 'on' }).files, [], 'on again changes nothing')
  apply(root, planWrite({ ...request, action: 'off' }))
  assert.deepEqual(read(root, '.claude/settings.json').permissions.allow, ['Bash(ls)'])
  assert.equal(planWrite({ ...request, action: 'state' }).on, false)
})

test('a project with no settings file gets one, and off on the last rule drops the allow list', () => {
  const root = project()
  const request = { root, profile }
  apply(root, planWrite({ ...request, action: 'on' }))
  assert.equal(read(root, '.claude/settings.json').permissions.allow.length, 2)
  apply(root, planWrite({ ...request, action: 'off' }))
  assert.deepEqual(read(root, '.claude/settings.json'), { permissions: {} })
})

test('the folders setting replaces the default, and the state names each folder', () => {
  const root = project()
  const request = { root, profile, folders: ['docs/plan/logs/'] }
  apply(root, planWrite({ ...request, action: 'on' }))
  assert.deepEqual(read(root, '.claude/settings.json').permissions.allow, ['Edit(docs/plan/logs/**)'])
  const state = planWrite({ root, profile, action: 'state' })
  assert.deepEqual(state.folders, [
    { folder: 'docs/plan', allowed: false },
    { folder: 'notes/backlog', allowed: false }
  ])
  assert.equal(state.on, false)
})

test('the local scope writes the ignored file, and the user scope the home folder; the project file stays untouched', () => {
  const root = project({ '.claude/settings.json': { permissions: { allow: [] } } })
  const home = project()
  const before = readFileSync(join(root, '.claude/settings.json'), 'utf8')
  const local = planWrite({ root, profile, action: 'on', scope: 'local' })
  assert.equal(local.path, '.claude/settings.local.json')
  const user = planWrite({ root, profile, action: 'on', scope: 'user', home })
  assert.equal(user.path, join(home, '.claude', 'settings.json'))
  apply(root, local)
  apply(root, user)
  assert.equal(readFileSync(join(root, '.claude/settings.json'), 'utf8'), before)
  assert.equal(read(home, '.claude/settings.json').permissions.allow.length, 2)
  assert.throws(() => planWrite({ root, profile, action: 'on', scope: 'user' }), /home folder/)
  assert.throws(() => planWrite({ root, profile, action: 'on', scope: 'team' }), /not a scope/)
})

test('the settings, the hooks and the Git directory are refused, and so is a folder outside the project or a pattern', () => {
  for (const folder of [
    '.claude',
    '.claude/worktrees',
    '.git',
    '.',
    'harness',
    'harness/tools/runtime-hooks',
    '../x',
    '/etc',
    'docs/*'
  ]) {
    assert.throws(() => foldersFor(profile, [folder]), undefined, folder)
  }
  assert.deepEqual(foldersFor(profile, ['docs/plan']), ['docs/plan'])
})

test('a settings file that is not JSON, and an unknown action, fail with a message', () => {
  const root = project({ '.claude/settings.json': '{ no' })
  assert.throws(() => planWrite({ root, profile, action: 'on' }), /not valid JSON/)
  assert.throws(() => planWrite({ root, profile, action: 'maybe' }), /not on, off or state/)
})

test('the scaffold carries the rules unless the bootstrap option leaves them off', () => {
  const settings = (options) =>
    JSON.parse(scaffoldFiles(profile, options).find(({ path }) => path === '.claude/settings.json').content)
  assert.deepEqual(settings().permissions.allow, ['Edit(docs/plan/**)', 'Edit(notes/backlog/**)'])
  assert.equal(settings({ planWrite: false }).permissions.allow, undefined)
})
