// The migration test (task 3.12): a project bootstrapped from each released tag takes the current tree of this repository and migrates, and
// `check all` passes on it, with the tools the project holds. The tags are exported from the Git history, so a clone without its tags cannot run it.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs'
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
const projectGit = (root, ...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
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

// A project bootstrapped from the tag with the tools of that tag
function bootstrapFrom(tag) {
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
  return root
}

for (const tag of TAGS) {
  test(`a project bootstrapped from ${tag} takes the current tree, migrates, passes check all, and rolls back to an empty diff`, () => {
    const root = bootstrapFrom(tag)
    // A version is taken on a branch of its own, and the migration is one commit on the commit it starts from
    projectGit(root, 'checkout', '-q', '-b', 'chore/take-version')
    const start = projectGit(root, 'rev-parse', 'HEAD')
    const { dir: current, version } = currentTree()
    const projectTools = join(root, 'harness/tools/harness.mjs')
    const oldSync = node(projectTools, ['sync', '--from', current, '--root', root])
    // The sync of an old version cannot start the migration: the project runs it itself. A sync of an old version that stopped on a rule the old
    // tools could not render (a role added since) left the new tools in `harness/`; the sync is then taken again with them.
    const next = node(
      projectTools,
      oldSync.status === 0 ? ['migrate', '--root', root] : ['sync', '--from', current, '--root', root]
    )
    assert.equal(
      next.status,
      0,
      `bootstrapped from ${tag}, taking ${version} (a tag newer than this tree's version is a downgrade; run the tests from a branch at the release):\n${oldSync.stderr}\n${next.stdout}${next.stderr}`
    )

    assert.equal(readLock(root).version, version)
    // The script of 0.2.0 runs for a project that starts before 0.2.0: it split the open phase the scaffold made into a folder, made the open-ended
    // phase a normal one and gave the project its issue queue. A project bootstrapped from 0.2.0 or later has them from its scaffold, and no script applies.
    if (compareVersions(tag, '0.2.0') < 0) {
      const phases = join(root, 'docs/development-plan/phases')
      assert.ok(
        readdirSync(phases).some(
          (name) => /^phase-\d+-issues$/.test(name) && existsSync(join(phases, name, 'README.md'))
        )
      )
      assert.ok(!readdirSync(phases).some((name) => /^phase-\d+-issues\.md$/.test(name)))
      assert.ok(existsSync(join(root, 'docs/development-plan/issues/README.md')))
      // The procedures whose switch is off carry no skill, though a sync by the old tools wrote them
      assert.ok(
        !existsSync(join(root, '.claude/skills/triage-reports')) &&
          !existsSync(join(root, '.claude/skills/report-upstream'))
      )
      const profile = JSON.parse(readFileSync(join(root, 'harness-profile.json'), 'utf8'))
      assert.equal(profile.plan.openEndedPhaseNumber, undefined)
      assert.equal(profile.paths.issues, 'docs/development-plan/issues')
    }
    const checked = node(projectTools, ['check', 'all', '--root', root])
    assert.equal(checked.status, 0, checked.stdout + checked.stderr)

    // Rollback gives back exactly the project that was bootstrapped
    const undone = node(projectTools, ['rollback', '--root', root])
    assert.equal(undone.status, 0, undone.stdout + undone.stderr)
    assert.equal(projectGit(root, 'diff', start, '--stat'), '', 'no file differs from the starting commit')
    assert.equal(projectGit(root, 'ls-files', '--others', '--exclude-standard'), '', 'no added file is left over')
  })
}

// The current tree as the version `version`, with the migration notes of a line of development: one per development version and the final one
function developmentTree(version, notes) {
  const { dir } = currentTree()
  const manifest = JSON.parse(readFileSync(join(dir, 'framework.json'), 'utf8'))
  writeFileSync(join(dir, 'framework.json'), JSON.stringify({ ...manifest, version }, null, 2))
  for (const name of readdirSync(join(dir, 'migrations')).filter((file) => /^\d+\.\d+\.\d+-dev\.\d+\.md$/.test(file))) {
    rmSync(join(dir, 'migrations', name))
  }
  for (const note of notes) {
    writeFileSync(join(dir, 'migrations', `${note}.md`), `# Migration to ${note}\n`)
  }
  return dir
}

const notesRead = (output) => [...output.matchAll(/^Migration note of (\S+) /gm)].map((match) => match[1])

test('a project takes a development version, then the next one, then the final one, and reads the right notes at each step', () => {
  const root = bootstrapFrom(TAGS.at(-1))
  const { version } = currentTree()
  const tools = join(root, 'harness/tools/harness.mjs')
  projectGit(root, 'checkout', '-q', '-b', 'chore/take-version')
  const take = (target, notes) => {
    const source = developmentTree(target, notes)
    // The first jump leaves the old tools in place for the sync, and the project then migrates with the new ones
    const synced = node(tools, ['sync', '--from', source, '--root', root])
    const result =
      synced.status === 0
        ? node(tools, ['migrate', '--root', root])
        : node(tools, ['sync', '--from', source, '--root', root])
    assert.equal(result.status, 0, `${synced.stderr}\n${result.stdout}${result.stderr}`)
    assert.equal(readLock(root).version, target)
    const checked = node(tools, ['check', 'all', '--root', root])
    assert.equal(checked.status, 0, checked.stdout + checked.stderr)
    return `${synced.stdout}${result.stdout}`
  }
  const dev1 = `${version}-dev.1`
  const dev2 = `${version}-dev.2`

  assert.deepEqual(
    notesRead(take(dev1, [dev1])).filter((note) => note.startsWith(version)),
    [dev1]
  )
  assert.deepEqual(notesRead(take(dev2, [dev1, dev2])), [dev2], 'the second development version adds only its own note')
  assert.deepEqual(
    notesRead(take(version, [dev1, dev2, version])),
    [version],
    'the final note replaces the development notes'
  )
})
