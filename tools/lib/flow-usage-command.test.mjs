// `harness flow estimate | gate | sample` and the usage part of `flow check` (task 5.6) on a scratch project, through `flowCommand`.
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { flowCommand } from './flow-command.mjs'
import { planSummary } from './plan.mjs'
import { ADAPTER_RUNTIMES } from './runtimes.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const ROOT = join(import.meta.dirname, '..', '..')

const FLOW = (settings = '{ "mode": "seamless" }') => `[← Flows](./README.md)

# Flow 1 — Ship one

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-1-ship-one.log.md)

## Settings

\`\`\`json
${settings}
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | \`1.0.0\` | — | — | 5 | — | C2 | ⬜ |
| 2 | cut | home | \`1.0.0\` | 1 | — | 1 | — | — | ⬜ |
`

function project(settings) {
  const root = mkdtempSync(join(tmpdir(), 'flow-usage-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  cpSync(join(ROOT, 'core'), join(root, 'core'), { recursive: true })
  const profile = {
    project: { title: 'Demo', entryFile: 'AGENTS.md' },
    branches: { integration: 'develop', production: 'main' },
    adapters: { runtimes: ['claude-code'] },
    plan: { complexity: { models: { C2: 'Sonnet 5.5 at high effort' } } },
    paths: {
      plan: 'plan',
      phases: 'plan/phases',
      planIndex: 'plan/README.md',
      releases: 'plan/releases.md',
      flows: 'plan/flows',
      frameworkDir: '.'
    }
  }
  write('harness-profile.json', JSON.stringify(profile))
  write(
    'plan/README.md',
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n<!-- plan-releases:start -->\n<!-- plan-releases:end -->\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  )
  write(
    'plan/phases/phase-1-one.md',
    '# Phase 1 — One (1 SP)\n\n**Status:** 🟡 In progress\n\n| # | Task | SP | Status |\n| - | - | - | - |\n| 1.1 | First | 1 | ✅ |\n'
  )
  write('plan/releases.md', '| Release | Status | Tasks, in order |\n| - | - | - |\n| `1.0.0` | 🟡 | 1.1 |\n')
  write('plan/flows/flow-1-ship-one.md', FLOW(settings))
  write('plan/flows/flow-1-ship-one.log.md', '# Flow 1 — Ship one — log\n\n## Entries\n')
  planSummary({ root, profile })
  return { root, profile, write }
}

const call = (words, { root, profile }, flags = {}, now = '2026-11-05T10:00:00Z') =>
  flowCommand({ words, flags, root, profile, runtimes: ADAPTER_RUNTIMES, now, git: () => '' })
const READING = { 'five-hour': '30@2026-11-05T12:30:00Z', weekly: '7@2026-11-10T07:00:00Z' }
const SAMPLES = 'plan/flows/usage.jsonl'

test('estimate sizes each step and the flow by the subscription of the local profile file, and says when none is known', () => {
  const scratch = project()
  const unknown = call(['estimate', '1'], scratch)
  assert.equal(unknown.code, 0)
  assert.match(
    unknown.lines[0],
    /no subscription known \(set usage\.subscription in harness-profile\.local\.json, or give --plan\)/
  )
  assert.match(
    unknown.lines.join('\n'),
    /step 1 \[tasks\] 5 SP, Sonnet 5\.5 at high effort: not estimated \(no subscription is known/
  )
  assert.match(unknown.lines.at(-1), /No step could be estimated/)

  scratch.write('harness-profile.local.json', JSON.stringify({ usage: { subscription: 'pro' } }))
  const sized = call(['estimate', '1'], scratch)
  const text = sized.lines.join('\n')
  assert.match(text, /subscription pro \(the local profile file\), provisional coefficients of claude-code/)
  assert.match(text, /step 1 \[tasks\] 5 SP, Sonnet 5\.5 at high effort: 5-hour 60%, weekly 8%/)
  assert.match(text, /step 2 \[cut\] 1 SP, —: 5-hour 4\.8%, weekly 0\.6%/)
  assert.match(text, /Sum of the steps: 5-hour 64\.8%, weekly 8\.6%\. .*the threshold is 90%/)
  assert.match(
    call(['estimate', '1'], scratch, { plan: 'Max 5x' }).lines[0],
    /subscription pro \(the local profile file\)/
  )
})

test('the plan the account reports names the subscription when nothing else does', () => {
  const scratch = project()
  assert.match(
    call(['estimate', '1'], scratch, { plan: 'Max 5x' }).lines[0],
    /subscription max5x \(the plan the account reports \(Max 5x\)\)/
  )
})

test('gate lets a step through, waits for a reset, stops, or asks, and its exit code says whether the step may start', () => {
  const scratch = project('{ "usage": { "subscription": "max5x" } }')
  const go = call(['gate', '1', '1'], scratch, READING)
  assert.equal(go.code, 0)
  assert.equal(go.lines[0], 'Gate: GO — the step fits.')
  assert.match(
    go.lines[1],
    /^Step 1 of flow 1 \[tasks\]: 5-hour 12%, weekly 1\.6% .*safety factor 1\.2, thresholds 5-hour 85%, weekly 90%/
  )
  assert.equal(
    go.lines[2],
    'Usage read: 5-hour 30% (resets 2026-11-05T12:30:00Z) · weekly 7% (resets 2026-11-10T07:00:00Z).'
  )

  const wait = call(['gate', '1', '1'], scratch, { ...READING, 'five-hour': '80@2026-11-05T12:30:00Z' })
  assert.equal(wait.code, 1)
  assert.match(wait.lines[0], /^Gate: WAIT until 2026-11-05T12:30:00Z/)
  // the same reading after the reset goes
  assert.equal(
    call(['gate', '1', '1'], scratch, { ...READING, 'five-hour': '80@2026-11-05T12:30:00Z' }, '2026-11-05T12:31:00Z')
      .code,
    0
  )

  const stop = call(['gate', '1', '1'], scratch, { ...READING, weekly: '89@2026-11-10T07:00:00Z' })
  assert.equal(stop.code, 1)
  assert.match(stop.lines[0], /^Gate: STOP/)

  const ask = call(['gate', '1', '1'], scratch)
  assert.equal(ask.code, 1)
  assert.match(ask.lines[0], /^Gate: ASK/)
  assert.match(ask.lines.join('\n'), /Claude desktop app: call get_usage \{\}.*plan\.windows/)
  assert.match(ask.lines.join('\n'), /the command line: Ask the owner for the percent used/)
})

test('gate refuses a bad reading, an unknown step and a bad time; --at moves the clock', () => {
  const scratch = project('{ "usage": { "subscription": "pro" } }')
  assert.equal(call(['gate', '1', '9'], scratch, READING).code, 1)
  const bad = call(['gate', '1', '1'], scratch, { 'five-hour': 'x' })
  assert.equal(bad.code, 2)
  assert.match(bad.lines[0], /--five-hour: "x" is not <percent>/)
  assert.match(call(['gate', '1', '1'], scratch, { ...READING, at: 'soon' }).lines[0], /--at is not a time/)
  const late = call(['gate', '1', '1'], scratch, {
    'five-hour': '90@2026-11-05T12:30:00Z',
    weekly: '7@2026-11-10T07:00:00Z',
    at: '2026-11-05T13:00:00Z'
  })
  assert.match(
    late.lines.join('\n'),
    /5-hour window reset at 2026-11-05T12:30:00Z, after the reading: counted as empty/
  )
  // a step too big for an empty window says to split it (5 SP of Opus on Pro)
  const big = project('{ "usage": { "subscription": "pro" } }')
  big.write(
    'plan/flows/flow-1-ship-one.md',
    FLOW('{ "usage": { "subscription": "pro" } }').replace('| 5 | — | C2 |', '| 8 | — | C2 |')
  )
  const split = call(['gate', '1', '1'], big, READING)
  assert.match(split.lines.join('\n'), /Gate: STOP[\s\S]*of an empty window: split it/)
})

test('sample appends a line to usage.jsonl, prints the log line and the measured use of a step against its estimate', () => {
  const scratch = project('{ "usage": { "subscription": "max5x" } }')
  const start = call(['sample', '1', 'step-start', '1'], scratch, { ...READING, start: 'cold' })
  assert.equal(start.code, 0)
  assert.deepEqual(start.lines.slice(0, 2), [
    'Appended a step-start sample to usage.jsonl.',
    'Log line: - **Usage before:** 5-hour 30% (resets 2026-11-05T12:30:00Z) · weekly 7% (resets 2026-11-10T07:00:00Z)'
  ])
  const end = call(
    ['sample', '1', 'step-end', '1'],
    scratch,
    { 'five-hour': '41@2026-11-05T12:30:00Z', weekly: '8@2026-11-10T07:00:00Z', tokens: '250000' },
    '2026-11-05T11:00:00Z'
  )
  assert.equal(end.code, 0)
  assert.match(end.lines[1], /Usage after:\*\* 5-hour 41%/)
  assert.match(end.lines[2], /Measured use of step 1: 5-hour \+11%, weekly \+1%; estimated 5-hour 12%, weekly 1\.6%/)
  const lines = readFileSync(join(scratch.root, SAMPLES), 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
  assert.equal(lines.length, 2)
  assert.deepEqual(
    {
      event: lines[1].event,
      step: lines[1].step,
      kind: lines[1].kind,
      sp: lines[1].sp,
      model: lines[1].model,
      subscription: lines[1].subscription,
      tokens: lines[1].tokens
    },
    {
      event: 'step-end',
      step: '1',
      kind: 'tasks',
      sp: 5,
      model: 'Sonnet 5.5 at high effort',
      subscription: 'max5x',
      tokens: 250000
    }
  )
  assert.equal(lines[0].start, 'cold')
  assert.equal(lines[1].at, '2026-11-05T11:00:00.000Z')
  // the check accepts the file
  assert.equal(call(['check'], scratch).code, 0)
})

test('a sample whose window reset in between counts for nothing, and a flow sample names no step', () => {
  const scratch = project()
  call(['sample', '1', 'step-start', '1'], scratch, READING)
  const end = call(
    ['sample', '1', 'step-end', '1'],
    scratch,
    { 'five-hour': '3@2026-11-05T17:30:00Z', weekly: '8@2026-11-10T07:00:00Z' },
    '2026-11-05T14:00:00Z'
  )
  assert.match(
    end.lines[2],
    /Measured use of step 1: weekly \+1%; the fiveHour window reset in between, so that part is cut/
  )
  assert.match(end.lines[2], /estimated not estimated/)
  assert.equal(call(['sample', '1', 'flow-start'], scratch, READING).code, 0)
  assert.equal(
    call(['sample', '1', 'flow-end'], scratch, READING).lines[0],
    'Appended a flow-end sample to usage.jsonl.'
  )
})

test('sample refuses what it cannot write: no reading, no step, a step on a flow event, a bad event, start or tokens', () => {
  const scratch = project()
  const refused = (words, flags) => call(words, scratch, flags)
  assert.match(refused(['sample', '1', 'step-start', '1']).lines[0], /needs the reading/)
  assert.match(refused(['sample', '1', 'step-start'], READING).lines[0], /step-start names its step/)
  assert.match(refused(['sample', '1', 'flow-start', '1'], READING).lines[0], /flow-start names no step/)
  assert.match(refused(['sample', '1', 'step-start', '9'], READING).lines[0], /has no step 9/)
  assert.match(refused(['sample', '1', 'tea', '1'], READING).lines[0], /A sample event is one of/)
  assert.match(
    refused(['sample', '1', 'step-start', '1'], { ...READING, start: 'tepid' }).lines[0],
    /--start is cold or warm/
  )
  assert.match(
    refused(['sample', '1', 'step-start', '1'], { ...READING, tokens: 'lots' }).lines[0],
    /--tokens is a number/
  )
  assert.equal(existsSync(join(scratch.root, SAMPLES)), false)
})

test('flow check flags a step that does not fit one window where the subscription is known, and a bad line of usage.jsonl', () => {
  const scratch = project('{ "usage": { "subscription": "pro" } }')
  assert.equal(call(['check'], scratch).code, 0)
  scratch.write(
    'plan/flows/flow-1-ship-one.md',
    FLOW('{ "usage": { "subscription": "pro" } }').replace('| 5 | — | C2 |', '| 8 | — | C2 |')
  )
  planSummary({ root: scratch.root, profile: scratch.profile })
  const big = call(['check'], scratch)
  assert.equal(big.code, 1)
  assert.match(
    big.lines.join('\n'),
    /plan\/flows\/flow-1-ship-one\.md: step 1: its estimate of 96% of the 5-hour window \(times 1\.2\) does not fit within the threshold 85% even when the window is empty; split the step/
  )
  // on a larger subscription the same step fits; an unknown subscription is not checked
  scratch.write(
    'plan/flows/flow-1-ship-one.md',
    FLOW('{ "usage": { "subscription": "max5x" } }').replace('| 5 | — | C2 |', '| 8 | — | C2 |')
  )
  planSummary({ root: scratch.root, profile: scratch.profile })
  assert.equal(call(['check'], scratch).code, 0)
  scratch.write(
    'plan/flows/usage.jsonl',
    '{"v":1,"at":"2026-11-05T10:00:00Z","flow":1,"event":"flow-start"}\nnot json\n'
  )
  const bad = call(['check'], scratch)
  assert.equal(bad.code, 1)
  assert.match(bad.lines.join('\n'), /plan\/flows\/usage\.jsonl: line 2: is not JSON/)
})

test('dispatch adds the estimate, how to read the usage, the gate and the samples around the step', () => {
  const scratch = project('{ "usage": { "subscription": "pro" } }')
  const { lines, code } = call(['dispatch', '1', '1'], scratch)
  assert.equal(code, 0)
  const text = lines.join('\n')
  assert.match(text, /Usage: the step is estimated at 5-hour 60%, weekly 8% \(subscription pro \(the flow's setting\)/)
  assert.match(text, /call get_usage \{\}/)
  assert.match(
    text,
    /flow gate 1 1 --five-hour <percent>@<reset time> --weekly <percent>@<reset time>`: start the step only on GO/
  )
  assert.match(text, /flow sample 1 step-start 1 .* --start cold/)
})
