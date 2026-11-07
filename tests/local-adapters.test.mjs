// Task 3.4: a project with an adapter of its own repository (`harness-adapters/`, selected as `local:<name>`) passes `check all`, is left alone by a sync, is
// judged by the conformance suite of the version it migrates to, and is restored by a rollback. The fixture is a project bootstrapped from the tree of this
// repository, whose stack is then switched to a copy of the node-ts preset kept in the project.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { after, before, test } from 'node:test'
import { bootstrapProject, disposeFixtures, FRAMEWORK_DIR, tempDir } from '../tools/conformance/fixture.mjs'
import { readLock } from '../tools/lib/lock.mjs'

const NAME = 'acme-ts'
const ADAPTER = `harness-adapters/stack/${NAME}`
let env
let root

const manifestOf = () => JSON.parse(readFileSync(join(FRAMEWORK_DIR, 'framework.json'), 'utf8'))

// The tree of this repository as a project would receive it, as the version `version`
function tree(version) {
  const manifest = manifestOf()
  const dir = tempDir('local-adapters-source-')
  for (const path of manifest.distributable) {
    cpSync(join(FRAMEWORK_DIR, path), join(dir, path), { recursive: true })
  }
  writeFileSync(join(dir, 'framework.json'), JSON.stringify({ ...manifest, version }, null, 2))
  return dir
}

const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const harness = (...args) =>
  spawnSync(process.execPath, [join(root, 'harness/tools/harness.mjs'), ...args, '--root', root], {
    encoding: 'utf8',
    env
  })
const output = (result) => `${result.stdout}${result.stderr}`

const readProfile = () => JSON.parse(readFileSync(join(root, 'harness-profile.json'), 'utf8'))
const writeProfile = (profile) =>
  writeFileSync(join(root, 'harness-profile.json'), `${JSON.stringify(profile, null, 2)}\n`)

before(() => {
  const source = tree('0.3.0')
  const project = bootstrapProject({
    framework: source,
    stacks: ['node-ts'],
    runtimes: ['claude-code'],
    host: 'github'
  })
  assert.equal(project.code, 0, project.output)
  ;({ root, env } = project)

  // The adapter of the project: a copy of the preset under another name, in the project's own repository
  const adapter = join(root, ADAPTER)
  mkdirSync(dirname(adapter), { recursive: true })
  cpSync(join(source, 'adapters/stack/node-ts'), adapter, { recursive: true })
  const manifest = JSON.parse(readFileSync(join(adapter, 'manifest.json'), 'utf8'))
  writeFileSync(join(adapter, 'manifest.json'), `${JSON.stringify({ ...manifest, name: NAME }, null, 2)}\n`)
  // An adapter of the project imports nothing from the framework's tools: the preset reaches them by a path that exists in the framework tree only
  const scaffold = readFileSync(join(adapter, 'scaffold.mjs'), 'utf8').replace(
    "import { frameworkDir, inFramework } from '../../../tools/lib/lock.mjs'",
    "const frameworkDir = (profile) => profile?.paths?.frameworkDir ?? 'harness'\nconst inFramework = (profile, path) => `${frameworkDir(profile)}/${path}`"
  )
  assert.doesNotMatch(scaffold, /tools\/lib/)
  writeFileSync(join(adapter, 'scaffold.mjs'), scaffold)
  const profile = readProfile()
  writeProfile({ ...profile, adapters: { ...profile.adapters, stacks: [`local:${NAME}`] } })
  const synced = harness('sync', '--local')
  assert.equal(synced.status, 0, output(synced))
  git('checkout', '-q', '-b', 'chore/take-version')
  git('add', '-A')
  git('commit', '-q', '-m', 'chore: a stack of the project')
})
after(disposeFixtures)

test('a project that selects local:<name> passes check all, with the adapter judged by the conformance suite', () => {
  const quiet = harness('check', 'all')
  assert.equal(quiet.status, 0, output(quiet))
  assert.match(output(quiet), /^harness check all: \d+ checks passed\s*$/)
  const checked = harness('check', 'all', '--verbose')
  assert.equal(checked.status, 0, output(checked))
  assert.match(output(checked), /Ran the conformance suite on 1 adapters of the project's own repository/)
  assert.match(output(checked), /\(1 of the project's own repository\)/)
})

test('the lock records no local adapter, and a sync of the same version leaves harness-adapters/ as it is', () => {
  assert.deepEqual(
    readLock(root).adapters.stacks,
    ['node-ts'],
    'the lock still holds the stack the project was bootstrapped with'
  )
  const before = git('rev-parse', `HEAD:${ADAPTER}`)
  const synced = harness('sync', '--from', tree('0.3.0'))
  assert.equal(synced.status, 0, output(synced))
  assert.deepEqual(readLock(root).adapters.stacks, [], 'a sync selects the framework adapters only')
  assert.equal(git('status', '--porcelain', '--', 'harness-adapters'), '', 'the folder is untouched')
  assert.equal(git('rev-parse', `HEAD:${ADAPTER}`), before)
  assert.equal(harness('check', 'vendored').status, 0)
})

test('a version that changes the contract stops the migration with the adapter named; fixing the adapter finishes it; a rollback restores the folder', () => {
  git('add', '-A')
  git('commit', '-q', '--allow-empty', '-m', 'chore: after the sync')
  const start = git('rev-parse', 'HEAD')

  // 0.4.0 adds a required role to the stack contract, and its note says so
  const next = tree('0.4.0')
  const schemaPath = join(next, 'profile/manifest.schema.json')
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  schema['x-roles'].stack['security-scan'] = 'required'
  writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`)
  writeFileSync(
    join(next, 'migrations/0.4.0.md'),
    '# Migration to 0.4.0\n\nThe stack contract has a required role `security-scan`.\n'
  )

  const refused = harness('sync', '--from', next)
  assert.notEqual(refused.status, 0, 'the migration does not pass')
  const message = output(refused)
  assert.match(message, /0\.4\.0 does not accept the adapters of this repository/)
  assert.match(message, new RegExp(`${ADAPTER}: fails the conformance suite of the stack contract`))
  assert.match(message, /"security-scan"/, 'the failing check names the role the contract added')
  assert.match(message, /migrations\/0\.4\.0\.md/, 'the message points to the note of the version')
  assert.equal(git('log', '-1', '--format=%H'), start, 'nothing was committed')

  // The fix: the adapter fills the new role; the run is taken again
  const manifestPath = join(root, ADAPTER, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  manifest.roles['security-scan'] = { fills: 'the scanner of the project, run by its own command' }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  const migrated = harness('migrate')
  assert.equal(migrated.status, 0, output(migrated))
  assert.equal(readLock(root).version, '0.4.0')
  assert.match(git('log', '-1', '--format=%s'), /chore\(framework\): migrate to 0\.4\.0/)
  assert.ok(
    git('show', '--name-only', '--format=', 'HEAD').split('\n').includes(`${ADAPTER}/manifest.json`),
    'the migration commit holds the fix'
  )
  assert.equal(harness('check', 'all').status, 0)

  const undone = harness('rollback')
  assert.equal(undone.status, 0, output(undone))
  assert.equal(git('diff', start, '--stat'), '', 'no file differs from the start, the adapter included')
  assert.ok(!JSON.parse(readFileSync(manifestPath, 'utf8')).roles['security-scan'], 'the adapter is as it was')
  assert.ok(existsSync(join(root, ADAPTER)))
})
