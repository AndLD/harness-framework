// The migration test (task 3.12): a project bootstrapped from each released tag takes the current tree of this repository and migrates, and
// `check all` passes on it, with the tools the project holds. The tags are exported from the Git history, so a clone without its tags cannot run it.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { FRAMEWORK_DIR } from '../../tools/lib/bootstrap.mjs'
import { readLock } from '../../tools/lib/lock.mjs'
import { compareVersions } from '../../tools/lib/versions.mjs'

const dirs = []
// The real path of a new folder: the tools of 0.1.0 and 0.1.1 do nothing when started through a link (task 3.3), and a temporary folder is one on macOS
const fresh = () => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'migration-')))
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

const git = (...args) =>
  execFileSync('git', args, { cwd: FRAMEWORK_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const node = (tools, args) => spawnSync(process.execPath, [tools, ...args], { encoding: 'utf8' })

const TAGS = git('tag', '--list', 'v[0-9]*.[0-9]*.[0-9]*')
  .split('\n')
  .filter(Boolean)
  .sort((a, b) => compareVersions(a, b))

// The framework as it is at a tag, exported from the history
function exportTag(tag) {
  const dir = fresh()
  const archive = execFileSync('git', ['archive', tag], { cwd: FRAMEWORK_DIR, maxBuffer: 256 * 1024 * 1024 })
  execFileSync('tar', ['-x', '-C', dir], { input: archive })
  return dir
}

// The tree of this repository as a project would receive it, one minor version after the newest tag, so that the migration scripts of the version
// being prepared apply
function currentTree() {
  const manifest = JSON.parse(readFileSync(join(FRAMEWORK_DIR, 'framework.json'), 'utf8'))
  const [major, minor] = manifest.version.split('.')
  const dir = fresh()
  for (const path of manifest.distributable) {
    cpSync(join(FRAMEWORK_DIR, path), join(dir, path), { recursive: true })
  }
  const version = `${major}.${Number(minor) + 1}.0`
  writeFileSync(join(dir, 'framework.json'), JSON.stringify({ ...manifest, version }, null, 2))
  return { dir, version }
}

test('the tags of the released versions are present', () => {
  assert.ok(
    TAGS.length >= 3,
    `expected the tags of 0.1.0 and later, found ${TAGS.join(', ') || 'none'}; fetch the tags (git fetch --tags)`
  )
})

for (const tag of TAGS) {
  test(`a project bootstrapped from ${tag} takes the current tree, migrates, and passes check all`, () => {
    const old = exportTag(tag)
    const root = fresh()
    const oldTools = join(old, 'tools/harness.mjs')
    // The flag exists from 0.1.2 on; before it the bootstrap never asked the host
    const noHostSetup = readFileSync(oldTools, 'utf8').includes('--no-host-setup') ? ['--no-host-setup'] : []
    const init = node(oldTools, [
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
      old,
      ...noHostSetup,
      '--root',
      root
    ])
    assert.equal(init.status, 0, init.stdout + init.stderr)

    const { dir: current, version } = currentTree()
    const projectTools = join(root, 'harness/tools/harness.mjs')
    const oldSync = node(projectTools, ['sync', '--from', current, '--root', root])
    // The sync of an old version cannot start the migration: the project runs it itself. A sync of an old version that stopped on a rule the old
    // tools could not render (a role added since) left the new tools in `harness/`; the sync is then taken again with them.
    const next = node(
      projectTools,
      oldSync.status === 0 ? ['migrate', '--root', root] : ['sync', '--from', current, '--root', root]
    )
    assert.equal(next.status, 0, `${oldSync.stderr}\n${next.stdout}${next.stderr}`)

    assert.equal(readLock(root).version, version)
    const checked = node(projectTools, ['check', 'all', '--root', root])
    assert.equal(checked.status, 0, checked.stdout + checked.stderr)
  })
}
