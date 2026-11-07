// `harness flow status` and `next` (task 5.4): the state of each step recomputed from the repository, compared with the State column and the log.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseStep } from './flow-steps.mjs'
import {
  flowTruth,
  gatherFacts,
  logEntries,
  mergedPlanIds,
  namesVersion,
  stepIds,
  stepTruth,
  tagsOf
} from './flow-status.mjs'
import { parseFlow } from './flows.mjs'

const row = (...cells) => `| ${cells.join(' | ')} |`
const flow = (states = ['⬜', '⬜', '⬜', '⬜', '⬜']) =>
  parseFlow(
    'flow-1-ship.md',
    `# Flow 1 — Ship

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-1-ship.log.md)

## Settings

\`\`\`json
{ "repos": { "app": { "remote": "acme/app", "role": "consumer" } } }
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
${row(1, 'tasks', 'home', '`1.0.0`', '—', '—', 5, '—', 'C2', states[0])}
${row(2, 'tasks', 'home', 'I-1', '1', '—', 1, '—', 'C1', states[1])}
${row(3, 'cut', 'home', '`1.0.0`', '2', '—', 1, '—', '—', states[2])}
${row(4, 'consumer-take', 'app', '`1.0.0`', '3', '—', 2, '—', 'C2', states[3])}
${row(5, 'decision', 'home', 'what next', '4', 'D3', 1, '—', '—', states[4])}
`
  )

const facts = ({ statuses = {}, merged = [], tags = [], locks = {} } = {}) => ({
  statuses: new Map(Object.entries(statuses)),
  titles: new Map([['1.1', 'First']]),
  merged: merged === null ? null : new Set(merged),
  tags: tags === null ? null : new Set(tags),
  lockOf: (repo) => locks[repo],
  releaseRows: [{ release: '`1.0.0`', tasks: '1.1, Phase 2' }],
  phases: [{ number: 2, order: null, points: false, tasks: [{ id: '2.1' }, { id: '2.2' }] }]
})

const DONE = { 1.1: '✅', 2.1: '✅', 2.2: '✅' }
const MERGED = ['1.1', '2.1', '2.2']
const byId = (truth, id) => truth.steps.find((step) => step.id === id)

test('the ids of a step come from its release in the order of the releases file, a phase in its own order, and then the ids it names', () => {
  const [one, two] = flow().steps
  assert.deepEqual(stepIds(one, facts()), ['1.1', '2.1', '2.2'])
  assert.deepEqual(stepIds(two, facts()), ['I-1'])
})

test('a step that is done but marked pending is done, and the mismatch is named', () => {
  const truth = flowTruth(flow(), facts({ statuses: DONE, merged: MERGED }))
  assert.equal(byId(truth, '1').computed, '✅')
  assert.equal(byId(truth, '1').state, '✅')
  assert.deepEqual(truth.mismatches, ['step 1: marked ⬜, the repository shows ✅ (1.1 ✅, 2.1 ✅, 2.2 ✅)'])
  assert.equal(truth.next.id, '2')
  assert.equal(truth.finished, false)
})

test('a task marked done whose pull request is not merged is not done', () => {
  const truth = flowTruth(flow(['✅', '⬜', '⬜', '⬜', '⬜']), facts({ statuses: DONE, merged: ['1.1', '2.1'] }))
  assert.equal(byId(truth, '1').computed, '🟡')
  assert.equal(byId(truth, '1').state, '🟡')
  assert.match(
    truth.mismatches[0],
    /step 1: marked ✅, the repository shows 🟡 \(1\.1 ✅, 2\.1 ✅, 2\.2 ✅ \(no merged pull request\)\)/
  )
  assert.equal(truth.next.id, '1')
  // when Git cannot say what is merged, the mark of the plan counts
  assert.equal(byId(flowTruth(flow(), facts({ statuses: DONE, merged: null })), '1').computed, '✅')
})

test('a step an orchestrator left in progress is found from the log and the repository', () => {
  const entries = logEntries(`# Flow 1 — Ship — log

## Entries

### 2026-11-04 10:00 — running
- **Orchestrator:** s1

### 2026-11-04 10:01 — step 1 started

### 2026-11-04 10:30 — step 1 ended: done

### 2026-11-04 10:31 — step 2 started
`)
  const truth = flowTruth(flow(['✅', '🟡', '⬜', '⬜', '⬜']), facts({ statuses: DONE, merged: MERGED }), entries)
  assert.equal(truth.claim, '2026-11-04 10:00')
  assert.equal(truth.open.step, '2')
  assert.deepEqual(truth.mismatches, [
    'step 2: marked 🟡, the repository shows ⬜ (I-1 unknown)',
    'step 2: the log has "step 2 started" (2026-11-04 10:31) and no end or stop after it; an orchestrator stopped in the middle of it, and the repository shows ⬜'
  ])
  assert.equal(truth.next.id, '2')
  assert.equal(truth.next.state, '⬜')
})

test('a stop entry releases the claim and closes the step left open; the log cannot make a step done that the repository does not show', () => {
  const log = (text) => logEntries(`# Flow 1 — Ship — log\n\n## Entries\n\n${text}`)
  const stopped = flowTruth(
    flow(),
    facts(),
    log(
      '### 2026-11-04 10:00 — running\n\n### 2026-11-04 10:01 — step 1 started\n\n### 2026-11-04 10:09 — stop: usage\n'
    )
  )
  assert.equal(stopped.claim, null)
  assert.equal(stopped.open, null)
  const lying = flowTruth(flow(), facts(), log('### 2026-11-04 10:30 — step 1 ended: done\n'))
  assert.match(lying.mismatches.join('\n'), /step 1: the log says it ended done, the repository shows ⬜/)
})

test('a cut is done when its tag exists, with or without the v of a final release', () => {
  const states = ['✅', '✅', '⬜', '⬜', '⬜']
  const base = { statuses: { ...DONE, 'I-1': '✅' }, merged: [...MERGED, 'I-1'] }
  assert.equal(byId(flowTruth(flow(states), facts({ ...base, tags: ['v1.0.0'] })), '3').computed, '✅')
  assert.equal(byId(flowTruth(flow(states), facts({ ...base, tags: ['1.0.0'] })), '3').computed, '✅')
  const without = flowTruth(flow(states), facts({ ...base, tags: ['v0.9.0'] }))
  assert.equal(byId(without, '3').computed, '⬜')
  assert.equal(without.next.id, '3')
  const unknown = flowTruth(flow(states), facts({ ...base, tags: null }))
  assert.equal(byId(unknown, '3').computed, null)
  assert.equal(byId(unknown, '3').evidence, 'the tags cannot be read')
})

test('a consumer takes a version when its lock names it; an external repository that cannot be read leaves the mark in charge', () => {
  const take = (locks, mark = '⬜') =>
    byId(flowTruth(flow(['✅', '✅', '✅', mark, '⬜']), facts({ statuses: { ...DONE, 'I-1': '✅' }, locks })), '4')
  assert.equal(take({ app: { version: '1.0.0' } }).computed, '✅')
  assert.equal(take({ app: { version: '0.9.0' } }).computed, '⬜')
  assert.equal(take({ app: null }).computed, '⬜')
  const unreadable = take({}, '🟡')
  assert.equal(unreadable.computed, null)
  assert.equal(unreadable.state, '🟡')
  assert.equal(unreadable.mismatch, null)
  assert.match(unreadable.evidence, /the lock of the repository "app" cannot be read from here/)
})

test('a step in an external repository is checked through the host: the lock it holds, and the pull requests that mention the version', () => {
  const take = (lock, pullRequestsOf) => {
    const base = facts({ statuses: { ...DONE, 'I-1': '✅' }, locks: { app: lock } })
    return byId(flowTruth(flow(['✅', '✅', '✅', '⬜', '⬜']), { ...base, pullRequestsOf }), '4')
  }
  const prs =
    (...pullRequests) =>
    () => ({ pullRequests })
  const old = { version: '0.9.0' }
  assert.equal(take({ version: '1.0.0' }, prs()).computed, '✅')
  const open = take(old, prs({ number: 7, title: 'take 1.0.0', state: 'open' }))
  assert.equal(open.computed, '🟡')
  assert.match(open.evidence, /the lock of "app" names 0\.9\.0, not 1\.0\.0; pull request #7 \(take 1\.0\.0\) is open/)
  const merged = take(old, prs({ number: 6, title: 'take 1.0.0', state: 'merged' }))
  assert.equal(merged.computed, '⬜')
  assert.match(
    merged.evidence,
    /pull request #6 \(take 1\.0\.0\) is merged, but the lock on the default branch does not name 1\.0\.0 yet/
  )
  assert.match(
    take(old, prs({ number: 5, title: 'other', state: 'closed' })).evidence,
    /no pull request names 1\.0\.0 in its title/
  )
  // a pull request that only mentions the version in its body (a plan document) is not the one that takes it
  assert.match(
    take(old, prs({ number: 3, title: 'docs: the order of the plan', state: 'merged' })).evidence,
    /no pull request names 1\.0\.0 in its title/
  )
  // the take of a development version is not the take of the final version it extends, nor of another development version
  const dev = (title) => take(old, prs({ number: 8, title, state: 'open' }))
  assert.equal(dev('chore(framework): take 1.0.0-dev.1').computed, '⬜')
  assert.equal(dev('chore(framework): take 1.0.0.1').computed, '⬜')
  assert.equal(dev('chore(framework): take 11.0.0').computed, '⬜')
  assert.equal(dev('chore(framework): take 1.0.0').computed, '🟡')
  assert.equal(dev('chore(framework): take v1.0.0.').computed, '🟡')
  assert.equal(dev('chore(framework): take 1.0.0-dev.1 and 1.0.0').computed, '🟡')
  assert.match(
    take(old, () => ({ pullRequests: [], error: 'no access' })).evidence,
    /its pull requests could not be read \(no access\)/
  )
  assert.equal(take(old, undefined).evidence, 'the lock of "app" names 0.9.0, not 1.0.0')
  assert.equal(take(old, () => undefined).computed, '⬜')
  // the home repository's own consumer step never asks the host
  const home = parseStep({ '#': '1', kind: 'consumer-take', repo: 'home', scope: '`1.0.0`' })
  const never = () => assert.fail('the host is not asked for the home repository')
  assert.equal(stepTruth(home, { lockOf: () => old, pullRequestsOf: never }).state, '⬜')
})

test('a version is named as a whole token, a development version apart from its final version and from another development version', () => {
  assert.equal(namesVersion('take 1.0.0-dev.1', '1.0.0'), false)
  assert.equal(namesVersion('take 1.0.0-dev.1', '1.0.0-dev.1'), true)
  assert.equal(namesVersion('take 1.0.0-dev.12', '1.0.0-dev.1'), false)
  assert.equal(namesVersion('take 1.0.0-dev.2', '1.0.0-dev.1'), false)
  assert.equal(namesVersion('take 1.0.0 (final)', '1.0.0'), true)
})

test('a decision or a custom step has nothing to recompute; a step the owner holds is no mismatch until the repository shows it done', () => {
  const held = flowTruth(flow(['⏸', '⬜', '⬜', '⬜', '⏸']), facts())
  assert.deepEqual(held.mismatches, [])
  assert.equal(byId(held, '1').state, '⏸')
  assert.equal(byId(held, '5').computed, null)
  const done = flowTruth(flow(['⏸', '⬜', '⬜', '⬜', '⬜']), facts({ statuses: DONE, merged: MERGED }))
  assert.match(done.mismatches[0], /step 1: marked ⏸, the repository shows ✅/)
})

test('the next step is the first that is not done and whose needs are; a flow whose steps are all done is finished', () => {
  const none = flowTruth(flow(), facts())
  assert.equal(none.next.id, '1')
  const blocked = flowTruth(flow(['⬜', '⬜', '⬜', '⬜', '⬜']), facts())
  assert.equal(blocked.next.id, '1', 'step 2 needs step 1')
  const all = flowTruth(
    flow(['✅', '✅', '✅', '✅', '✅']),
    facts({
      statuses: { ...DONE, 'I-1': '✅' },
      merged: [...MERGED, 'I-1'],
      tags: ['v1.0.0'],
      locks: { app: { version: '1.0.0' } }
    })
  )
  assert.equal(all.finished, true)
  assert.equal(all.next, null)
  assert.equal(flowTruth(parseFlow('flow-2-x.md', '# Flow 2 — x\n'), facts()).finished, false)
})

test('the merged pull requests are the Plan lines of the commits on the integration branch, and tags are listed', () => {
  const bodies = 'feat\n\nPlan: 5.4, I-3\nCo-Authored-By: x\n\nfix\n\nPlan: 3.18\n'
  assert.deepEqual([...mergedPlanIds(() => bodies, 'origin/develop')].sort(), ['3.18', '5.4', 'I-3'])
  assert.equal(
    mergedPlanIds(() => {
      throw new Error('no ref')
    }, 'origin/develop'),
    null
  )
  assert.deepEqual([...tagsOf(() => 'v0.1.0\n0.2.0-dev.1\n')], ['v0.1.0', '0.2.0-dev.1'])
})

test('the facts come from the plan and Git: the remote branch first, then the local one; the lock of the home repository is read here', () => {
  const plan = {
    phases: [{ number: 1, tasks: [{ id: '1.1', status: '🟡', title: 'One' }] }],
    queue: { open: [{ id: 'I-2', status: '⬜', title: 'Open' }], archived: [{ id: 'I-1', title: 'Old' }] },
    releaseRows: []
  }
  const asked = []
  const git = (args) => {
    asked.push(args.join(' '))
    if (args[1] === 'origin/develop') throw new Error('unknown revision')
    return args[0] === 'tag' ? 'v1.0.0\n' : 'Plan: 1.1\n'
  }
  const read = gatherFacts({
    root: '/nowhere',
    profile: { branches: { integration: 'develop' } },
    plan,
    git,
    lockOf: (repo) => repo
  })
  assert.deepEqual(asked.slice(0, 2), ['log origin/develop --format=%B', 'log develop --format=%B'])
  assert.deepEqual([...read.merged], ['1.1'])
  assert.deepEqual([...read.tags], ['v1.0.0'])
  assert.deepEqual(
    [...read.statuses],
    [
      ['1.1', '🟡'],
      ['I-2', '⬜'],
      ['I-1', '✅']
    ]
  )
  assert.equal(read.titles.get('I-1'), 'Old')
  assert.equal(read.lockOf('home'), 'home')
  const unreadable = gatherFacts({
    root: '/nowhere',
    profile: { branches: { integration: 'develop' } },
    plan,
    git: () => {
      throw new Error('x')
    }
  })
  assert.equal(unreadable.merged, null)
  assert.equal(unreadable.tags, null)
  assert.equal(unreadable.lockOf('app'), undefined)
})

test('the entries of a log are read with their kind, step and time; a line that is not an entry is left out', () => {
  const entries = logEntries(`# Flow 1 — Ship — log

## Entries

### 2026-11-04 10:00 — running
### 2026-11-04 10:01 — step 1b started
### 2026-11-04 10:02 — step 1b ended: partial
### 2026-11-04 10:03 — decision D2: add a task?
### 2026-11-04 10:04 — stop: finished
### broken
`)
  assert.deepEqual(
    entries.map(({ kind, step, status }) => [kind, step, status]),
    [
      ['running', null, null],
      ['started', '1b', null],
      ['ended', '1b', 'partial'],
      ['decision', null, null],
      ['stop', null, null]
    ]
  )
  assert.deepEqual(logEntries(null), [])
})
