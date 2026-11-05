// The flows of a plan (task 5.2): the reading of a flow file (its releases, settings, size, estimated usage and status), the index of the folder written by
// `harness plan summary` and held by its check, the link from the releases block of the plan index, and the problems a summary reports.
import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { FLOW_DEFAULTS, flowStatus, flowsProblems, flowsTable, parseFlow, withFlowsTable } from './flows.mjs'
import { planSummary } from './plan.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

const ROOT = join(import.meta.dirname, '..', '..')

const flow = ({
  number = 1,
  releases = '`1.0.0`',
  settings = '{ "mode": "seamless" }',
  states = ['✅', '⬜'],
  usage = ['10%', '—']
} = {}) =>
  `[← Flows](./README.md)

# Flow ${number} — Ship one

**Releases:** ${releases} · **Needs:** — · **Log:** [\`flow-${number}-ship-one.log.md\`](./flow-${number}-ship-one.log.md)

What it delivers.

## Settings

\`\`\`json
${settings}
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | \`1.0.0\` | — | — | 5 | ${usage[0]} | C2 | ${states[0]} |
| 2 | cut | home | \`1.0.0\` | 1 | — | 1 | ${usage[1]} | — | ${states[1]} |
`

test('a flow file is read: its releases, its settings over the defaults, the size and the usage of its steps, and a status from their states', () => {
  const read = parseFlow('flow-1-ship-one.md', flow())
  assert.deepEqual(read.problems, [])
  assert.equal(read.number, 1)
  assert.equal(read.title, 'Ship one')
  assert.deepEqual(read.releases, ['1.0.0'])
  assert.equal(read.settings.mode, 'seamless')
  assert.equal(read.settings.askAt, FLOW_DEFAULTS.askAt)
  assert.deepEqual(read.settings.levels, FLOW_DEFAULTS.levels)
  assert.equal(read.size, 6)
  assert.deepEqual(read.usage, { percent: 10, partial: true })
  assert.equal(
    parseFlow('flow-1-ship-one.md', flow({ usage: ['0.6%', '3.2%'] })).usage.percent,
    3.8,
    'a sum of fractions has no floating point tail'
  )
  assert.equal(read.status, '🟡')
  assert.equal(parseFlow('flow-1-ship-one.md', flow({ usage: ['—', '—'] })).usage, null)
})

test('the status of a flow: not started, running, waiting or blocked whatever else, and done only when every step is', () => {
  assert.equal(flowStatus([]), '⬜')
  assert.equal(flowStatus(['⬜', '⬜']), '⬜')
  assert.equal(flowStatus(['✅', '⬜']), '🟡')
  assert.equal(flowStatus(['✅', '⏸', '⛔']), '⛔')
  assert.equal(flowStatus(['✅', '⏸']), '⏸')
  assert.equal(flowStatus(['✅', '✅']), '✅')
})

test('a flow file without its parts, with a bad mode, bad JSON, a wrong number or an unknown state has problems', () => {
  assert.deepEqual(parseFlow('flow-1-x.md', '# Something\n').problems, [
    'has no title "# Flow <n> — <title>"',
    'has no "**Releases:**" field',
    'has no settings block (a fenced JSON block under "## Settings")',
    'has no steps table (a table whose first column is "#" under "## Steps")'
  ])
  assert.deepEqual(
    parseFlow('flow-2-ship-one.md', flow({ settings: '{ "mode": "fast" }', states: ['✅', '?'] })).problems,
    [
      'the title says flow 1, the file name flow 2',
      'the mode "fast" is not one of brainstorm, seamless',
      'a step has a state that is not one of ⬜ 🟡 ⏸ ⛔ ✅'
    ]
  )
  assert.match(
    parseFlow('flow-1-ship-one.md', flow({ settings: '{ mode }' })).problems[0],
    /the settings block is not valid JSON/
  )
})

test('the index table links each flow, and the problems of a folder name a release that two flows declare or that the releases file lacks', () => {
  const one = parseFlow('flow-1-ship-one.md', flow())
  const two = parseFlow('flow-2-ship-one.md', flow({ number: 2, releases: '`1.0.0`, `2.0.0`', usage: ['3%', '4%'] }))
  assert.equal(
    flowsTable([one, two]),
    [
      '| Flow | Releases | Mode | Size | Est. usage | Status |',
      '| ---- | -------- | ---- | ---- | ---------- | ------ |',
      '| [1 — Ship one](./flow-1-ship-one.md) | `1.0.0` | seamless | 6 SP | 10% (some steps not estimated) | 🟡 |',
      '| [2 — Ship one](./flow-2-ship-one.md) | `1.0.0`, `2.0.0` | seamless | 6 SP | 7% | 🟡 |'
    ].join('\n')
  )
  assert.equal(flowsTable([]), 'No flow yet.')
  assert.equal(withFlowsTable('no markers', []), null)
  assert.deepEqual(flowsProblems({ dir: 'flows', flows: [one, two] }, ['1.0.0']), [
    'flows/flow-2-ship-one.md: the release 1.0.0 is declared by flow 1 too; a release belongs to at most one flow',
    'flows/flow-2-ship-one.md: the release 2.0.0 is not a row of the releases file'
  ])
})

function project({ flows = true, releases = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'flows-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const read = (path) => readFileSync(join(root, path), 'utf8')
  cpSync(join(ROOT, 'core/templates/scaffold'), join(root, 'core/templates/scaffold'), { recursive: true })
  const profile = {
    project: { title: 'Demo' },
    paths: {
      plan: 'plan',
      phases: 'plan/phases',
      planIndex: 'plan/README.md',
      ...(releases ? { releases: 'plan/releases.md' } : {}),
      ...(flows ? { flows: 'plan/flows' } : {}),
      frameworkDir: '.'
    }
  }
  write(
    'plan/README.md',
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n<!-- plan-releases:start -->\n<!-- plan-releases:end -->\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  )
  write(
    'plan/phases/phase-1-one.md',
    '# Phase 1 — One (1 SP)\n\n**Status:** 🟡 In progress\n\n| # | Task | SP | Status |\n| - | - | - | - |\n| 1.1 | x | 1 | 🟡 |\n'
  )
  write('plan/releases.md', '| Release | Status | Tasks, in order |\n| - | - | - |\n| `1.0.0` | 🟡 | 1.1 |\n')
  return { root, profile, write, read }
}

test('plan summary creates the flows index, writes its table from the flow files, links it from the releases block, and its check holds both', () => {
  const { root, profile, write, read } = project()
  const first = planSummary({ root, profile })
  assert.deepEqual(first.problems, [])
  assert.match(first.message, /Set up the flows: created plan\/flows\/README\.md\./)
  assert.match(read('plan/flows/README.md'), /\[← Development plan index\]\(\.\.\/README\.md\)[\s\S]*No flow yet\./)
  assert.match(read('plan/README.md'), /The flows that run them: \[flows\]\(\.\/flows\/README\.md\)\./)
  write('plan/flows/flow-1-ship-one.md', flow())
  assert.match(
    planSummary({ root, profile, check: true }).problems.join('\n'),
    /plan\/flows\/README\.md: the flows table disagrees with the flow files; run `harness plan summary`/
  )
  assert.deepEqual(planSummary({ root, profile }).problems, [])
  assert.match(
    read('plan/flows/README.md'),
    /\| \[1 — Ship one\]\(\.\/flow-1-ship-one\.md\) \| `1\.0\.0` \| seamless \| 6 SP \|/
  )
  assert.deepEqual(planSummary({ root, profile, check: true }).problems, [])
  write('plan/flows/README.md', '# Flows\n')
  assert.match(planSummary({ root, profile, check: true }).problems.join('\n'), /the flows table must sit between/)
})

test('a flows folder needs a releases file and an index, and a plan without the role has no flows', () => {
  const lonely = project({ releases: false })
  assert.match(
    planSummary({ ...lonely, check: true }).problems.join('\n'),
    /names a flows folder \(`paths\.flows`\) but no releases file/
  )
  const unset = project()
  assert.match(
    planSummary({ ...unset, check: true }).problems.join('\n'),
    /plan\/flows: the profile names this folder for the flows, but it has no index/
  )
  const none = project({ flows: false })
  assert.deepEqual(planSummary({ root: none.root, profile: none.profile }).problems, [])
  assert.doesNotMatch(none.read('plan/README.md'), /flows/)
})
