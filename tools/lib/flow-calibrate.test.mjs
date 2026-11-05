// `harness flow calibrate` (task 5.7): the measured steps, the medians per model and step kind, the tokens converted to percent, the dropped cut windows, the cold
// and warm comparison, and the report, on a fixture of samples.
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { usageFor } from '../../adapters/runtime/claude-code/usage.mjs'
import {
  calibrationReport,
  flowTotals,
  measuredSteps,
  median,
  proposals,
  tokensPerPercent,
  warmComparison
} from './flow-calibrate.mjs'
import { flowCommand } from './flow-command.mjs'
import { planSummary } from './plan.mjs'
import { ADAPTER_RUNTIMES } from './runtimes.mjs'

const usage = usageFor()
const RESET = '2026-11-05T12:00:00Z'
const WEEK = '2026-11-10T07:00:00Z'
let clock = 0

// One measured step as its two samples; `five` and `weekly` are [before, after] percents, `cut` an after-reading from a window that reset in between
function pair({
  flow = 1,
  step,
  sp = 5,
  kind = 'tasks',
  model = 'Sonnet 5.5 at high effort',
  start = null,
  five,
  weekly,
  tokens,
  cost,
  subscription = 'pro',
  fiveReset = '2026-11-05T23:00:00Z'
}) {
  const at = () => new Date(Date.UTC(2026, 10, 5, 8, 0, 0) + 60000 * (clock += 1)).toISOString()
  const window = (percents, i, reset) => (percents ? { percent: percents[i], resetsAt: reset } : {})
  const common = { v: 1, flow, step: String(step), kind, sp, model, subscription }
  const begin = { ...common, at: at(), event: 'step-start', ...(start ? { start } : {}) }
  const end = { ...common, at: at(), event: 'step-end', ...(tokens ? { tokens } : {}) }
  if (five)
    (Object.assign(begin, { fiveHour: window(five, 0, fiveReset) }),
      Object.assign(end, { fiveHour: window(five, 1, fiveReset) }))
  if (weekly)
    (Object.assign(begin, { weekly: window(weekly, 0, WEEK) }), Object.assign(end, { weekly: window(weekly, 1, WEEK) }))
  if (cost) (Object.assign(begin, { cost: cost[0] }), Object.assign(end, { cost: cost[1] }))
  return [begin, end]
}

// The group pro / sonnet / tasks: 9 and 5 and 9 and 4 percent of the 5-hour window per SP, one step cut by a reset
const PERCENTS = [
  ...pair({ step: 1, start: 'cold', five: [10, 55], weekly: [1, 5] }),
  ...pair({ step: 2, start: 'warm', five: [55, 80], weekly: [5, 7] }),
  ...pair({ step: 3, sp: 4, start: 'cold', five: [5, 41], weekly: [7, 10.2] }),
  ...pair({ step: 4, start: 'warm', five: [41, 61], weekly: [10.2, 12.7] }),
  ...pair({ step: 5, start: 'cold', five: [90, 10], weekly: [12.7, 17.7], fiveReset: RESET }),
  ...pair({ step: 6, kind: 'cut', sp: 1, five: [10, 12], weekly: [17.7, 18] })
]

test('the median of a list', () => {
  assert.equal(median([]), null)
  assert.equal(median([3]), 3)
  assert.equal(median([9, 5, 9, 4]), 7)
  assert.equal(median([1, 100, 2]), 2)
})

test('each step end is paired with its own step start; a window that a reset cut is marked, and an unpaired sample is counted', () => {
  const { steps, unpaired } = measuredSteps(PERCENTS)
  assert.equal(steps.length, 6)
  assert.equal(unpaired, 0)
  assert.deepEqual(steps[0].delta, { cut: [], fiveHour: 45, weekly: 4 })
  assert.equal(steps[0].model, 'sonnet')
  assert.equal(steps[0].start, 'cold')
  assert.deepEqual(steps[4].delta, { cut: ['fiveHour'], weekly: 5 })
  const lone = measuredSteps([PERCENTS[1], ...PERCENTS.slice(2, 4), PERCENTS[0]])
  assert.equal(lone.steps.length, 1)
  assert.equal(lone.unpaired, 2)
  // a step that ended partial and was continued pairs each end with its own start
  const again = [
    ...pair({ step: 1, five: [10, 20], weekly: [1, 2] }),
    ...pair({ step: 1, five: [20, 40], weekly: [2, 3] })
  ]
  assert.deepEqual(
    measuredSteps(again).steps.map((step) => step.delta.fiveHour),
    [10, 20]
  )
})

test('the proposal is the median per SP of each window; a step that a reset cut is dropped from that window only', () => {
  const { steps } = measuredSteps(PERCENTS)
  const [cut, tasks] = proposals({ steps, usage })
  assert.deepEqual(
    { ...tasks, steps: tasks.steps },
    {
      subscription: 'pro',
      model: 'sonnet',
      kind: 'tasks',
      steps: 5,
      n: 4,
      used: { fiveHour: { n: 4, basis: 'percent' }, weekly: { n: 5, basis: 'percent' } },
      proposed: { fiveHour: 7, weekly: 0.8 },
      current: { fiveHour: 12, weekly: 1.6 },
      enough: true,
      unknownTable: false
    }
  )
  assert.equal(cut.kind, 'cut')
  assert.equal(cut.enough, false)
  assert.deepEqual(cut.proposed, { fiveHour: 2, weekly: 0.3 })
  assert.deepEqual(cut.current, { fiveHour: 3.42, weekly: 1.03 })
  assert.equal(
    proposals({ steps, usage, min: 1 }).every((row) => row.enough),
    true
  )
  assert.deepEqual(proposals({ steps, usage, subscription: 'max5x' }), [])
})

test('tokens are converted to percent per subscription over all the steps together, and rescue a step that a reset cut', () => {
  const steps = [
    ...pair({ step: 1, subscription: 'max20x', five: [10, 12], weekly: [1, 2], tokens: 1000000 }),
    ...pair({ step: 2, subscription: 'max20x', five: [12, 16], weekly: [2, 3], tokens: 2000000 }),
    ...pair({ step: 3, subscription: 'max20x', five: [16, 19], weekly: [3, 4], tokens: 1500000 }),
    ...pair({ step: 4, subscription: 'max20x', five: [90, 3], weekly: [4, 5], tokens: 2500000, fiveReset: RESET })
  ]
  const { steps: measured } = measuredSteps(steps)
  const rates = tokensPerPercent(measured)
  assert.equal(rates.get('max20x/fiveHour').perPercent, 500000)
  assert.equal(rates.get('max20x/weekly').perPercent, 1750000)
  const [row] = proposals({ steps: measured, usage })
  assert.deepEqual(row.proposed, { fiveHour: 0.7, weekly: 0.2 })
  assert.deepEqual(row.used, { fiveHour: { n: 4, basis: 'tokens' }, weekly: { n: 4, basis: 'tokens' } })
  assert.equal(row.n, 4)
})

test('money on an API key is calibrated from the cost, which no reset cuts', () => {
  const steps = [1, 2, 3].flatMap((step) =>
    pair({ step, sp: 2, subscription: 'api', cost: [step * 10, step * 10 + 6] })
  )
  const [row] = proposals({ steps: measuredSteps(steps).steps, usage })
  assert.deepEqual(row.proposed, { usd: 3 })
  assert.deepEqual(row.current, { usd: 2 })
  assert.equal(row.enough, true)
})

test("a warm start pays off when its use per SP is a clearly smaller share of a cold start's, and not when it is not", () => {
  const pays = warmComparison({ steps: measuredSteps(PERCENTS).steps })
  assert.equal(pays.verdict, 'pays')
  assert.equal(pays.ratio, 0.5)
  assert.deepEqual(pays.groups, [
    {
      subscription: 'pro',
      model: 'sonnet',
      kind: 'tasks',
      measure: '5-hour %/SP',
      cold: { n: 2, median: 9 },
      warm: { n: 2, median: 4.5 },
      ratio: 0.5
    }
  ])
  const same = [
    ...pair({ step: 1, start: 'cold', five: [0, 40] }),
    ...pair({ step: 2, start: 'cold', five: [40, 80] }),
    ...pair({ step: 3, start: 'warm', five: [0, 38] }),
    ...pair({ step: 4, start: 'warm', five: [38, 76] })
  ]
  const no = warmComparison({ steps: measuredSteps(same).steps })
  assert.equal(no.verdict, 'does-not-pay')
  assert.equal(no.ratio, 0.95)
  // steps that do not say how they started, or too few of one side, give no verdict
  assert.equal(
    warmComparison({ steps: measuredSteps(same.map((sample) => ({ ...sample, start: undefined }))).steps }).verdict,
    'unknown'
  )
  assert.equal(warmComparison({ steps: measuredSteps(PERCENTS.slice(0, 4)).steps }).verdict, 'unknown')
  // tokens, where every step has them, are the measure
  const tokens = [
    ...pair({ step: 1, start: 'cold', five: [0, 40], tokens: 800000 }),
    ...pair({ step: 2, start: 'cold', five: [40, 80], tokens: 800000 }),
    ...pair({ step: 3, start: 'warm', five: [0, 38], tokens: 400000 }),
    ...pair({ step: 4, start: 'warm', five: [38, 76], tokens: 400000 })
  ]
  const byTokens = warmComparison({ steps: measuredSteps(tokens).steps })
  assert.equal(byTokens.groups[0].measure, 'tokens/SP')
  assert.equal(byTokens.verdict, 'pays')
})

test('whole flows are set against their steps', () => {
  const samples = [
    {
      v: 1,
      at: '2026-11-05T08:00:00Z',
      flow: 1,
      event: 'flow-start',
      fiveHour: { percent: 5, resetsAt: '2026-11-05T23:00:00Z' }
    },
    ...pair({ step: 1, five: [6, 36] }),
    {
      v: 1,
      at: '2026-11-05T20:00:00Z',
      flow: 1,
      event: 'flow-end',
      fiveHour: { percent: 40, resetsAt: '2026-11-05T23:00:00Z' }
    }
  ]
  assert.deepEqual(flowTotals(samples, measuredSteps(samples).steps), [
    { flow: 1, window: 'fiveHour', used: 35, steps: 30, rest: 5 }
  ])
})

test('the report names the proposals, the cold and warm verdict and the limits, and writes nothing', () => {
  const { lines, proposals: accepted } = calibrationReport({
    samples: PERCENTS,
    usage,
    runtime: 'claude-code',
    file: 'plan/flows/usage.jsonl'
  })
  const text = lines.join('\n')
  assert.match(
    lines[0],
    /^Calibration from plan\/flows\/usage\.jsonl: 12 sample\(s\), 6 measured step\(s\), 1 with a window that a reset cut\./
  )
  assert.match(
    text,
    /pro · sonnet · tasks: 5-hour 7%, weekly 0\.8% \(table: 5-hour 12%, weekly 1\.6%\), n=4, from percents/
  )
  assert.match(
    text,
    /pro · sonnet · cut: 5-hour 2%, weekly 0\.3% \(table: .*\), n=1, from percents — fewer than 3, no proposal/
  )
  assert.match(text, /pro\.perSp\.sonnet\.tasks = \{ ?fiveHour: 7, weekly: 0\.8 ?\}/)
  assert.doesNotMatch(text, /pro\.perSp\.sonnet\.cut/)
  assert.match(text, /cold 9 5-hour %\/SP \(n=2\), warm 4\.5 \(n=2\), warm is 0\.5 of cold/)
  assert.match(text, /Warm starts pay off \(median 0\.5 of a cold start, at most 0\.9\): keep `reuse: auto`/)
  assert.match(text, /Limits of the data: .*owner's parallel work/)
  assert.deepEqual(
    accepted.map((row) => `${row.model}/${row.kind}`),
    ['sonnet/tasks']
  )
  assert.match(
    calibrationReport({ samples: [], usage, runtime: null, file: 'f' }).lines.join('\n'),
    /nothing to calibrate yet/
  )
  const none = calibrationReport({ samples: PERCENTS.slice(0, 4), usage, runtime: 'claude-code', file: 'f', min: 9 })
  assert.match(none.lines.join('\n'), /No coefficient has enough measured steps to propose/)
  assert.match(none.lines.join('\n'), /Warm starts do not pay|Not enough data/)
  const bad = calibrationReport({ samples: [], problems: ['line 2: is not JSON'], usage, runtime: null, file: 'f' })
  assert.match(bad.lines[1], /! f: line 2: is not JSON/)
})

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

function project() {
  const root = mkdtempSync(join(tmpdir(), 'flow-calibrate-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  cpSync(join(import.meta.dirname, '..', '..', 'core'), join(root, 'core'), { recursive: true })
  const profile = {
    project: { title: 'Demo', entryFile: 'AGENTS.md' },
    branches: { integration: 'develop', production: 'main' },
    adapters: { runtimes: ['claude-code'] },
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
  planSummary({ root, profile })
  return { root, profile, write }
}
const call = (words, { root, profile }, flags = {}) =>
  flowCommand({ words, flags, root, profile, runtimes: ADAPTER_RUNTIMES })

test('flow calibrate reads usage.jsonl through the command line, proposes, writes nothing, and refuses a bad --min', () => {
  const scratch = project()
  assert.match(
    call(['calibrate'], scratch).lines.join('\n'),
    /Calibration from plan\/flows\/usage\.jsonl: 0 sample\(s\).*nothing to calibrate yet/s
  )
  const file = `${PERCENTS.map((sample) => JSON.stringify(sample)).join('\n')}\nnot json\n`
  scratch.write('plan/flows/usage.jsonl', file)
  const { lines, code } = call(['calibrate'], scratch)
  assert.equal(code, 0)
  const text = lines.join('\n')
  assert.match(text, /12 sample\(s\), 6 measured step\(s\)/)
  assert.match(text, /! plan\/flows\/usage\.jsonl: line 13: is not JSON/)
  assert.match(text, /pro\.perSp\.sonnet\.tasks = /)
  assert.equal(readFileSync(join(scratch.root, 'plan/flows/usage.jsonl'), 'utf8'), file)
  assert.equal(existsSync(join(scratch.root, 'adapters')), false)
  assert.match(
    call(['calibrate'], scratch, { min: '1' }).lines.join('\n'),
    /pro · sonnet · cut: .*n=1, from percents\n/
  )
  assert.match(call(['calibrate'], scratch, { min: '0' }).lines[0], /--min is a whole number/)
  assert.doesNotMatch(call(['calibrate'], scratch, { subscription: 'max5x' }).lines.join('\n'), /pro · sonnet/)
  assert.equal(call(['calibrate', '1'], scratch).code, 2)
})
