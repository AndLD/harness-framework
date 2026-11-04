// The backlog (task 3.20): the queue of the feature requests, which is the issue queue's module read with another kind: its items and their `Source:`, the two
// indexes, the archive, the line in the plan index, the numbers an item took over from the issue queue, and what the triage of reports and the session start
// say about it.
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { sessionStartMessage } from '../runtime-hooks/session-start.mjs'
import { BACKLOG, nextIssueNumber, parseIssueFile, readQueue } from './issue-queue.mjs'
import { planSummary, readBacklogOf } from './plan.mjs'
import { candidates, recordedReports, triagePlan } from './reports.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

const itemFile = (
  id,
  title,
  { status = '⬜', agent = 'C2', size = 3, area = 'procedures', source = 'owner', formerly } = {}
) =>
  `[← Backlog](./README.md)\n\n# ${id} — ${title}\n\n**Status:** ${status} · **Agent:** ${agent} · **Size:** ${size} SP · **Area:** ${area} · **Source:** ${source}` +
  `${formerly ? ` · **Formerly:** ${formerly}` : ''}\n\nWhat ${id} is.\n`

const issueFile = (id, title) =>
  `[← Issue queue](./README.md)\n\n# ${id} — ${title}\n\n**Status:** ⬜ · **Agent:** C1 · **Size:** 2 SP · **Area:** procedures · **Reported:** —\n\nWhat ${id} is.\n`

test('a backlog item says where it came from, and a source that is none of the three is a problem', () => {
  const report = parseIssueFile(
    'B-1.md',
    itemFile('B-1', 'A switch', {
      source: 'report — [GitHub issue 65](https://h/65), [GitHub issue 70](https://h/70)',
      formerly: 'I-6'
    }),
    BACKLOG
  )
  assert.deepEqual(report.problems, [])
  assert.equal(report.id, 'B-1')
  assert.equal(report.formerly, 'I-6')
  assert.match(report.reported, /^report — /)
  for (const source of ['owner', 'agent']) {
    assert.deepEqual(parseIssueFile('B-2.md', itemFile('B-2', 'x', { source }), BACKLOG).problems, [])
  }
  const bad = parseIssueFile('B-3.md', itemFile('B-3', 'x', { source: 'a friend' }), BACKLOG)
  assert.match(bad.problems.join('\n'), /the source "a friend" must start with one of report, owner, agent/)
  const none = parseIssueFile(
    'B-4.md',
    '# B-4 — x\n\n**Status:** ⬜ · **Size:** 1 SP · **Area:** procedures\n',
    BACKLOG
  )
  assert.match(none.problems.join('\n'), /\*\*Source:\*\*/)
  assert.doesNotMatch(none.problems.join('\n'), /Reported/)
  // An issue file is not a backlog item, and the other way round
  assert.match(
    parseIssueFile('I-1.md', itemFile('B-1', 'x'), undefined).problems.join('\n'),
    /title must read "# I-<n>/
  )
})

function project() {
  const root = mkdtempSync(join(tmpdir(), 'backlog-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const read = (path) => readFileSync(join(root, path), 'utf8')
  const profile = {
    paths: {
      phases: 'plan/phases',
      planIndex: 'plan/README.md',
      issues: 'plan/issues',
      backlog: 'plan/backlog',
      frameworkDir: '.'
    },
    plan: { complexity: { scale: { C1: 'a', C2: 'b' } } }
  }
  write('migrations/areas.json', JSON.stringify({ areas: { procedures: [], 'plan format': [] } }))
  write(
    'plan/README.md',
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n<!-- plan-issues:start -->\n<!-- plan-issues:end -->\n\n<!-- plan-backlog:start -->\n<!-- plan-backlog:end -->\n\n**Order of development**\n\n| Release | Tasks, in order |\n| - | - |\n| `1.0.0` | 5.1, B-1, I-6 |\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  )
  write(
    'plan/phases/phase-5-five.md',
    '# Phase 5 — Five (1 SP)\n\n**Status:** ✅ Done\n\n**Execution order:** 5.1.\n\n| # | Task | Agent | SP | Status |\n| - | - | - | - | - |\n| 5.1 | x | C1 | 1 | ✅ |\n'
  )
  write('plan/issues/README.md', '# Issue queue\n\n<!-- issue-queue:start -->\n<!-- issue-queue:end -->\n')
  write('plan/backlog/README.md', '# Backlog\n\n<!-- backlog:start -->\n<!-- backlog:end -->\n')
  write('plan/backlog/archived/README.md', '# Archived\n\n<!-- backlog:start -->\n<!-- backlog:end -->\n')
  write(
    'plan/backlog/B-1.md',
    itemFile('B-1', 'A switch', { source: 'report — [GitHub issue 65](https://h/issues/65)', formerly: 'I-6' })
  )
  write('plan/backlog/B-2.md', itemFile('B-2', 'Another', { agent: 'C1', size: 1, source: 'agent' }))
  return { root, profile, write, read }
}

test('plan summary writes the index of the backlog with its Source column, shows it in the plan index apart from the phases, and check holds it', () => {
  const { root, profile, read } = project()
  assert.match(
    planSummary({ root, profile, check: true }).problems.join('\n'),
    /the item table disagrees with the item files/
  )
  assert.deepEqual(planSummary({ root, profile }).problems, [])
  const index = read('plan/backlog/README.md')
  assert.match(index, /\| Item \| Title \| Area \| Agent \| SP \| Status \| Source \|/)
  assert.match(
    index,
    /\| \[B-1\]\(\.\/B-1\.md\) \| A switch \| procedures \| C2 \| 3 \| ⬜ \| report — \[GitHub issue 65\]\(https:\/\/h\/issues\/65\) \|/
  )
  assert.match(index, /\| \[B-2\]\(\.\/B-2\.md\) \| Another \| procedures \| C1 \| 1 \| ⬜ \| agent \|/)
  assert.match(
    read('plan/README.md'),
    /\*\*Backlog\*\* \(not a phase; its size is not in the totals above\): \[2 open\]\(\.\/backlog\/README\.md\), 4 SP; 0 archived\./
  )
  assert.deepEqual(planSummary({ root, profile, check: true }).problems, [])
  // The issue queue is untouched by the backlog
  assert.doesNotMatch(read('plan/issues/README.md'), /B-1/)
})

test('an item that is done is archived with the back-link of the backlog archive, and the order may name an item and the issue it came from', () => {
  const { root, profile, write, read } = project()
  planSummary({ root, profile })
  write('plan/backlog/B-2.md', itemFile('B-2', 'Another', { agent: 'C1', size: 1, source: 'agent', status: '✅' }))
  planSummary({ root, profile })
  assert.ok(!existsSync(join(root, 'plan/backlog/B-2.md')))
  assert.match(read('plan/backlog/archived/B-2.md'), /^\[← Archived backlog items\]\(\.\/README\.md\)/)
  assert.match(
    read('plan/backlog/archived/README.md'),
    /\| Item \| Title \| Area \| SP \| Source \|\n\| ---- \| ----- \| ---- \| -- \| ------ \|\n\| \[B-2\]\(\.\/B-2\.md\) \| Another \| procedures \| 1 \| agent \|/
  )
  assert.match(read('plan/README.md'), /\[1 open\]\(\.\/backlog\/README\.md\), 3 SP; 1 archived\./)
  // `5.1, B-1, I-6` in the order: B-1 exists, and I-6 is the id B-1 took over
  assert.deepEqual(planSummary({ root, profile, check: true }).problems, [])
  write('plan/README.md', read('plan/README.md').replace('B-1, I-6', 'B-1, B-9'))
  assert.match(
    planSummary({ root, profile, check: true }).problems.join('\n'),
    /names task B-9, which exists in no phase/
  )
})

test('a number that left the issue queue is never given again', () => {
  const { root, profile, write } = project()
  planSummary({ root, profile })
  assert.deepEqual(planSummary({ root, profile, check: true }).problems, [])
  write('plan/issues/I-6.md', issueFile('I-6', 'Reused'))
  const problems = planSummary({ root, profile, check: true }).problems.join('\n')
  assert.match(
    problems,
    /I-6\.md: the id I-6 moved to the backlog \(a backlog item says "Formerly: I-6"\) and is never reused/
  )

  const issues = readQueue({
    dir: 'plan/issues',
    list: (path) => (path === 'plan/issues' ? ['README.md', 'I-1.md'] : []),
    readText: (path) => (path.endsWith('I-1.md') ? issueFile('I-1', 'One') : '')
  })
  assert.equal(nextIssueNumber(issues), 2)
  assert.equal(nextIssueNumber(issues, ['I-6']), 7)
  const backlog = readBacklogOf(root, profile)
  assert.equal(backlog.kind, BACKLOG)
  assert.equal(nextIssueNumber(backlog), 3)
})

test('a project without the role has no backlog', () => {
  const { root, profile } = project()
  assert.equal(readBacklogOf(root, { paths: { ...profile.paths, backlog: undefined } }), null)
})

test('a feature request is a backlog item: the triage plan says so, the candidates include the backlog, and a report in an item’s Source is triaged', () => {
  const steps = triagePlan({ relation: 'feature' }).steps.join('\n')
  assert.match(steps, /add a new item to the backlog/)
  assert.match(steps, /Source: report/)
  const held = triagePlan({ relation: 'feature', candidate: { id: 'B-1', where: 'open' } }).steps.join('\n')
  assert.match(held, /add the report to the `Source:` of the backlog item B-1/)
  assert.throws(
    () => triagePlan({ relation: 'wish' }),
    /the relation is one of same, close, different, not-a-defect, feature/
  )

  const { root, profile } = project()
  const backlog = readBacklogOf(root, profile)
  const found = candidates({
    report: { title: 'A switch for the procedures of a migration', body: '' },
    backlog
  })
  assert.equal(found[0].id, 'B-1')
  assert.equal(found[0].where, 'open')
  assert.deepEqual([...recordedReports({ backlog })], [65])
  assert.deepEqual([...recordedReports({})], [])
})

test('the session start says how many items the backlog holds and that none is built unasked; a project without one gets no line', () => {
  const files = { 'plan/backlog/README.md': '', 'plan/backlog/B-1.md': '', 'plan/backlog/B-2.md': '' }
  const list = (path) => (path === 'plan/backlog' ? ['README.md', 'B-1.md', 'B-2.md'] : [])
  const message = sessionStartMessage(
    'main',
    (path) => files[path] ?? '',
    list,
    'plan/phases',
    'm',
    null,
    null,
    [],
    'plan/backlog'
  )
  assert.match(
    message,
    /Backlog: 2 open item\(s\) \(plan\/backlog\/README\.md\); an item is built only when the owner puts it into a release/
  )
  assert.doesNotMatch(
    sessionStartMessage(
      'main',
      () => '',
      () => [],
      'plan/phases'
    ),
    /Backlog/
  )
})

test('a project that names the role after its plan exists gets the folder, its two indexes and the block of the plan index from plan summary, once', () => {
  const { root, profile, write, read } = project()
  const FRAMEWORK = new URL('../..', import.meta.url).pathname
  for (const name of ['backlog-queue.md', 'backlog-archive.md']) {
    write(`core/templates/scaffold/${name}`, readFileSync(join(FRAMEWORK, 'core/templates/scaffold', name), 'utf8'))
  }
  rmSync(join(root, 'plan/backlog'), { recursive: true })
  write(
    'plan/README.md',
    read('plan/README.md').replace(/<!-- plan-backlog:start -->\n<!-- plan-backlog:end -->\n\n/, '')
  )
  write('plan/README.md', read('plan/README.md').replace('5.1, B-1, I-6', '5.1'))
  const bare = { ...profile, paths: { ...profile.paths, backlog: undefined } }
  assert.equal(planSummary({ root, profile: bare }).message, 'Wrote the plan summary of 1 phases.')
  assert.ok(!existsSync(join(root, 'plan/backlog')), 'no role, no backlog')

  const named = { ...profile, paths: { ...profile.paths, backlog: 'plan/backlog', issues: 'plan/issues' } }
  assert.deepEqual(planSummary({ root, profile: named, check: true }).problems, [])
  const { message, problems } = planSummary({ root, profile: named })
  assert.match(
    message,
    /Set up the backlog: created plan\/backlog\/README\.md, plan\/backlog\/archived\/README\.md, the block of the backlog in plan\/README\.md\./
  )
  assert.deepEqual(problems, [])
  assert.match(read('plan/backlog/README.md'), /^\[← Development plan\]\(\.\.\/README\.md\)\n\n# Backlog/)
  assert.match(read('plan/backlog/archived/README.md'), /^\[← Backlog\]\(\.\.\/README\.md\)/)
  assert.match(read('plan/README.md'), /<!-- plan-issues:end -->\n\n<!-- plan-backlog:start -->\n\*\*Backlog\*\*/)
  assert.deepEqual(planSummary({ root, profile: named, check: true }).problems, [])
  assert.equal(
    planSummary({ root, profile: named }).message,
    'Wrote the plan summary of 1 phases.',
    'the second run creates nothing'
  )
})
