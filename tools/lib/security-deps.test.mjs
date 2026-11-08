import assert from 'node:assert/strict'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { checkBinaries, checkManifests, dependencySpecs, runAudit } from './security-deps.mjs'
import { loadProfile } from './profile.mjs'
import { trackedFiles } from './security-secrets.mjs'
import { removeRepos, repo } from './test-repo.mjs'

after(removeRepos)
const node = loadProfile(join(import.meta.dirname, '..', '..'))
const python = { adapters: { stacks: ['python'] } }
const manifests = (root, profile) => checkManifests({ root, profile, files: trackedFiles(root, profile) })
const reported = (root) =>
  manifests(root, node)
    .problems.filter((problem) => problem.probe === 'S2-001')
    .map((problem) => problem.text.split(':')[0])
const texts = (found) => found.problems.map((problem) => `${problem.probe} ${problem.text}`)

test('S2-001: a manifest with no tracked lock file beside it is reported, one with a lock file is not, and node_modules is skipped', () => {
  const root = repo({
    'package.json': '{}',
    'package-lock.json': '{}',
    'tools/a/package.json': '{}',
    'tools/b/package.json': '{}',
    'tools/b/yarn.lock': '',
    'node_modules/x/package.json': '{}'
  })
  const found = manifests(root, node)
  assert.equal(found.manifests, 3)
  assert.deepEqual(
    texts(found).map((text) => text.slice(0, 36)),
    ['S2-001 tools/a/package.json: no lock']
  )
})

test('S2-001: a workspace that the lock file at the root covers is not reported, one the root does not list or with no lock at all is', () => {
  const covered = repo({
    'package.json': JSON.stringify({ workspaces: ['packages/*', '!packages/skip'] }),
    'package-lock.json': '{}',
    'packages/a/package.json': '{}',
    'packages/a/nested/package.json': '{}',
    'packages/skip/package.json': '{}',
    'tools/x/package.json': '{}'
  })
  assert.deepEqual(reported(covered), [
    'packages/a/nested/package.json',
    'packages/skip/package.json',
    'tools/x/package.json'
  ])

  const object = repo({
    'package.json': JSON.stringify({ workspaces: { packages: ['apps/**'] } }),
    'yarn.lock': '',
    'apps/web/deep/package.json': '{}'
  })
  assert.deepEqual(reported(object), [])

  const unlocked = repo({
    'package.json': JSON.stringify({ workspaces: ['packages/*'] }),
    'packages/a/package.json': '{}'
  })
  assert.deepEqual(reported(unlocked), ['package.json', 'packages/a/package.json'])
})

test('S2-003: the open versions of a manifest are reported with the manifest, and a bounded one is not', () => {
  const root = repo({
    'package.json': JSON.stringify({ dependencies: { a: 'latest', b: '^1.0.0' } }),
    'package-lock.json': '{}'
  })
  assert.deepEqual(texts(manifests(root, node)), ['S2-003 package.json: a in dependencies: "latest" takes any version'])
})

test('the python stack: pyproject.toml needs one of its lock files, and a requirements file is its own record', () => {
  const root = repo({
    'pyproject.toml': 'dependencies = ["flask==3.0.0"]\n',
    'api/pyproject.toml': 'dependencies = ["flask==3.0.0"]\n',
    'api/uv.lock': '',
    'requirements-dev.txt': 'pytest\n'
  })
  const found = manifests(root, python)
  assert.equal(found.manifests, 3)
  assert.deepEqual(
    texts(found).map((text) => text.slice(0, 25)),
    ['S2-001 pyproject.toml: no', 'S2-003 requirements-dev.t']
  )
})

test('a stack without the role "dependency-audit", and a project without a stack, have no manifests to check', () => {
  assert.deepEqual(dependencySpecs({ adapters: { stacks: [] } }), [])
  assert.equal(manifests(repo({ 'package.json': '{}' }), { adapters: { stacks: [] } }).manifests, 0)
})

test('S2-016: an executable or an archive of code, and a binary that is not media, are reported; media and text are not', () => {
  const root = repo({
    'bin/tool': Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46]), Buffer.alloc(20)]),
    'bin/mac': Buffer.from([0xcf, 0xfa, 0xed, 0xfe, 0, 0]),
    'lib/a.jar': 'PK',
    'data/blob.dat': Buffer.from([1, 2, 0, 3]),
    'img/logo.png': Buffer.from([0x89, 0x50, 0, 0]),
    'src/app.js': 'console.log(1)\n'
  })
  const found = checkBinaries({ root, files: [...trackedFiles(root, node), 'gone.dat'] })
  assert.deepEqual(found.map((problem) => problem.text.split(':')[0]).sort(), [
    'bin/mac',
    'bin/tool',
    'data/blob.dat',
    'lib/a.jar'
  ])
  assert.match(found.find((problem) => problem.text.startsWith('bin/tool')).text, /ELF executable is tracked/)
})

test('S2-010: the audit runs the command of the stack once, the profile may set another, and a failing exit is the problem with the tail of its output', () => {
  const ran = []
  const ok = runAudit({ root: '.', profile: node, run: (command) => (ran.push(command), { status: 0 }) })
  assert.deepEqual([ran, ok.problems], [['npm audit --audit-level=high'], []])
  const own = runAudit({
    root: '.',
    profile: { ...node, commands: { ...node.commands, audit: 'my-audit' } },
    run: (command) => (ran.push(command), { status: 0 })
  })
  assert.deepEqual(own.commands, ['my-audit'])
  const failed = runAudit({
    root: '.',
    profile: node,
    run: () => ({ status: 1, stdout: 'a\nb\nc\nd\n', stderr: '2 high' })
  })
  assert.equal(failed.problems[0].probe, 'S2-010')
  assert.match(failed.problems[0].text, /exited with 1: c \| d \| 2 high/)
  const two = runAudit({
    root: '.',
    profile: { adapters: { stacks: ['node-ts', 'node-ts'] } },
    run: (command) => (ran.push(command), { status: 0 })
  })
  assert.equal(two.commands.length, 1, 'the same command is not run twice')
})

test('the real audit command runs through the shell and its exit code counts', () => {
  const result = runAudit({ root: '.', profile: { adapters: { stacks: ['node-ts'] }, commands: { audit: 'exit 3' } } })
  assert.match(result.problems[0].text, /`exit 3` exited with 3/)
})
