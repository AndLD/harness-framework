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

// A project of an older version takes `source` with its own tools. The sync of an old version cannot start the migration: the project runs it itself. A
// sync of an old version that stopped on a rule the old tools could not render (a role added since) left the new tools in `harness/`; the sync is then
// taken again with them.
function takeTree(root, source) {
  const projectTools = join(root, 'harness/tools/harness.mjs')
  const oldSync = node(projectTools, ['sync', '--from', source, '--root', root])
  const next = node(
    projectTools,
    oldSync.status === 0 ? ['migrate', '--root', root] : ['sync', '--from', source, '--root', root]
  )
  return { oldSync, next, projectTools }
}

for (const tag of TAGS) {
  test(`a project bootstrapped from ${tag} takes the current tree, migrates, passes check all, and rolls back to an empty diff`, () => {
    const root = bootstrapFrom(tag)
    // A version is taken on a branch of its own, and the migration is one commit on the commit it starts from
    projectGit(root, 'checkout', '-q', '-b', 'chore/take-version')
    const start = projectGit(root, 'rev-parse', 'HEAD')
    const { dir: current, version } = currentTree()
    const { oldSync, next, projectTools } = takeTree(root, current)
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

// The consumer fixture of Phase 6 (task 6.8): what the context optimization gives a project, and that a project that does nothing keeps working.
// The quiet roles of the profile, the report schema and the flow default are the ones the phase added to the tools a project holds in `harness/`.
const QUIET = ['lintQuiet', 'typecheckQuiet', 'formatQuiet', 'testQuiet', 'testCoverageQuiet']
const QUIET_LINE = /^harness check all: \d+ checks passed$/
const REPORT = `Status: done, fixture
Merged: none
Decisions: none
Deviations: none
Next step: none
Recommendations
- none
`
const readJson = (root, path) => JSON.parse(readFileSync(join(root, path), 'utf8'))
const skill = (root, name) => readFileSync(join(root, '.claude/skills', name, 'SKILL.md'), 'utf8')

// A project of the last release, with the profile it holds before the take (`edit` changes it, as a migration note tells a project to), takes this tree
function takeOfLastRelease(edit) {
  const root = bootstrapFrom(TAGS.at(-1))
  projectGit(root, 'checkout', '-q', '-b', 'chore/take-version')
  if (edit) {
    const file = join(root, 'harness-profile.json')
    writeFileSync(file, `${JSON.stringify(edit(JSON.parse(readFileSync(file, 'utf8'))), null, 2)}\n`)
    projectGit(root, 'commit', '-q', '-am', 'chore: set the quiet commands')
  }
  const { dir, version } = currentTree()
  const { next, projectTools } = takeTree(root, dir)
  assert.equal(next.status, 0, next.stdout + next.stderr)
  assert.equal(readLock(root).version, version)
  return { root, projectTools }
}

// What a project holds of the phase, whichever way it got it: the quiet check, the report schema and the flow default of its own tools
async function assertPhaseReached({ root, tools }) {
  const quiet = node(tools, ['check', 'all', '--root', root])
  assert.equal(quiet.status, 0, quiet.stdout + quiet.stderr)
  assert.match(quiet.stdout.trim(), QUIET_LINE, 'check all prints one line on a pass')
  const verbose = node(tools, ['check', 'all', '--verbose', '--root', root])
  assert.ok(verbose.stdout.split('\n').length > 1, '--verbose gives the full output back')

  for (const file of ['output', 'quiet-commands', 'step-report', 'flow-audit']) {
    assert.ok(existsSync(join(root, `harness/tools/lib/${file}.mjs`)), `${file}.mjs reached the project`)
  }
  assert.match(readFileSync(join(root, 'harness/core/method/method.md'), 'utf8'), /^## 8\. Output budgets/m)
  assert.match(
    skill(root, 'start-task'),
    /subagent that returns a summary of a few lines/,
    'the delegate rule reached the skills'
  )

  const report = join(fresh(), 'report.md')
  writeFileSync(report, REPORT)
  const checked = node(tools, ['flow', 'report-check', report])
  assert.equal(checked.status, 0, checked.stdout + checked.stderr)
  writeFileSync(report, 'Status: done\n')
  assert.notEqual(node(tools, ['flow', 'report-check', report]).status, 0, 'a report without the schema is refused')

  // A flow that sets nothing gets the orchestrator's restart threshold of the tools; the flow template a project copies carries the setting
  const { FLOW_DEFAULTS } = await import(join(root, 'harness/tools/lib/flows.mjs'))
  assert.equal(FLOW_DEFAULTS.orchestratorLimits.context, 50)
  assert.match(readFileSync(join(root, 'harness/core/plan/flow-template.md'), 'utf8'), /"orchestratorLimits"/)
}

test('a project of the last release that does nothing takes Phase 6 and keeps working on the plain commands', async () => {
  const { root, projectTools } = takeOfLastRelease()
  const profile = readJson(root, 'harness-profile.json')
  for (const role of QUIET) assert.equal(profile.commands[role], undefined, `the take sets no ${role} for the project`)
  // The procedures cite the quiet variant by role; a project that has none gets the plain command, not a lost line
  const text = skill(root, 'open-pull-request')
  assert.ok(text.includes(`\`${profile.commands.lint}\``), 'the skill cites the plain lint command')
  assert.ok(!text.includes('--silent'))
  await assertPhaseReached({ root, tools: projectTools })
})

test('a project of the last release that sets the quiet commands as the note says gets them in its procedures', async () => {
  const stack = readJson(FRAMEWORK_DIR, 'adapters/stack/node-ts/manifest.json').defaults.commands
  const quiet = Object.fromEntries(QUIET.filter((role) => stack[role]).map((role) => [role, stack[role]]))
  assert.ok(Object.keys(quiet).length > 0, 'the node-ts preset gives quiet commands')
  const { root, projectTools } = takeOfLastRelease((profile) => ({
    ...profile,
    commands: { ...profile.commands, ...quiet }
  }))
  assert.ok(
    skill(root, 'open-pull-request').includes(`\`${quiet.lintQuiet}\``),
    'the skill cites the quiet lint command'
  )
  await assertPhaseReached({ root, tools: projectTools })
})

for (const stack of ['node-ts', 'python']) {
  test(`a new ${stack} project from this tree has the quiet commands, the quiet hooks and the phase`, async () => {
    const { dir } = currentTree()
    const root = fresh()
    const init = node(join(dir, 'tools/harness.mjs'), [
      'init',
      '--non-interactive',
      '--name',
      'acme',
      '--repository',
      'acme/shop',
      '--stack',
      stack,
      '--runtime',
      'claude-code',
      '--from',
      dir,
      '--no-host-setup',
      '--root',
      root
    ])
    assert.equal(init.status, 0, init.stdout + init.stderr)
    const defaults = readJson(FRAMEWORK_DIR, `adapters/stack/${stack}/manifest.json`).defaults.commands
    const profile = readJson(root, 'harness-profile.json')
    const given = QUIET.filter((role) => defaults[role])
    assert.ok(given.length > 0, `the ${stack} preset gives quiet commands`)
    for (const role of given) assert.equal(profile.commands[role], defaults[role], `init sets ${role}`)
    assert.ok(
      skill(root, 'open-pull-request').includes(`\`${defaults.lintQuiet}\``),
      'the skill cites the quiet lint command'
    )
    await assertPhaseReached({ root, tools: join(root, 'harness/tools/harness.mjs') })
  })
}
