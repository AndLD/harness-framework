import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { ADAPTERS_DIR, isLocal } from './adapters.mjs'
import { runCheck } from './checks.mjs'
import { generators } from './generators.mjs'
import { migrate } from './migrate.mjs'
import { frameworkAdapters, writeLock } from './lock.mjs'
import {
  listLocalAdapters,
  localAdapterProblems,
  localLoadErrors,
  localSuiteProblems,
  profileNames,
  registerLocalAdapters
} from './local-adapters.mjs'
import { renderRuleMap } from './rule-map.mjs'
import { selectedStacks, STACKS, stackModule } from './stacks.mjs'
import { HOSTS } from './host.mjs'
import { ADAPTER_RUNTIMES } from './runtimes.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

// A project folder with copies of presets under other names in `harness-adapters/`: `{ stack: 'acme-ts', runtime: 'acme-agent', host: 'acme-forge' }`
function project(names) {
  const root = mkdtempSync(join(tmpdir(), 'local-adapters-'))
  dirs.push(root)
  for (const [axis, [preset, name]] of Object.entries(names)) {
    const target = join(root, 'harness-adapters', axis, name)
    mkdirSync(join(target, '..'), { recursive: true })
    cpSync(join(ADAPTERS_DIR, axis, preset), target, { recursive: true })
    const path = join(target, 'manifest.json')
    writeFileSync(path, JSON.stringify({ ...JSON.parse(readFileSync(path, 'utf8')), name }))
    // The presets reach the tools of the framework by a path of the framework tree, which a folder of the project does not have: point it at the tools
    for (const file of readdirSync(target).filter((entry) => entry.endsWith('.mjs'))) {
      const text = readFileSync(join(target, file), 'utf8')
      writeFileSync(join(target, file), text.replaceAll("'../../../tools/lib/", `'${import.meta.dirname}/`))
    }
  }
  return root
}
const profileOf = (adapters) => ({ adapters })

test('a name is local when it starts with local:, and the profile names are listed by axis', () => {
  assert.equal(isLocal('local:go'), true)
  assert.equal(isLocal('node-ts'), false)
  assert.equal(isLocal(undefined), false)
  assert.deepEqual(
    profileNames(
      profileOf({ stacks: ['local:go', { adapter: 'python', packages: ['api'] }], runtimes: [], host: 'local:forge' })
    ),
    { stack: ['local:go', 'python'], runtime: [], host: ['local:forge'] }
  )
  assert.deepEqual(profileNames({}), { stack: [], runtime: [], host: [] })
})

test('the adapters of harness-adapters/ are listed with the name the profile file selects them by', () => {
  const root = project({ stack: ['node-ts', 'acme-ts'] })
  assert.deepEqual(
    listLocalAdapters(root).map(({ axis, name, id, base }) => ({ axis, name, id, base })),
    [{ axis: 'stack', name: 'acme-ts', id: 'local:acme-ts', base: 'harness-adapters' }]
  )
  assert.deepEqual(listLocalAdapters(mkdtempSync(join(tmpdir(), 'none-'))), [])
})

test('a local name must have a valid name and a folder on its axis, and the manifests are held to the contract', () => {
  const root = project({ stack: ['node-ts', 'acme-ts'] })
  assert.deepEqual(localAdapterProblems(root, profileOf({ stacks: ['local:acme-ts'] })), [])
  assert.deepEqual(localAdapterProblems(root, profileOf({ stacks: ['node-ts'] })), [])
  assert.deepEqual(localAdapterProblems(root, profileOf({ stacks: ['local:missing'], runtimes: ['local:Bad_Name'] })), [
    'local:missing: the profile file selects it as a stack adapter, but harness-adapters/stack/missing/manifest.json does not exist',
    'local:Bad_Name: a local adapter is named "local:<name>", the name lower case words joined by hyphens'
  ])
  // The folder is on the stack axis; selecting it as a host is an error
  assert.match(localAdapterProblems(root, profileOf({ host: 'local:acme-ts' }))[0], /selects it as a host adapter/)
  // A manifest that breaks its contract is reported under the folder of the project
  const path = join(root, 'harness-adapters/stack/acme-ts/manifest.json')
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  delete manifest.roles['test-runner']
  writeFileSync(path, JSON.stringify(manifest))
  assert.deepEqual(localAdapterProblems(root, profileOf({ stacks: ['local:acme-ts'] })), [
    'harness-adapters/stack/acme-ts/manifest.json: the required role "test-runner" of the stack contract is not filled'
  ])
})

test('a sync takes the adapters of the framework only', () => {
  assert.deepEqual(
    frameworkAdapters(
      profileOf({
        stacks: ['local:acme-ts', 'python', { adapter: 'local:go' }],
        runtimes: ['local:agent', 'cursor'],
        host: 'local:forge'
      })
    ),
    { stacks: ['python'], runtimes: ['cursor'], host: null }
  )
  assert.deepEqual(frameworkAdapters(profileOf({ stacks: ['node-ts'], host: 'github' })), {
    stacks: ['node-ts'],
    runtimes: [],
    host: 'github'
  })
})

test('registering loads the adapters of the project into the registries under local:<name>, and the tools find them by the profile name', async () => {
  const root = project({ stack: ['node-ts', 'acme-reg-ts'], host: ['github', 'acme-reg-forge'] })
  const { loaded, errors } = await registerLocalAdapters(root)
  assert.deepEqual(errors, [])
  assert.deepEqual(loaded.sort(), ['local:acme-reg-forge', 'local:acme-reg-ts'])
  assert.ok(STACKS['local:acme-reg-ts'])
  assert.ok(HOSTS['local:acme-reg-forge'])
  const [stack] = selectedStacks(profileOf({ stacks: ['local:acme-reg-ts'] }))
  assert.equal(stack.adapter, STACKS['local:acme-reg-ts'])
  assert.equal(typeof stackModule(stack, 'formatter').formatCommand, 'function')
  assert.equal(STACKS['node-ts'].manifest.name, 'node-ts', 'the adapters of the framework stay')
  assert.ok(!('local:acme-reg-ts' in (await registerLocalAdapters(mkdtempSync(join(tmpdir(), 'empty-')))).loaded))
})

test('a local runtime adapter adds its generators once, and registering again replaces them', async () => {
  const root = project({ runtime: ['claude-code', 'acme-agent'] })
  const count = () => generators.filter(({ id }) => id.includes('local:acme-agent')).length
  assert.equal(count(), 0)
  await registerLocalAdapters(root)
  const first = count()
  assert.ok(first > 0, 'skills for the procedures')
  assert.ok(ADAPTER_RUNTIMES['local:acme-agent'])
  await registerLocalAdapters(root)
  assert.equal(count(), first)
})

test('an adapter whose module cannot be loaded is left out and reported, and the others load', async () => {
  const root = project({ stack: ['node-ts', 'acme-ok-ts'], host: ['github', 'acme-broken-forge'] })
  writeFileSync(join(root, 'harness-adapters/host/acme-broken-forge/protect.mjs'), 'throw new Error("broken module")\n')
  const { loaded, errors } = await registerLocalAdapters(root)
  assert.deepEqual(loaded, ['local:acme-ok-ts'])
  assert.deepEqual(errors, ['harness-adapters/host/acme-broken-forge: broken module'])
  assert.deepEqual(localLoadErrors(), errors)

  writeFileSync(join(root, 'harness-adapters/stack/acme-ok-ts/manifest.json'), '{')
  assert.match((await registerLocalAdapters(root)).errors[0], /^harness-adapters\/: /)
})

test('the rule map counts what a local adapter enforces', () => {
  const root = project({ host: ['github', 'acme-rules-forge'] })
  const profile = {
    ...profileOf({ stacks: [], host: 'local:acme-rules-forge' }),
    host: { protection: true },
    documents: {}
  }
  const without = renderRuleMap(profile)
  const within = renderRuleMap(profile, { localRoot: root })
  assert.doesNotMatch(without, /repository ruleset of `harness host protect`/)
  assert.match(within, /repository ruleset of `harness host protect`/)
})

test('the adapters check reports the local adapters, and a selected one that is missing', () => {
  const root = project({ stack: ['node-ts', 'acme-ts'] })
  const ok = runCheck('adapters', { root, profile: profileOf({ stacks: ['local:acme-ts'] }) })
  assert.deepEqual(ok.problems, [])
  assert.match(ok.messages[0], /\(1 of the project's own repository\)/)
  const missing = runCheck('adapters', { root, profile: profileOf({ stacks: ['local:other'] }) })
  assert.match(missing.problems[0], /^local:other: /)
  const none = runCheck('adapters', {
    root: mkdtempSync(join(tmpdir(), 'none-')),
    profile: profileOf({ stacks: ['node-ts'] })
  })
  assert.doesNotMatch(none.messages[0], /own repository/)
})

test('the conformance suite runs on every local adapter, and a failure names the adapter, the contract and the failed checks', () => {
  const root = project({ stack: ['node-ts', 'acme-ts'], host: ['github', 'acme-forge'] })
  const calls = []
  const run = (program, args) => {
    calls.push(args.slice(1).join(' '))
    return args.at(-1).endsWith('acme-ts')
      ? {
          status: 1,
          stdout:
            'ok   the logic roles export functions\nFAIL the manifest matches the contract\n       the required role "x" is not filled\n       second line\nThe stack adapter acme-ts fails 1 of 2 checks.\n',
          stderr: ''
        }
      : { status: 1, stdout: '', stderr: 'harness: boom\n' }
  }
  const { problems, count } = localSuiteProblems(root, { harness: 'harness.mjs', run })
  assert.equal(count, 2)
  assert.equal(calls.length, 2)
  assert.deepEqual(problems, [
    'harness-adapters/stack/acme-ts: fails the conformance suite of the stack contract: the manifest matches the contract\n    the required role "x" is not filled\n    second line',
    'harness-adapters/host/acme-forge: the conformance suite could not run: harness: boom'
  ])
  const passing = localSuiteProblems(root, {
    harness: 'harness.mjs',
    run: () => ({ status: 0, stdout: '', stderr: '' })
  })
  assert.deepEqual(passing, { problems: [], count: 2 })
  assert.deepEqual(localSuiteProblems(mkdtempSync(join(tmpdir(), 'none-'))), { problems: [], count: 0 })
  // A run that prints nothing
  assert.match(localSuiteProblems(root, { run: () => ({ status: 1 }) }).problems[0], /could not run: no output/)
})

test('the check local-adapters has nothing to run in a project without harness-adapters/', () => {
  const result = runCheck('local-adapters', { root: mkdtempSync(join(tmpdir(), 'none-')) })
  assert.deepEqual(result.problems, [])
  assert.match(result.messages[0], /no adapters of its own repository/)
})

test('a migration stops, before it commits, when the new version rejects a local adapter, and says which notes explain the change', async () => {
  const root = mkdtempSync(join(tmpdir(), 'migrate-local-'))
  dirs.push(root)
  mkdirSync(join(root, 'harness/migrations'), { recursive: true })
  writeFileSync(join(root, 'harness/migrations/0.4.0.md'), '# note\n')
  writeLock(root, {
    framework: 'harness-framework',
    mode: 'pinned',
    version: '0.4.0',
    migrations: { version: '0.3.0', applied: [] },
    files: {},
    managed: {}
  })
  const profile = { paths: {}, adapters: {} }
  const rejected = ['harness-adapters/stack/acme-ts: fails the conformance suite of the stack contract: x']
  await assert.rejects(
    migrate({ root, generators: [], profile, localSuite: () => ({ problems: rejected, count: 1 }) }),
    (error) => {
      assert.match(error.message, /^0\.4\.0 does not accept the adapters of this repository/)
      assert.match(error.message, /harness-adapters\/stack\/acme-ts: fails/)
      assert.match(
        error.message,
        /The migration note of 0\.4\.0 \(harness\/migrations\/0\.4\.0\.md\) says what changed/
      )
      return true
    }
  )
  const done = await migrate({ root, generators: [], profile, localSuite: () => ({ problems: [], count: 1 }) })
  assert.match(done.messages.at(-1), /Migrated to harness-framework 0\.4\.0/)
})
