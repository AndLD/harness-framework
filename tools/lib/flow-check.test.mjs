// `harness flow check` (task 5.4): a valid flow passes, and each check holds with a planted defect.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ENTRY_HEADING, flowProblems, logHeadings } from './flow-check.mjs'
import { flowsTable, parseFlow, FLOWS_END, FLOWS_START } from './flows.mjs'

const ROWS = [
  ['1', 'tasks', 'home', '`1.0.0`', '—', '—', '5', '10%', 'C2', '✅'],
  ['2', 'cut', 'home', '`1.0.0`', '1', '—', '1', '—', '—', '⬜']
]

const flowText = ({
  number = 1,
  slug = 'ship',
  releases = '`1.0.0`',
  needs = '—',
  settings = '{ "mode": "seamless" }',
  rows = ROWS,
  extra = '',
  log = `./flow-${number}-${slug}.log.md`
} = {}) =>
  `[← Flows](./README.md)

# Flow ${number} — Ship

**Releases:** ${releases} · **Needs:** ${needs} · **Log:** [\`log\`](${log})

## Settings

\`\`\`json
${settings}
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
${rows.map((row) => `| ${row.join(' | ')} |`).join('\n')}
${extra}`

const logText = (entries = '', title = '# Flow 1 — Ship — log') => `${title}

\`\`\`markdown
### YYYY-MM-DD HH:MM — step <#> started
\`\`\`

## Entries

${entries}`

const FACTS = {
  releaseNames: ['1.0.0'],
  knownIds: new Set(['1.1', '1.2', 'I-1']),
  phaseNumbers: new Set([1])
}

// The problems of a folder with the given flow files (name → text) and logs (name → text, or null)
function problemsOf(files, { logs, facts = FACTS } = {}) {
  const flows = Object.entries(files).map(([name, text]) => parseFlow(name, text))
  const readme = `# Flows\n${FLOWS_START}\n${flowsTable(flows)}\n${FLOWS_END}\n`
  const logsOf = logs ?? Object.fromEntries(flows.map((flow) => [flow.file, logText()]))
  return flowProblems({ dir: 'flows', readme, flows }, facts, logsOf)
}
const one = (text, options) => problemsOf({ 'flow-1-ship.md': text }, options)
const withRows = (rows, extra) => one(flowText({ rows, extra }))

test('a valid flow, with an inserted step and a custom step, has no problem', () => {
  const rows = [
    ...ROWS.slice(0, 1),
    ['1b', 'custom', 'home', 'a probe', '1', '—', '1', '—', '—', '⬜'],
    ['2', 'cut', 'home', '`1.0.0`', '1, 1b', '—', '1', '—', '—', '⬜']
  ]
  assert.deepEqual(one(flowText({ rows, extra: '\n## Step 1b\n\nDo the probe.\n' })), [])
  assert.deepEqual(one(flowText()), [])
})

test('step ids are unique, in the order of the table, and an inserted step follows its base with a rising suffix', () => {
  const twice = withRows([...ROWS, ROWS[1]])
  assert.match(twice.join('\n'), /step 2 appears twice/)
  assert.match(withRows([ROWS[1], ROWS[0]]).join('\n'), /step 1 comes after step 2/)
  assert.match(
    withRows([ROWS[0], ['3c', 'cut', 'home', '`1.0.0`', '1', '—', '1', '—', '—', '⬜']]).join('\n'),
    /step 3c is an inserted step, but no step 3 stands before it/
  )
  assert.match(
    withRows([
      ROWS[0],
      ['1c', 'cut', 'home', '`1.0.0`', '1', '—', '1', '—', '—', '⬜'],
      ['1b', 'cut', 'home', '`1.0.0`', '1', '—', '1', '—', '—', '⬜']
    ]).join('\n'),
    /step 1b is inserted after step 1c; the suffixes rise/
  )
  assert.match(withRows([['x1', ...ROWS[0].slice(1)]]).join('\n'), /step "x1" has an id that is not a number/)
})

test('the kind and the repository of a step must be known, and a step needs only steps before it', () => {
  assert.match(withRows([['1', 'build', ...ROWS[0].slice(2)]]).join('\n'), /step 1 has the kind "build"/)
  assert.match(
    withRows([['1', 'tasks', 'far', ...ROWS[0].slice(3)]]).join('\n'),
    /names the repository "far".*\(home\)/
  )
  assert.match(
    withRows([['1', 'tasks', 'home', '`1.0.0`', '2', ...ROWS[0].slice(5)], ROWS[1]]).join('\n'),
    /step 1 needs step 2, which comes after it/
  )
  assert.match(
    withRows([ROWS[0], ['2', 'cut', 'home', '`1.0.0`', '9', ...ROWS[1].slice(5)]]).join('\n'),
    /step 2 needs step 9, which does not exist/
  )
})

test('the scope names ids that exist, never a backlog item, and releases of the releases file that the flow declares', () => {
  const scope = (value, kind = 'tasks') => withRows([['1', kind, 'home', value, ...ROWS[0].slice(4)]]).join('\n')
  assert.match(scope('9.9'), /step 1 names 9\.9, which is no task of the plan and no issue of the queue/)
  assert.match(scope('B-3'), /names the backlog item B-3, which is not approved work/)
  assert.match(scope('Phase 7'), /names Phase 7, which the plan does not have/)
  assert.match(scope('`2.0.0`'), /names the release 2\.0\.0, which is not a row of the releases file/)
  assert.match(scope('nothing'), /names nothing to build/)
  const other = flowText({ releases: '`3.0.0`' })
  assert.match(
    one(other, { facts: { ...FACTS, releaseNames: ['1.0.0', '3.0.0'] } }).join('\n'),
    /names the release 1\.0\.0, which this flow does not declare/
  )
  assert.match(scope('`1.0.0`, `1.1.0`', 'cut'), /names 2 versions; its scope is exactly one version/)
  assert.match(scope('5 (executor: robot)'), /overrides the executor with "robot"/)
  assert.deepEqual(
    withRows([['1', 'tasks', 'home', '1.1, 1.2, I-1, Phase 1 (executor: manual)', ...ROWS[0].slice(4)]]),
    []
  )
})

test('a custom step needs its section and no other kind has one', () => {
  const custom = ['1', 'custom', 'home', 'a probe', '—', '—', '1', '—', '—', '⬜']
  assert.match(withRows([custom]).join('\n'), /step 1 is a custom step, but the flow has no section "## Step 1"/)
  assert.match(
    withRows(ROWS, '\n## Step 1\n\ntext\n').join('\n'),
    /step 1 is not a custom step, but the flow holds a section/
  )
})

test('the settings hold valid levels, executors, reuse limits, thresholds and a home repository', () => {
  const problems = one(
    flowText({
      settings:
        '{ "askAt": "D0", "levels": { "cut.final": "D9" }, "executor": "robot", "reuse": "maybe", "reuseLimits": { "context": 0, "steps": 1.5, "cacheMinutes": -1 }, "commits": "never", "usage": { "stopAt": { "fiveHour": 0, "weekly": 120 } }, "repos": { "home": "../elsewhere" } }'
    })
  ).join('\n')
  for (const part of [
    /askAt "D0" is not one of D1 to D4/,
    /level of "cut\.final" is "D9"/,
    /setting executor "robot"/,
    /setting reuse "maybe"/,
    /reuse limit context must be a percent/,
    /reuse limit steps must be a whole number/,
    /reuse limit cacheMinutes must be a number of minutes/,
    /setting commits "never"/,
    /threshold fiveHour/,
    /threshold weekly/,
    /the home repository is "\."/
  ]) {
    assert.match(problems, part)
  }
})

test('the reuse limits are an object', () => {
  assert.match(
    one(flowText({ settings: '{ "reuseLimits": 5 }' })).join('\n'),
    /the setting reuseLimits is not an object/
  )
})

test('the needs of flows resolve and never go in a circle', () => {
  const second = (needs) => flowText({ number: 2, needs, releases: '`2.0.0`' }).replace('`1.0.0`', '`2.0.0`')
  const facts = { ...FACTS, releaseNames: ['1.0.0', '2.0.0'] }
  const two = (first, next) =>
    problemsOf(
      { 'flow-1-ship.md': flowText({ needs: first }), 'flow-2-ship.md': second(next) },
      {
        facts,
        logs: {
          'flow-1-ship.md': logText(),
          'flow-2-ship.md': logText('', '# Flow 2 — Ship — log')
        }
      }
    ).join('\n')
  assert.match(two('flow 1', 'flow 1'), /flow-1-ship\.md: needs itself/)
  assert.match(two('—', 'flow 7'), /flow-2-ship\.md: needs flow 7, which does not exist/)
  assert.match(two('flow 2', 'flow 1'), /needs a flow that needs it back/)
  assert.doesNotMatch(two('—', 'flow 1'), /needs/)
})

test('the log is beside the flow, titled for it, with well formed entries that name steps of the flow', () => {
  const entries = [
    '### 2026-11-04 10:30 — running',
    '### 2026-11-04 10:31 — step 1 started',
    '### 2026-11-04 10:40 — step 1 ended: done',
    '### 2026-11-04 10:41 — decision D2: add a task?',
    '### 2026-11-04 10:50 — stop: waits for the owner'
  ].join('\n- x\n\n')
  assert.deepEqual(one(flowText(), { logs: { 'flow-1-ship.md': logText(entries) } }), [])
  const bad = (log, text = flowText()) => one(text, { logs: { 'flow-1-ship.md': log } }).join('\n')
  assert.match(bad(null), /has no log flow-1-ship\.log\.md beside it/)
  assert.match(bad(logText('', '# Flow 2 — Ship — log')), /is titled for flow 2, not flow 1/)
  assert.match(bad(logText('', '# Ship')), /has no title "# Flow <n> — <title> — log"/)
  assert.match(bad('# Flow 1 — Ship — log\n'), /has no "## Entries" section/)
  assert.match(bad(logText('### 2026-11-04 — running')), /the entry "2026-11-04 — running" does not read/)
  assert.match(bad(logText('### 2026-11-04 10:31 — step 9 started')), /names step 9, which the flow does not have/)
  assert.match(
    bad(logText(), flowText({ log: './elsewhere.md' })),
    /points to \.\/elsewhere\.md, not to flow-1-ship\.log\.md/
  )
  assert.match(bad(logText(), flowText().replace(/ · \*\*Log:\*\*.*/, '')), /has no "\*\*Log:\*\*" link/)
})

test('the headings of a log are those after "Entries" and outside fenced blocks', () => {
  assert.deepEqual(logHeadings(logText('### 2026-11-04 10:30 — running\n')), ['### 2026-11-04 10:30 — running'])
  assert.deepEqual(logHeadings('# no entries'), [])
  assert.match('### 2026-11-04 10:30 — step 3b ended: partial', ENTRY_HEADING)
  assert.doesNotMatch('### 2026-11-04 10:30 — step 3 ended: finished', ENTRY_HEADING)
})

test('the index must agree with the flow files', () => {
  const flows = [parseFlow('flow-1-ship.md', flowText())]
  const stale = flowProblems({ dir: 'flows', readme: `${FLOWS_START}\nNo flow yet.\n${FLOWS_END}`, flows }, FACTS, {
    'flow-1-ship.md': logText()
  })
  assert.deepEqual(stale, [
    'flows/README.md: the flows table disagrees with the flow files; run `harness plan summary`'
  ])
  const unmarked = flowProblems({ dir: 'flows', readme: '# Flows', flows }, FACTS, { 'flow-1-ship.md': logText() })
  assert.match(unmarked.join('\n'), /the flows table must sit between/)
})

test('the permissions setting is an object with a mode name and a list of tools by name (issue I-11)', () => {
  const problems = (settings) => one(flowText({ settings })).join('\n')
  assert.equal(problems('{ "permissions": { "mode": "acceptEdits", "allow": ["Bash(git *)"] } }'), '')
  assert.match(problems('{ "permissions": "acceptEdits" }'), /the setting permissions is not an object/)
  assert.match(
    problems('{ "permissions": { "mode": 5, "allow": "Edit" } }'),
    /the permissions mode must be a name of the runtime/
  )
  assert.match(
    problems('{ "permissions": { "mode": "x", "allow": "Edit" } }'),
    /the permissions allow must be a list of tools by name/
  )
  assert.match(problems('{ "permissions": { "allow": ["Edit", ""] } }'), /the permissions allow must be a list/)
})
