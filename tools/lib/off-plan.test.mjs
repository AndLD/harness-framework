// The off-plan record (task 2.5): the reading of a fragment, the table, the pull requests with no record, and the check and the command against a fixture history.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { run } from '../harness.mjs'
import { checkOffPlan, commitsSinceIndex, offPlanTable, parseFragment, readFragments, unrecorded } from './off-plan.mjs'

const REPO = 'https://github.com/o/r'
const DIR = 'docs/off-plan'
const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

const record = (title = 'Fix a typo', fields = {}) =>
  [
    `# ${title}`,
    '',
    `**What changed:** ${fields.what ?? 'one word in the README.'}`,
    `**Why and who asked:** ${fields.why ?? 'the owner saw it.'}`,
    `**What it leaves to do:** ${fields.left ?? 'nothing.'}`,
    ''
  ].join('\n')

test('a fragment is read from its name and its three fields, which may go on over several lines', () => {
  const text =
    '# Move the notes\n\n**What changed:** the notes\nmoved to one folder.\n\n**Why and who asked:** the owner, on 2026-11-07.\n**What it leaves to do:** the links.\n'
  assert.deepEqual(parseFragment('158-move-notes.md', text), {
    pr: 158,
    name: '158-move-notes.md',
    title: 'Move the notes',
    what: 'the notes moved to one folder.',
    why: 'the owner, on 2026-11-07.',
    left: 'the links.'
  })
})

test('a fragment with a wrong name, no title or a missing field is refused with its name and what is wrong', () => {
  assert.throws(
    () => parseFragment('notes.md', record()),
    /notes\.md: an off-plan record is named <pull request number>-<slug>\.md/
  )
  assert.throws(() => parseFragment('1-A_b.md', record()), /is named <pull request number>-<slug>/)
  assert.throws(() => parseFragment('1-a.md', '**What changed:** x\n'), /must start with a title line/)
  assert.throws(
    () => parseFragment('1-a.md', '# T\n\n**What changed:** x\n**Why and who asked:**\n'),
    /1-a\.md: the record needs a text for "Why and who asked", "What it leaves to do"/
  )
})

test('the table lists the records oldest pull request first, links them and escapes a pipe', () => {
  const fragments = [parseFragment('12-b.md', record('Second | pipe')), parseFragment('9-a.md', record('First'))].sort(
    (a, b) => a.pr - b.pr
  )
  const table = offPlanTable(fragments, REPO)
  assert.match(table, /^\| PR \| Change \|/)
  const rows = table.split('\n').slice(2)
  assert.match(rows[0], /^\| \[#9\]\(https:\/\/github\.com\/o\/r\/pull\/9\) \| First \|/)
  assert.match(rows[1], /Second \\\| pipe/)
})

const COMMITS = [
  { subject: 'docs: with a plan line (#5)', body: 'Plan: 2.5\n\nCo-Authored-By: A' },
  { subject: 'docs: recorded (#4)', body: 'Just text' },
  { subject: 'chore: no record (#3)', body: 'Just text' },
  {
    subject: 'chore: a squash with its plan line inside a bullet (#2)',
    body: '* claim\n\nPlan: I-1\n\n---------\n\nCo-authored-by: A'
  },
  { subject: 'Merge pull request #1 from o/chore/x', body: '' },
  { subject: 'chore: no pull request number', body: 'Just text' }
]

test('a merged pull request with no Plan line and no record is listed, oldest first; merge commits and commits with no number are not', () => {
  const fragments = [parseFragment('4-recorded.md', record())]
  assert.deepEqual(unrecorded(COMMITS, fragments), [{ pr: 3, title: 'chore: no record' }])
  assert.deepEqual(
    unrecorded(
      [
        { subject: 'a (#8)', body: '' },
        { subject: 'b (#7)', body: '' }
      ],
      []
    ),
    [
      { pr: 7, title: 'b' },
      { pr: 8, title: 'a' }
    ],
    'oldest first, since the commits come newest first'
  )
})

// A repository with a history: a commit before the folder, the commit that adds its index, then squash-style commits
function fixture({ index = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'off-plan-'))
  dirs.push(root)
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }
    })
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const commit = (subject, body = '') => {
    git('add', '-A')
    git('commit', '--quiet', '--allow-empty', '-m', `${subject}\n\n${body}`)
  }
  git('init', '--quiet', '--initial-branch', 'develop')
  write('a.txt', 'a')
  commit('feat: before the folder (#1)')
  if (index) {
    write(`${DIR}/README.md`, '# Off-plan record\n')
    commit('docs: the folder (#2)')
  }
  write('b.txt', 'b')
  commit('docs: a task (#3)', 'Plan: 2.5')
  write('c.txt', 'c')
  commit('chore: nobody wrote a record (#4)')
  write('d.txt', 'd')
  commit('chore: a record in its own pull request (#5)')
  write(`${DIR}/5-own-record.md`, record('A record in its own pull request'))
  git('add', '-A')
  git('commit', '--quiet', '--amend', '--no-edit')
  return { root, write, commit, profile: { paths: { offPlan: DIR }, repository: { url: REPO } } }
}

test('the history is read from the commit that added the index, along the first parent, newest first', () => {
  const { root } = fixture()
  assert.deepEqual(
    commitsSinceIndex({ root, dir: DIR }).map(({ subject }) => subject),
    ['chore: a record in its own pull request (#5)', 'chore: nobody wrote a record (#4)', 'docs: a task (#3)']
  )
})

test('a history that never had the index, or a folder that is not a repository, gives no commits', () => {
  assert.equal(commitsSinceIndex({ root: fixture({ index: false }).root, dir: DIR }), null)
  const plain = mkdtempSync(join(tmpdir(), 'off-plan-plain-'))
  dirs.push(plain)
  assert.equal(commitsSinceIndex({ root: plain, dir: DIR }), null)
})

test('the check names the pull request that merged with no record, and passes once its record is added', () => {
  const { root, profile, write, commit } = fixture()
  const first = checkOffPlan({ root, profile })
  assert.equal(first.problems.length, 1)
  assert.match(
    first.problems[0],
    /#4 \(chore: nobody wrote a record\) merged with no `Plan:` line and no record: add docs\/off-plan\/4-<slug>\.md/
  )

  write(`${DIR}/4-late-record.md`, record('The record that came late'))
  commit('docs: the late record (#6)', 'Plan: none')
  assert.deepEqual(checkOffPlan({ root, profile }).problems, [])
})

test('the check reports a record that does not read, and does nothing where the profile has no role or the history no index', () => {
  const { root, profile, write } = fixture()
  write(`${DIR}/4-bad.md`, '# only a title\n')
  assert.match(checkOffPlan({ root, profile }).problems[0], /4-bad\.md: the record needs a text for/)

  assert.deepEqual(checkOffPlan({ root, profile: { paths: {} } }).problems, [])
  const none = fixture({ index: false })
  const result = checkOffPlan({ root: none.root, profile: none.profile })
  assert.deepEqual(result.problems, [])
  assert.match(result.message, /no pull request was asked for one/)
})

test('readFragments leaves the index out and sorts by the number of the pull request, not by the name', () => {
  const { root, write, profile } = fixture()
  write(`${DIR}/10-ten.md`, record('Ten'))
  write(`${DIR}/9-nine.md`, record('Nine'))
  assert.deepEqual(
    readFragments({ root, dir: profile.paths.offPlan }).fragments.map(({ pr }) => pr),
    [5, 9, 10]
  )
})

test('`harness plan log --off-plan` prints the records, and `harness check off-plan` fails on a pull request with none', async () => {
  const { root, profile } = fixture()
  writeFileSync(join(root, 'harness-profile.json'), JSON.stringify(profile))
  const lines = []
  const io = { out: (line) => lines.push(line), err: (line) => lines.push(line) }
  const printed = await run(['plan', 'log', '--off-plan', '--root', root], io)
  assert.equal(printed, 0, lines.join('\n'))
  assert.match(lines.join('\n'), /\[#5\]\(https:\/\/github\.com\/o\/r\/pull\/5\) \| A record in its own pull request/)

  lines.length = 0
  assert.equal(await run(['check', 'off-plan', '--root', root], io), 1)
  assert.match(lines.join('\n'), /harness check off-plan: the pull request #4/)
})

test('`harness plan log --off-plan` says so when the profile has no off-plan role', async () => {
  const { root } = fixture()
  writeFileSync(join(root, 'harness-profile.json'), JSON.stringify({ paths: {}, repository: { url: REPO } }))
  const lines = []
  const code = await run(['plan', 'log', '--off-plan', '--root', root], {
    out: (l) => lines.push(l),
    err: (l) => lines.push(l)
  })
  assert.notEqual(code, 0)
  assert.match(lines.join('\n'), /no `paths\.offPlan` role/)
})
