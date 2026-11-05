// The repositories of a flow (task 5.8): the rows of the `repos` setting, their folders on this machine, what an external step may be, and the prompt words.
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { after, test } from 'node:test'
import { parseStep } from './flow-steps.mjs'
import {
  isExternal,
  localRepoPaths,
  repoRow,
  repoRows,
  repoSettingsProblems,
  repoWords,
  stepRepoProblems
} from './flow-repos.mjs'
import { FLOW_DEFAULTS } from './flows.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const step = (fields) =>
  parseStep({
    '#': '4',
    kind: 'consumer-take',
    repo: 'app',
    scope: '`1.0.0`',
    needs: '3',
    'stops for': '—',
    sp: '2',
    'est. usage': '—',
    model: 'C2',
    state: '⬜',
    ...fields
  })
const app = { remote: 'acme/app', role: 'consumer' }
const settings = (repos) => ({ ...FLOW_DEFAULTS, repos: { home: '.', ...repos } })

test('the home repository is first and implicit; an external one is a row with its remote, role and the kinds it allows', () => {
  assert.deepEqual(repoRows(FLOW_DEFAULTS), [{ alias: 'home', home: true, remote: null, role: 'home', kinds: null }])
  const rows = repoRows(settings({ app: { ...app, kinds: ['consumer-take', 'custom'] }, tool: app }))
  assert.deepEqual(
    rows.map((row) => [row.alias, row.remote, row.role, row.kinds]),
    [
      ['home', null, 'home', null],
      ['app', 'acme/app', 'consumer', ['consumer-take', 'custom']],
      ['tool', 'acme/app', 'consumer', ['consumer-take']]
    ]
  )
  assert.equal(repoRow(settings({ app }), 'app').remote, 'acme/app')
  assert.equal(repoRow(settings({ app }), 'other'), undefined)
  assert.equal(isExternal(step({})), true)
  assert.equal(isExternal(step({ repo: 'home' })), false)
})

test('a step table without a Repo column, or with an empty cell, is the home repository', () => {
  assert.equal(parseStep({ '#': '1', kind: 'tasks', scope: 'I-1' }).repo, 'home')
  assert.equal(parseStep({ '#': '1', kind: 'tasks', repo: ' ', scope: 'I-1' }).repo, 'home')
})

test('the settings of the repositories: a row needs its remote, role and allowed kinds; a path or a release cut is refused', () => {
  assert.deepEqual(repoSettingsProblems(settings({ app })), [])
  assert.deepEqual(repoSettingsProblems(FLOW_DEFAULTS), [])
  const problems = repoSettingsProblems(
    settings({
      a: '../app',
      b: { remote: 'nowhere', role: ' ' },
      c: { ...app, kinds: [] },
      d: { ...app, kinds: ['cut', 'tasks', 'consumer-take'] }
    })
  ).join('\n')
  assert.match(
    problems,
    /the repository "a" is not a row \{ "remote", "role", "kinds" \}; a path belongs in harness-profile\.local\.json/
  )
  assert.match(problems, /the repository "b" has no remote "owner\/name"/)
  assert.match(problems, /the repository "b" has no role/)
  assert.match(problems, /the repository "c" allows no step kind/)
  assert.match(
    problems,
    /the repository "d" allows the kind "cut"; only consumer-take and custom run in an external repository/
  )
  assert.match(problems, /the repository "d" allows the kind "tasks"/)
  assert.match(repoSettingsProblems({ repos: ['x'] })[0], /is not an object/)
  assert.match(repoSettingsProblems(settings({ home: '../elsewhere' }))[0], /the home repository is "\."/)
})

test('an external step is a kind its repository allows, and names no id of the other plan', () => {
  const external = settings({ app })
  assert.deepEqual(stepRepoProblems(step({}), external), [])
  assert.deepEqual(stepRepoProblems(step({ repo: 'home', kind: 'tasks', scope: 'I-1' }), external), [])
  assert.match(
    stepRepoProblems(step({ repo: 'tool' }), external)[0],
    /names the repository "tool", which the flow's "repos" setting does not hold \(home, app\)/
  )
  assert.match(
    stepRepoProblems(step({ kind: 'custom' }), settings({ app }))[0],
    /is a custom step in the repository "app", which allows consumer-take there/
  )
  const named = stepRepoProblems(step({ scope: '`1.0.0`, task 7.3, Phase 4' }), external).join('\n')
  assert.match(
    named,
    /names 7\.3, Phase 4; the plan of that repository is its own: name the work by what it does \("take `1\.0\.0`"\), never by task ids/
  )
})

test('the folders on this machine come from the ignored local profile file, relative to the project or absolute; an alias without one is absent', () => {
  const root = mkdtempSync(join(tmpdir(), 'flow-repos-'))
  dirs.push(root)
  assert.deepEqual(localRepoPaths(root, settings({ app })), { home: '.' })
  writeFileSync(
    join(root, 'harness-profile.local.json'),
    JSON.stringify({ repos: { app: '../app', tool: '/work/tool', gone: '', home: '/ignored' } })
  )
  assert.deepEqual(localRepoPaths(root, settings({ app, tool: app, gone: app })), {
    home: '.',
    app: resolve(root, '../app'),
    tool: '/work/tool'
  })
  writeFileSync(join(root, 'harness-profile.local.json'), 'not json')
  assert.deepEqual(localRepoPaths(root, settings({ app })), { home: '.' })
})

test('the words of a prompt: nothing for the home repository, the alias, remote and folder for an external one', () => {
  assert.deepEqual(repoWords(step({ repo: 'home' }), settings({ app }), {}), {
    repo: undefined,
    repoPath: undefined,
    remote: undefined,
    external: false
  })
  assert.deepEqual(repoWords(step({}), settings({ app }), { app: '/work/app' }), {
    repo: 'app',
    remote: 'acme/app',
    repoPath: 'acme/app, at /work/app',
    external: true
  })
  assert.equal(repoWords(step({}), settings({ app }), {}).repoPath, 'acme/app')
})
