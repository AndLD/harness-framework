// Taking a version (task 3.5): `sync` places the files and starts `harness migrate` of the new version in a new process, which regenerates the
// managed files with the new version's tools. A project whose old `sync` could not start it runs `harness migrate` itself.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { run } from '../harness.mjs'
import { FRAMEWORK_DIR } from './bootstrap.mjs'
import { readLock } from './lock.mjs'
import { migrate } from './migrate.mjs'
import { sync } from './vendor.mjs'

const dirs = []
const fresh = () => {
  const dir = mkdtempSync(join(tmpdir(), 'migrate-'))
  dirs.push(dir)
  return dir
}
const saved = {}
before(() => {
  // The bootstrap commits: a fixed identity, and none of the machine's own Git configuration
  const config = join(fresh(), 'gitconfig')
  writeFileSync(config, '')
  const env = {
    GIT_AUTHOR_NAME: 't',
    GIT_AUTHOR_EMAIL: 't@t',
    GIT_COMMITTER_NAME: 't',
    GIT_COMMITTER_EMAIL: 't@t',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: config
  }
  for (const [key, value] of Object.entries(env)) {
    saved[key] = process.env[key]
    process.env[key] = value
  }
})
after(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

async function harness(root, argv) {
  const lines = []
  const code = await run([...argv, '--no-host-setup', '--root', root], {
    out: (line) => lines.push(line),
    err: (line) => lines.push(line)
  })
  return { code, output: lines.join('\n') }
}

// A check run by the project's own vendored tools, as its CI runs it; the exit code and what it printed
function projectCommand(root, ...args) {
  const result = spawnSync(process.execPath, [join(root, 'harness/tools/harness.mjs'), ...args, '--root', root], {
    encoding: 'utf8'
  })
  return { code: result.status, output: result.stdout + result.stderr }
}
const check = (root, name) => projectCommand(root, 'check', name)

const PROCEDURE = 'core/procedures/start-task.md'

// Two versions of the framework: a copy of this tree, and a next one in which a procedure (and so a generated skill) changed
function versions() {
  const manifest = JSON.parse(readFileSync(join(FRAMEWORK_DIR, 'framework.json'), 'utf8'))
  const copy = (version, change) => {
    const dir = fresh()
    for (const path of manifest.distributable) {
      cpSync(join(FRAMEWORK_DIR, path), join(dir, path), { recursive: true })
    }
    writeFileSync(join(dir, 'framework.json'), JSON.stringify({ ...manifest, version }, null, 2))
    change?.(dir)
    return dir
  }
  const first = copy('1.0.0')
  const second = copy('1.1.0', (dir) => {
    writeFileSync(
      join(dir, PROCEDURE),
      `${readFileSync(join(dir, PROCEDURE), 'utf8')}\nA step the next version added.\n`
    )
  })
  return { first, second }
}

async function projectAt(source) {
  const root = fresh()
  const { code, output } = await harness(root, [
    'init',
    '--non-interactive',
    '--name',
    'acme',
    '--repository',
    'acme/shop',
    '--stack',
    'node-ts',
    '--runtime',
    'claude-code',
    '--from',
    source
  ])
  assert.equal(code, 0, output)
  assert.equal(check(root, 'generated').code, 0)
  return root
}

test('sync alone brings the managed files to the new version: the new version’s tools regenerate them in a new process', async () => {
  const { first, second } = versions()
  const root = await projectAt(first)

  const result = await harness(root, ['sync', '--from', second])
  assert.equal(result.code, 0, result.output)
  assert.match(result.output, /Synced \d+ files of harness-framework 1\.1\.0/)
  assert.match(result.output, /Migrated to harness-framework 1\.1\.0\./)
  assert.equal(readLock(root).version, '1.1.0')
  assert.equal(check(root, 'generated').code, 0)
  const skill = readFileSync(join(root, '.claude/skills/start-task/SKILL.md'), 'utf8')
  assert.match(skill, /A step the next version added\./)
  assert.equal((await harness(root, ['check', 'vendored'])).code, 0)
})

test('a sync that cannot start the migration leaves the managed files stale, and `harness migrate` brings them in', async () => {
  const { first, second } = versions()
  const root = await projectAt(first)

  // What a consumer of an older version gets: the files are in place and nothing started the new version's tools
  sync({ root, from: second, startMigrate: () => [] })
  assert.match(check(root, 'generated').output, /not what the tools generate now/)

  const result = projectCommand(root, 'migrate')
  assert.equal(result.code, 0, result.output)
  assert.equal(check(root, 'generated').code, 0)
  assert.equal((await harness(root, ['check', 'vendored'])).code, 0)
})

test('migrate needs a lock, and a failing migration of the new version fails the sync with the way to run it again', async () => {
  assert.throws(() => migrate({ root: fresh() }), /nothing to migrate/)

  const { first, second } = versions()
  const root = await projectAt(first)
  writeFileSync(join(second, 'tools/harness.mjs'), 'console.error("boom"); process.exit(3)\n')
  const result = await harness(root, ['sync', '--from', second])
  assert.equal(result.code, 1)
  assert.match(
    result.output,
    /`harness migrate` of the new version failed \(exit 3\)[^]*boom[^]*run `node harness\/tools\/harness\.mjs migrate`/
  )
  assert.equal(readLock(root).version, '1.1.0', 'the files and the lock are in place')
})
