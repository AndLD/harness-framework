// The release order in a file of its own (task 5.1): the reading of the file, the next task from it, the check of the plan (a backlog item and an id that exists
// nowhere are refused), the block of the plan index, the session start, and the migration that moves the section of the index into the file.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import migration from '../../migrations/0.3.0.mjs'
import { sessionStartMessage } from '../runtime-hooks/session-start.mjs'
import { nextTask, readPhases } from './next-task.mjs'
import { planSummary } from './plan.mjs'
import { orderSection, profileWithReleases } from './releases-migration.mjs'
import { currentAndNext, readReleases, releaseOrder, releasesFile, releasesLine } from './releases.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

const RELEASES = `[← Development plan index](./README.md)

# Releases of a project

| Release | Status | Tasks, in order | Consumers | Notes |
| ------- | ------ | --------------- | --------- | ----- |
| \`0.1.0\` | ✅ | 1.1, 1.2 | the first project | B-1 is only mentioned here, and 9.9 too |
| \`0.2.0-dev.1\` | 🏷 | 2.1 | takes it | |
| \`0.2.0\` | 🟡 | Phase 3, I-1 | | |
| \`0.3.0\` | ⬜ | 2.2 | | |

## Not scheduled

- 2.3: waits for a decision
`

test('the file is read by the names of its columns: rows, statuses, the order of the tasks and the list of what is not scheduled', () => {
  const { rows, notScheduled, problems } = readReleases(RELEASES)
  assert.deepEqual(problems, [])
  assert.deepEqual(
    rows.map((row) => [row.release, row.status]),
    [
      ['`0.1.0`', '✅'],
      ['`0.2.0-dev.1`', '🏷'],
      ['`0.2.0`', '🟡'],
      ['`0.3.0`', '⬜']
    ]
  )
  // Only the column of the tasks is ordered: not the notes, and not the version of a release
  assert.deepEqual(releaseOrder(RELEASES), ['1.1', '1.2', '2.1', { phase: 3 }, 'I-1', '2.2'])
  assert.deepEqual(notScheduled, ['2.3'])
})

test('a table without a status or a tasks column, a row without a status and a file without a table are problems', () => {
  assert.deepEqual(readReleases('# x\n').problems, ['has no table whose first column is "Release"'])
  assert.deepEqual(readReleases('| Release | Consumers |\n| - | - |\n| 1 | x |\n').problems, [
    'its table has no column "Status"',
    'its table has no column "Tasks, in order"'
  ])
  assert.deepEqual(readReleases('| Release | Status | Tasks |\n| - | - | - |\n| `1.0.0` | soon | 1.1 |\n').problems, [
    'the release `1.0.0` has no status: one of ⬜ 🟡 🏷 ✅ in the column "Status"'
  ])
})

test('the current release is the one being developed, the next the first one planned after it, and the line of the index says both with the link', () => {
  const { rows } = readReleases(RELEASES)
  const { current, next } = currentAndNext(rows)
  assert.equal(current.release, '`0.2.0-dev.1`')
  assert.equal(next.release, '`0.3.0`')
  assert.equal(
    releasesLine(rows, './releases.md'),
    'Current release: `0.2.0-dev.1` (🏷 a development version cut). Next: `0.3.0` (⬜ planned). The order of the releases and of their tasks: [releases](./releases.md).'
  )
  assert.match(
    releasesLine(rows.slice(0, 1), './r.md'),
    /^No release is being developed\. No release is planned after it\./
  )
})

const phase = (number, tasks, order = null) => ({
  file: `phases/phase-${number}.md`,
  text: `# Phase ${number} — x\n\n**Status:** 🟡\n\n${order ? `**Execution order:** ${order}\n\n` : ''}`,
  tasks: tasks.map(([id, status]) => ({ id, title: `Task ${id}`, status }))
})

test('the next task follows the releases file when the plan has one, and the section of the index when it has not', () => {
  const phases = readPhases([
    phase(1, [
      ['1.1', '⬜'],
      ['1.2', '⬜']
    ]),
    phase(2, [['2.1', '⬜']])
  ])
  const releasesText = '| Release | Status | Tasks, in order |\n| - | - | - |\n| `1.0.0` | ⬜ | 2.1, 1.2 |\n'
  assert.deepEqual(nextTask({ phases, releasesText }), {
    id: '2.1',
    title: 'Task 2.1',
    file: 'phases/phase-2.md',
    source: 'release order'
  })
  // The file wins over a section the index still has
  const indexText = '**Order of development**\n\n| Release | Tasks |\n| - | - |\n| `1.0.0` | 1.1 |\n\n---\n'
  assert.equal(nextTask({ phases, indexText, releasesText }).id, '2.1')
  assert.equal(nextTask({ phases, indexText }).id, '1.1')
  assert.equal(nextTask({ phases, indexText }).source, 'order of development')
})

test('a phase whose execution order points to the release order takes the order of the file for its tasks', () => {
  const phases = readPhases([
    phase(
      1,
      [
        ['1.1', '⬜'],
        ['1.2', '⬜']
      ],
      'when the release order in releases.md says.'
    )
  ])
  assert.equal(phases[0].points, true)
  assert.equal(
    nextTask({ phases, releasesText: '| Release | Status | Tasks |\n| - | - | - |\n| `1` | ⬜ | 1.2 |\n' }).id,
    '1.2'
  )
})

const PHASE_5 =
  '# Phase 5 — Five (1 SP)\n\n**Status:** ✅ Done\n\n**Execution order:** 5.1.\n\n| # | Task | Agent | SP | Status |\n| - | - | - | - | - |\n| 5.1 | x | C1 | 1 | ✅ |\n'

function project({ index, withRole = true, releases = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'releases-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const read = (path) => readFileSync(join(root, path), 'utf8')
  const profile = {
    project: { title: 'Demo' },
    paths: {
      plan: 'plan',
      phases: 'plan/phases',
      planIndex: 'plan/README.md',
      profileFile: 'harness-profile.json',
      ...(withRole ? { releases: 'plan/releases.md' } : {}),
      frameworkDir: '.'
    }
  }
  write(
    'harness-profile.json',
    `{\n  "paths": {\n    "planIndex": "plan/README.md",\n    "phases": "plan/phases"\n  }\n}\n`
  )
  write(
    'plan/README.md',
    index ??
      '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n<!-- plan-releases:start -->\n<!-- plan-releases:end -->\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  )
  write('plan/phases/phase-5-five.md', PHASE_5)
  if (releases !== null) {
    write('plan/releases.md', releases)
  }
  return { root, profile, write, read }
}

test('plan summary writes the current and the next release into the block of the index, the check holds it, and a release order that is not readable is a problem', () => {
  const { root, profile, write, read } = project({
    releases: '| Release | Status | Tasks, in order |\n| - | - | - |\n| `1.0.0` | 🟡 | 5.1 |\n| `1.1.0` | ⬜ | 5.1 |\n'
  })
  assert.match(planSummary({ root, profile, check: true }).problems.join('\n'), /the summary or the contents disagree/)
  assert.deepEqual(planSummary({ root, profile }).problems, [])
  assert.match(
    read('plan/README.md'),
    /Current release: `1\.0\.0` \(🟡 developing\)\. Next: `1\.1\.0` \(⬜ planned\)\. The order of the releases and of their tasks: \[releases\]\(\.\/releases\.md\)\./
  )
  assert.deepEqual(planSummary({ root, profile, check: true }).problems, [])
  write('plan/releases.md', '# nothing\n')
  assert.match(
    planSummary({ root, profile, check: true }).problems.join('\n'),
    /plan\/releases\.md: has no table whose first column is "Release"/
  )
})

test('the check refuses a backlog item, a task that exists nowhere and a phase that does not exist in the release order, and one in the list of what is not scheduled', () => {
  const row = (tasks) => `| Release | Status | Tasks, in order |\n| - | - | - |\n| \`1.0.0\` | ⬜ | ${tasks} |\n`
  const { root, profile, write } = project({ releases: row('5.1') })
  mkdirSync(join(root, 'plan/backlog'), { recursive: true })
  profile.paths.backlog = 'plan/backlog'
  write('plan/backlog/README.md', '# Backlog\n\n<!-- backlog:start -->\n<!-- backlog:end -->\n')
  write('plan/backlog/archived/README.md', '# Archived\n\n<!-- backlog:start -->\n<!-- backlog:end -->\n')
  write(
    'plan/backlog/B-1.md',
    '[← Backlog](./README.md)\n\n# B-1 — A switch\n\n**Status:** Proposed · **Area:** plan format · **Source:** owner\n\nWhat B-1 is.\n'
  )
  write('migrations/areas.json', JSON.stringify({ areas: { 'plan format': [] } }))
  planSummary({ root, profile })
  const problems = () => planSummary({ root, profile, check: true }).problems.join('\n')
  assert.doesNotMatch(problems(), /release order/)
  write('plan/releases.md', row('5.1, B-1'))
  assert.match(
    problems(),
    /plan\/releases\.md: the release order names the backlog item B-1, which is not approved work: the owner promotes it into a task of a phase first/
  )
  write('plan/releases.md', row('5.1, 9.9, Phase 8'))
  assert.match(problems(), /plan\/releases\.md: the release order names task 9\.9, which exists in no phase/)
  assert.match(problems(), /plan\/releases\.md: the release order names Phase 8, which exists in no phase/)
  write('plan/releases.md', `${row('5.1')}\n## Not scheduled\n\n- 7.7: later\n`)
  assert.match(problems(), /the release order names task 7\.7/)
})

test('a section of the index that the file replaces, a block that the index lacks and a file that does not exist are problems; a plan without the role is checked as before', () => {
  const section =
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n**Order of development**\n\n| Release | Tasks |\n| - | - |\n| `1` | 5.1 |\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  const both = project({
    index: section,
    releases: '| Release | Status | Tasks |\n| - | - | - |\n| `1` | ⬜ | 5.1 |\n'
  })
  const found = planSummary({ root: both.root, profile: both.profile, check: true }).problems.join('\n')
  assert.match(
    found,
    /plan\/README\.md: has a section "Order of development", but the order is kept in plan\/releases\.md/
  )
  assert.match(found, /plan\/README\.md: has no <!-- plan-releases:start -->/)
  const missing = project()
  assert.match(
    planSummary({ root: missing.root, profile: missing.profile, check: true }).problems.join('\n'),
    /plan\/releases\.md: the profile names this file as the release order .* but it does not exist/
  )
  const old = project({ index: section, withRole: false })
  assert.deepEqual(planSummary({ root: old.root, profile: old.profile }).problems, [])
})

test('the session start names the next task by the release order when the plan has a releases file', () => {
  const files = {
    'plan/phases/phase-1-one/README.md':
      '# Phase 1 — One (2 SP)\n\n**Status:** ⬜\n\n**Execution order:** the release order.\n',
    'plan/phases/phase-1-one/1.1.md': '# 1.1 — First\n\n**Status:** ⬜ · **Size:** 1 SP\n',
    'plan/phases/phase-1-one/1.2.md': '# 1.2 — Second\n\n**Status:** ⬜ · **Size:** 1 SP\n',
    'plan/README.md': '# Plan\n',
    'plan/releases.md': '| Release | Status | Tasks |\n| - | - | - |\n| `1` | ⬜ | 1.2, 1.1 |\n'
  }
  const readText = (path) => {
    if (!(path in files)) throw new Error(`no ${path}`)
    return files[path]
  }
  const list = (path) => [
    ...new Set(
      Object.keys(files)
        .filter((file) => file.startsWith(`${path}/`))
        .map((file) => file.slice(path.length + 1).split('/')[0])
    )
  ]
  const message = (releasesPath) =>
    sessionStartMessage(
      'develop',
      readText,
      list,
      'plan/phases',
      'the method',
      'plan/README.md',
      null,
      [],
      null,
      releasesPath
    )
  assert.match(message('plan/releases.md'), /Next task: 1\.2 Second .* by the release order/)
  // A file that is missing leaves the order of the phases in charge
  assert.match(message('plan/missing.md'), /Next task: 1\.1 First/)
})

const OLD_INDEX = `# Plan

<!-- plan-summary:start -->
<!-- plan-summary:end -->

**Order of development** (the decision of a day). The framework first.

| Release | Tasks, in order | The first consumer |
| ------- | --------------- | ------------------ |
| \`0.1.0\` | 5.1 | takes it |
| \`0.2.0\` | 5.2 (not built) | |

A note after the table.

---

<!-- plan-contents:start -->
<!-- plan-contents:end -->
`

test('the migration moves the table of the index into the file, sets the role, replaces the section by the block, and a second run changes nothing', () => {
  const { root, profile, read, write } = project({ index: OLD_INDEX, withRole: false })
  write(
    'plan/phases/phase-5-five.md',
    PHASE_5.replace('(1 SP)', '(2 SP)').replace('✅ Done', '🟡 In progress') + '| 5.2 | y | C1 | 1 | ⬜ |\n'
  )
  const before = read('plan/README.md')
  const messages = migration({ root, profile })
  assert.match(
    messages[0],
    /Moved the order of development of plan\/README\.md \(2 release\(s\)\) into plan\/releases\.md/
  )
  assert.match(read('harness-profile.json'), /"planIndex": "plan\/README\.md",\n {4}"releases": "plan\/releases\.md",/)
  const file = read('plan/releases.md')
  assert.match(file, /^\[← Development plan index\]\(\.\/README\.md\)/)
  assert.match(file, /\| `0\.1\.0` \| ✅ \| 5\.1 \| takes it \| {2}\|/)
  assert.match(file, /\| `0\.2\.0` \| ⬜ \| 5\.2 \(not built\) \| {2}\|  \|/)
  assert.match(file, /## Notes\n\n\*\*Order of development\*\* \(the decision of a day\)\. The framework first\./)
  assert.match(file, /A note after the table\./)
  assert.deepEqual(readReleases(file).problems, [])
  const index = read('plan/README.md')
  assert.doesNotMatch(index, /\*\*Order of development\*\*/)
  assert.match(index, /<!-- plan-releases:start -->\nNo release is being developed\. Next: `0\.2\.0` \(⬜ planned\)\./)
  assert.ok(before.length > 0)
  // The tools now read the file, and the plan is whole
  const { profile: after } = { profile: { ...profile, paths: { ...profile.paths, releases: 'plan/releases.md' } } }
  assert.deepEqual(planSummary({ root, profile: after, check: true }).problems, [])
  // A second run: nothing to move
  const snapshot = [read('plan/README.md'), read('plan/releases.md'), read('harness-profile.json')]
  assert.deepEqual(migration({ root, profile: after }), [])
  assert.deepEqual([read('plan/README.md'), read('plan/releases.md'), read('harness-profile.json')], snapshot)
})

test('the migration leaves an order written in prose where it is and says what to do by hand', () => {
  const prose =
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n**Order of development.** Phase 0 → 1 → 2 → 3.\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  const { root, profile, read } = project({ index: prose, withRole: false })
  const files = ['plan/README.md', 'harness-profile.json'].map((path) => read(path))
  const messages = migration({ root, profile })
  assert.equal(messages.length, 1)
  assert.match(
    messages[0],
    /^Required action: plan\/README\.md writes its order of development in prose, which the tools cannot read/
  )
  assert.match(messages[0], /core\/plan\/releases-template\.md in plan\/releases\.md/)
  assert.deepEqual(
    ['plan/README.md', 'harness-profile.json'].map((path) => read(path)),
    files
  )
  assert.deepEqual(migration({ root, profile }), messages)
  // A plan with no such section has nothing to move
  const none = project({ index: '# Plan\n', withRole: false })
  assert.deepEqual(migration({ root: none.root, profile: none.profile }), [])
})

test('the profile file is edited only where it can be done safely, and the section of the index is found by its lines', () => {
  assert.equal(
    profileWithReleases('{\n  "paths": {\n    "planIndex": "a.md"\n  }\n}\n', 'r.md'),
    '{\n  "paths": {\n    "planIndex": "a.md",\n    "releases": "r.md"\n  }\n}\n'
  )
  assert.equal(profileWithReleases('{ "paths": { "planIndex": "a.md" } }', 'r.md'), null)
  const text = profileWithReleases('{\n  "paths": {\n    "releases": "x.md"\n  }\n}\n', 'r.md')
  assert.match(text, /"releases": "x\.md"/)
  assert.deepEqual(orderSection('a\n**Order of development**\nb\n\n---\nc\n'), { from: 1, to: 4 })
  assert.equal(orderSection('nothing\n'), null)
})

test('the file a migration writes has the header of the template of the core', () => {
  const template = readFileSync(new URL('../../core/plan/releases-template.md', import.meta.url), 'utf8')
  const written = releasesFile({ title: 'x', rows: [] })
  for (const line of ['| Release | Status | Tasks, in order | Consumers | Notes |', '## Not scheduled']) {
    assert.ok(template.includes(line) && written.includes(line), line)
  }
})
