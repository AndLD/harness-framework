// `harness flow audit` (task 6.1): the workers of a log, the key of a command, the counts by tool, command, step and session on records of known size, the
// two kinds of token count, and the command on a stub runtime.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { auditCommand, auditLines, auditSessions, commandKey, workersOfLog } from './flow-audit.mjs'
import { loadProfile } from './profile.mjs'

const ROOT = new URL('../..', import.meta.url).pathname
// Two answers, as the adapter's parser returns them: the first made a shell call whose result is 400 characters, the second a read whose result is 80
const records = () => ({
  turns: [
    {
      at: null,
      usage: { input: 2, cacheRead: 100, cacheCreate: 10, output: 50 },
      outputChars: 64,
      calls: [{ id: 't1', tool: 'Bash', command: 'git status' }]
    },
    {
      at: null,
      usage: { input: 2, cacheRead: 500, cacheCreate: 10, output: 30 },
      outputChars: 18,
      calls: [{ id: 't2', tool: 'Read', command: null }]
    }
  ],
  results: [
    { at: null, callId: 't1', chars: 400 },
    { at: null, callId: 't2', chars: 80 }
  ]
})
const FIXTURE = 'the text of a transcript'

test('the workers of a log are the ids and the names of the "step started" entries, the first step of each', () => {
  const log = [
    '### 2026-11-05 10:30 — step 1 started',
    '- **Executor:** session · **Worker:** local_b5383ee4-3eb2-4cdd-881e-81222187117b · **Account:** a',
    '### 2026-11-05 10:50 — step 1 ended: done',
    '- **Worker:** local_ffffffff-0000-0000-0000-000000000000',
    '### 2026-11-05 12:00 — step 1a started',
    '- **Worker:** `claude -p` named `flow-1-step-1a` (its `session_id` is in the transcript)',
    '### 2026-11-05 13:00 — step 2 started',
    '- **Worker:** local_b5383ee4-3eb2-4cdd-881e-81222187117b'
  ].join('\n')
  assert.deepEqual(
    [...workersOfLog(log)],
    [
      ['local_b5383ee4-3eb2-4cdd-881e-81222187117b', '1'],
      ['flow-1-step-1a', '1a']
    ]
  )
})

test('a command is keyed by its first words, the framework command line by its subcommand, a leading cd dropped', () => {
  assert.equal(commandKey('git commit -m "x"'), 'git commit')
  assert.equal(commandKey('cd /a/b && git push -q origin x'), 'git push')
  assert.equal(commandKey('node tools/harness.mjs flow audit 1 --top 3'), 'harness flow audit')
  assert.equal(commandKey('npm run lint 2>&1 | tail'), 'npm run')
  assert.equal(commandKey('ls -la /tmp'), 'ls')
  assert.equal(commandKey('/usr/bin/git fetch'), 'git fetch')
  assert.equal(commandKey('   '), '(empty)')
})

test('the counts of a fixture by tool, command, step, and the two kinds of count, match a hand count', () => {
  const report = auditSessions({
    flow: 7,
    sessions: [{ id: 'local_a', label: 'a', role: 'worker', step: '1', records: records() }]
  })
  // results: 400 chars = 100 tokens (Bash git status), 80 chars = 20 tokens (Read); output reported 50 + 30
  assert.deepEqual(report.byTool, [
    { key: 'Bash', calls: 1, tokens: 100 },
    { key: 'Read', calls: 1, tokens: 20 }
  ])
  assert.deepEqual(report.byCommand, [{ key: 'git status', calls: 1, tokens: 100 }])
  assert.deepEqual(report.totals, { results: 120, output: 80, entered: 200, cacheRead: 600, peak: 512 })
  assert.deepEqual(report.byStep, [{ step: '1', sessions: 1, results: 120, output: 80, entered: 200, peak: 512 }])
  assert.equal(report.sessions[0].outputReported, 'reported')
  assert.deepEqual(report.largest[0], { tokens: 100, tool: 'Bash', command: 'git status', session: 'a' })
})

test('a transcript with no usage counts its output as characters divided by four and has no peak', () => {
  const bare = records()
  for (const turn of bare.turns) turn.usage = null
  const report = auditSessions({
    flow: 7,
    sessions: [{ id: 'x', label: 'x', role: 'orchestrator', step: null, records: bare }]
  })
  assert.equal(report.sessions[0].outputReported, 'estimated')
  assert.equal(report.totals.peak, null)
  assert.equal(report.totals.output, 20.5) // 64 / 4 + 18 / 4
  assert.equal(report.byStep[0].step, '(orchestrator)')
  const text = auditLines(report).join('\n')
  assert.match(text, /characters ÷ 4 \(no usage in the transcripts\)/)
  assert.match(text, /Peak context of one session: n\/a/)
})

test('a result whose call is not in the transcript is counted under an unknown tool', () => {
  const report = auditSessions({
    flow: 1,
    sessions: [
      { id: 'x', label: 'x', role: 'worker', step: '1', records: { turns: [], results: [{ callId: 'zz', chars: 8 }] } }
    ]
  })
  assert.deepEqual(report.byTool, [{ key: '(unknown)', calls: 1, tokens: 2 }])
})

test('the report prints totals, rankings, steps, sessions and the largest results, and names the sessions it could not find', () => {
  const report = auditSessions({
    flow: 7,
    sessions: [{ id: 'local_a', label: 'a', role: 'worker', step: '1', records: records() }],
    missing: ['local_gone']
  })
  const text = auditLines(report, { title: 'Demo', top: 5 }).join('\n')
  assert.match(text, /Flow 7 — Demo: 1 session\(s\) read, 1 named but not found \(local_gone\)\./)
  assert.match(text, /Entered the context: 200 tokens — tool results 120 \(60%\), the agent's output 80 \(40%\)\./)
  assert.match(text, /Peak context of one session: 512\./)
  assert.match(text, / 100 +83% +1 calls +Bash/)
  assert.match(text, /step 1: 200 entered \(results 120, output 80\), peak 512/)
  assert.match(text, / 100 +Bash +git status +\(a\)/)
})

const stub = (found, missing = []) => ({
  claude: {
    manifest: { roles: { transcripts: { module: 'm', export: 'x' } } },
    modules: { m: { x: () => ({ means: 'stub', parse: records, locate: () => ({ found, missing }) }) } }
  }
})
const profile = () => ({ ...loadProfile(ROOT), adapters: { ...loadProfile(ROOT).adapters, runtimes: ['claude'] } })

test('the command audits flow 1 of this repository on a stub runtime, and says why it cannot run', () => {
  const ok = auditCommand({
    number: 1,
    flags: { orchestrator: 'local_orch' },
    root: ROOT,
    profile: profile(),
    runtimes: stub([{ id: 'local_orch', path: 'p' }], ['local_x']),
    readText: () => FIXTURE
  })
  assert.equal(ok.code, 0)
  assert.match(ok.lines[0], /Flow 1 — .*1 session\(s\) read, 1 named but not found/)
  const json = auditCommand({
    number: 1,
    flags: { orchestrator: 'local_orch', json: true },
    root: ROOT,
    profile: profile(),
    runtimes: stub([{ id: 'local_orch', path: 'p' }]),
    readText: () => FIXTURE
  })
  assert.equal(JSON.parse(json.lines[0]).totals.entered, 200)
  const none = auditCommand({ number: 1, flags: {}, root: ROOT, profile: profile(), runtimes: {} })
  assert.equal(none.code, 1)
  assert.match(none.lines[0], /The audit cannot run: no runtime adapter .* `transcripts`/)
  const nothing = auditCommand({
    number: 1,
    flags: { orchestrator: 'local_o' },
    root: ROOT,
    profile: profile(),
    runtimes: stub([], ['local_o'])
  })
  assert.match(nothing.lines[0], /None of the \d+ session\(s\) of flow 1 has a transcript/)
  assert.match(
    auditCommand({ number: 9, flags: {}, root: ROOT, profile: profile(), runtimes: stub([]) }).lines[0],
    /There is no flow 9/
  )
  assert.match(
    auditCommand({ number: 1, flags: { top: '0' }, root: ROOT, profile: profile(), runtimes: stub([]) }).lines[0],
    /--top is a whole number/
  )
})
