// The usage of a flow (task 5.6): the estimate of a step, the gate (under, over, a reset in between, no reading), the fit of a step in a window and the samples.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { usageFor as claudeCode } from '../../adapters/runtime/claude-code/usage.mjs'
import { usageFor as cursor } from '../../adapters/runtime/cursor/usage.mjs'
import { parseStep } from './flow-steps.mjs'
import {
  appendSample,
  coefficientFor,
  estimateStep,
  estimateText,
  fitProblems,
  flowEstimate,
  gateStep,
  makeSample,
  modelFamily,
  parseSamples,
  parseWindow,
  readingFromFlags,
  readingText,
  resolveSubscription,
  runtimeUsage,
  stepDelta,
  usageProblems
} from './flow-usage.mjs'

const profile = {
  plan: {
    complexity: {
      models: { C1: 'Sonnet 5.5 at medium effort', C2: 'Sonnet 5.5 at high effort', C3: 'Opus 5.5 at high effort' }
    }
  }
}
const usage = claudeCode()
const step = (fields) =>
  parseStep({
    '#': '1',
    kind: 'tasks',
    repo: 'home',
    scope: '1.1',
    needs: '—',
    'stops for': '—',
    sp: '5',
    'est. usage': '—',
    model: 'C2',
    state: '⬜',
    ...fields
  })
const ESTIMATE = { known: true, unit: 'percent', fiveHour: 20, weekly: 5 }
const STOP_AT = { fiveHour: 85, weekly: 90 }
const NOW = '2026-11-05T10:00:00Z'
const reading = (five, weekly, fiveReset = '2026-11-05T12:30:00Z', weeklyReset = '2026-11-10T07:00:00Z') => ({
  fiveHour: { percent: five, resetsAt: fiveReset },
  weekly: { percent: weekly, resetsAt: weeklyReset }
})

test('the tables of both presets meet the contract, and an incomplete one does not', () => {
  assert.deepEqual(usageProblems(claudeCode()), [])
  assert.deepEqual(usageProblems(cursor()), [])
  assert.match(usageProblems({ means: 'x', read: () => [], subscriptions: {} }).join(), /returns no means/)
  const broken = claudeCode()
  broken.subscriptions.pro.perSp.sonnet.default.weekly = 0
  broken.subscriptions.api.perSp.opus = {}
  assert.match(usageProblems(broken).join('\n'), /"pro", sonnet, default: needs a positive fiveHour and weekly/)
  assert.match(usageProblems(broken).join('\n'), /"api", opus: has no default row/)
})

test('the model family, and the coefficient of a model and a kind: a calibrated row wins over the default times the kind factor', () => {
  assert.equal(modelFamily('Sonnet 5.5'), 'sonnet')
  assert.equal(modelFamily('claude-opus-5-5'), 'opus')
  assert.equal(modelFamily(null), null)
  const pro = usage.subscriptions.pro
  assert.deepEqual(coefficientFor(pro, 'sonnet', 'tasks'), { fiveHour: 12, weekly: 1.6, source: 'default' })
  assert.equal(coefficientFor(pro, 'sonnet', 'cut').fiveHour, 4.8)
  const calibrated = structuredClone(pro)
  calibrated.perSp.sonnet.cut = { fiveHour: 9, weekly: 1 }
  assert.deepEqual(coefficientFor(calibrated, 'sonnet', 'cut'), { fiveHour: 9, weekly: 1, source: 'calibrated' })
  assert.equal(coefficientFor(pro, 'unknown', 'tasks'), null)
})

test('the estimate of a step is its SP times the coefficient of its model, kind and subscription; the larger subscriptions are lower, the API is money', () => {
  const task = step({})
  assert.deepEqual(estimateStep({ step: task, profile, usage, subscription: 'pro' }), {
    known: true,
    unit: 'percent',
    model: 'sonnet',
    source: 'default',
    fiveHour: 60,
    weekly: 8
  })
  assert.equal(estimateStep({ step: task, profile, usage, subscription: 'max5x' }).fiveHour, 12)
  assert.equal(estimateStep({ step: task, profile, usage, subscription: 'max20x' }).fiveHour, 3)
  const opus = estimateStep({ step: step({ model: 'C3' }), profile, usage, subscription: 'pro' })
  assert.equal(opus.fiveHour, 100)
  assert.equal(
    estimateStep({ step: step({ kind: 'cut', sp: '1', model: '—' }), profile, usage, subscription: 'pro' }).fiveHour,
    4.8
  )
  assert.deepEqual(estimateStep({ step: task, profile, usage, subscription: 'api' }), {
    known: true,
    unit: 'usd',
    model: 'sonnet',
    source: 'default',
    usd: 10
  })
  assert.equal(estimateText(estimateStep({ step: task, profile, usage, subscription: 'pro' })), '5-hour 60%, weekly 8%')
  assert.equal(estimateText(estimateStep({ step: task, profile, usage, subscription: 'api' })), '$10.00')
})

test('a step that cannot be estimated says why, and the mock of Cursor estimates any model', () => {
  assert.match(estimateStep({ step: step({}), profile, usage, subscription: null }).why, /no subscription is known/)
  assert.match(estimateStep({ step: step({}), profile, usage, subscription: 'team' }).why, /no subscription "team"/)
  assert.match(estimateStep({ step: step({ sp: '—' }), profile, usage, subscription: 'pro' }).why, /no SP/)
  assert.match(
    estimateText(
      estimateStep({ step: step({}), profile, usage: { ...usage, subscriptions: {} }, subscription: 'pro' })
    ),
    /^not estimated/
  )
  assert.equal(estimateStep({ step: step({}), profile, usage: cursor(), subscription: 'mock' }).fiveHour, 5)
})

test('the subscription comes from the flow, else the local profile file, else the plan the account reports', () => {
  const flow = (subscription) => ({ settings: { usage: { subscription } } })
  assert.deepEqual(resolveSubscription({ flow: flow('max5x'), local: { usage: { subscription: 'pro' } }, usage }), {
    id: 'max5x',
    from: "the flow's setting"
  })
  assert.deepEqual(resolveSubscription({ flow: flow('local'), local: { usage: { subscription: 'pro' } }, usage }), {
    id: 'pro',
    from: 'the local profile file'
  })
  assert.deepEqual(resolveSubscription({ flow: flow('local'), local: {}, plan: 'Max 5x', usage }).id, 'max5x')
  assert.equal(resolveSubscription({ flow: flow('local'), local: {}, plan: 'Team', usage }).id, null)
  assert.equal(resolveSubscription({ flow: flow('local'), local: {}, usage }).id, null)
})

test('the runtime adapter that fills usage is used, and a project without one gets the manual usage that asks the owner', () => {
  const runtimes = {
    'claude-code': {
      manifest: { roles: { usage: { module: 'usage.mjs', export: 'usageFor' } } },
      modules: { 'usage.mjs': { usageFor: claudeCode } }
    }
  }
  assert.equal(runtimeUsage({ adapters: { runtimes: ['claude-code'] } }, runtimes).runtime, 'claude-code')
  const manual = runtimeUsage({ adapters: { runtimes: [] } }, runtimes)
  assert.equal(manual.runtime, null)
  assert.ok(manual.usage.read()[0].owner)
  assert.deepEqual(usageProblems(manual.usage), [])
})

test('the gate lets a step through that fits, with the safety factor on the estimate', () => {
  const gate = gateStep({ estimate: ESTIMATE, reading: reading(40, 50), stopAt: STOP_AT, now: NOW })
  assert.equal(gate.decision, 'go')
  assert.match(gate.reasons.join('\n'), /5-hour window: 40% \+ 24% stays within 85%/)
  // 61 + 20 * 1.2 = 85 is within; 62 is over
  assert.equal(gateStep({ estimate: ESTIMATE, reading: reading(61, 50), stopAt: STOP_AT, now: NOW }).decision, 'go')
  assert.equal(gateStep({ estimate: ESTIMATE, reading: reading(62, 50), stopAt: STOP_AT, now: NOW }).decision, 'wait')
})

test('over the 5-hour threshold the gate waits for its reset; over the weekly one, or past the wait it allows, it stops', () => {
  const wait = gateStep({ estimate: ESTIMATE, reading: reading(70, 50), stopAt: STOP_AT, now: NOW })
  assert.equal(wait.decision, 'wait')
  assert.equal(wait.until, '2026-11-05T12:30:00Z')
  assert.match(wait.reasons.join('\n'), /resets at 2026-11-05T12:30:00Z, in 150 minutes/)
  const weekly = gateStep({ estimate: ESTIMATE, reading: reading(10, 88), stopAt: STOP_AT, now: NOW })
  assert.equal(weekly.decision, 'stop')
  assert.match(weekly.reasons.join('\n'), /weekly window is at 88%.*beyond the 300 minutes to wait/)
  const patient = gateStep({
    estimate: ESTIMATE,
    reading: reading(10, 88),
    stopAt: STOP_AT,
    now: NOW,
    maxWaitMinutes: 99999
  })
  assert.equal(patient.decision, 'wait')
  assert.equal(patient.until, '2026-11-10T07:00:00Z')
  const both = gateStep({
    estimate: ESTIMATE,
    reading: reading(80, 88),
    stopAt: STOP_AT,
    now: NOW,
    maxWaitMinutes: 99999
  })
  assert.equal(both.until, '2026-11-10T07:00:00Z')
  const noReset = gateStep({
    estimate: ESTIMATE,
    reading: { fiveHour: { percent: 80, resetsAt: null }, weekly: { percent: 1, resetsAt: null } },
    stopAt: STOP_AT,
    now: NOW
  })
  assert.equal(noReset.decision, 'stop')
  assert.match(noReset.reasons.join('\n'), /no reset time/)
})

test('a window that reset after the reading counts as empty, so the step goes', () => {
  const gate = gateStep({
    estimate: ESTIMATE,
    reading: reading(95, 50, '2026-11-05T09:30:00Z'),
    stopAt: STOP_AT,
    now: NOW
  })
  assert.equal(gate.decision, 'go')
  assert.match(
    gate.reasons.join('\n'),
    /5-hour window reset at 2026-11-05T09:30:00Z, after the reading: counted as empty/
  )
  // a wait that ends at the reset: asked again after it, the same reading goes
  const wait = gateStep({ estimate: ESTIMATE, reading: reading(95, 50), stopAt: STOP_AT, now: NOW })
  assert.equal(wait.decision, 'wait')
  assert.equal(
    gateStep({ estimate: ESTIMATE, reading: reading(95, 50), stopAt: STOP_AT, now: wait.until }).decision,
    'go'
  )
})

test('a step that cannot fit an empty window stops the gate: it is to be split', () => {
  const gate = gateStep({ estimate: { ...ESTIMATE, fiveHour: 75 }, reading: reading(0, 0), stopAt: STOP_AT, now: NOW })
  assert.equal(gate.decision, 'stop')
  assert.match(
    gate.reasons.join('\n'),
    /needs 90% of the 5-hour window.*more than the threshold 85% of an empty window: split it/
  )
})

test('without a reading the gate asks; without an estimate it checks the current use only; on an API key the cost is the window', () => {
  assert.equal(gateStep({ estimate: ESTIMATE, reading: null, stopAt: STOP_AT, now: NOW }).decision, 'ask')
  assert.equal(
    gateStep({ estimate: ESTIMATE, reading: { fiveHour: { percent: 10, resetsAt: null } }, stopAt: STOP_AT, now: NOW })
      .decision,
    'ask'
  )
  const unknown = { known: false, why: 'no subscription is known' }
  const blind = gateStep({ estimate: unknown, reading: reading(90, 10), stopAt: STOP_AT, now: NOW })
  assert.equal(blind.decision, 'wait')
  assert.match(blind.reasons[0], /no estimate \(no subscription is known\): only the current use is checked/)
  assert.equal(gateStep({ estimate: unknown, reading: reading(10, 10), stopAt: STOP_AT, now: NOW }).decision, 'go')
  const api = { known: true, unit: 'usd', usd: 4 }
  assert.equal(gateStep({ estimate: api, reading: { cost: 10 }, stopAt: { cost: 20 }, now: NOW }).decision, 'go')
  assert.equal(gateStep({ estimate: api, reading: { cost: 16 }, stopAt: { cost: 20 }, now: NOW }).decision, 'stop')
  assert.equal(gateStep({ estimate: api, reading: { cost: 1 }, stopAt: {}, now: NOW }).decision, 'ask')
})

test('a window reading is parsed from <percent>[@<reset>], and the reading from the flags', () => {
  assert.deepEqual(parseWindow('26@2026-11-05T12:30:00Z'), { percent: 26, resetsAt: '2026-11-05T12:30:00Z' })
  assert.deepEqual(parseWindow('26%'), { percent: 26, resetsAt: null })
  assert.match(parseWindow('x').error, /is not <percent>/)
  assert.match(parseWindow('120').error, /at most 100%/)
  assert.match(parseWindow('5@tomorrow').error, /is not a time/)
  const { reading: read, errors } = readingFromFlags({
    'five-hour': '26@2026-11-05T12:30:00Z',
    weekly: '7',
    cost: '1.5'
  })
  assert.deepEqual(errors, [])
  assert.equal(readingText(read), '5-hour 26% (resets 2026-11-05T12:30:00Z) · weekly 7% · spent $1.50')
  assert.equal(readingFromFlags({}).reading, null)
  assert.equal(readingText(null), 'not read')
  assert.equal(readingFromFlags({ weekly: 'x', cost: 'many' }).errors.length, 2)
})

test('a step that does not fit one window is flagged where the subscription is known, and the flow is sized from its steps', () => {
  const flow = {
    settings: { usage: { stopAt: STOP_AT } },
    steps: [step({}), step({ '#': '2', sp: '8', model: 'C3' }), step({ '#': '3', kind: 'cut', sp: '1', model: '—' })]
  }
  const problems = fitProblems({ flow, profile, usage, subscription: 'pro' })
  assert.equal(problems.length, 1)
  assert.match(
    problems[0],
    /^step 2: its estimate of 160% of the 5-hour window \(times 1\.2\) does not fit within the threshold 85%.*split the step/
  )
  assert.deepEqual(fitProblems({ flow, profile, usage, subscription: 'max5x' }), [])
  assert.deepEqual(fitProblems({ flow, profile, usage, subscription: null }), [])
  const sized = flowEstimate({ flow, profile, usage, subscription: 'max5x' })
  assert.deepEqual(sized.total, { fiveHour: 45, weekly: 6 })
  assert.equal(sized.partial, false)
  assert.equal(flowEstimate({ flow, profile, usage, subscription: null }).total, null)
})

test('samples are written one JSON line each, read back, and a bad line is named', () => {
  const task = step({})
  const start = makeSample({
    at: '2026-11-05T10:00:00.000Z',
    flow: 1,
    event: 'step-start',
    step: task,
    reading: reading(20, 5),
    model: 'Sonnet 5.5',
    start: 'cold',
    subscription: 'pro'
  })
  assert.deepEqual(start, {
    v: 1,
    at: '2026-11-05T10:00:00.000Z',
    flow: 1,
    event: 'step-start',
    step: '1',
    kind: 'tasks',
    sp: 5,
    model: 'Sonnet 5.5',
    start: 'cold',
    subscription: 'pro',
    fiveHour: { percent: 20, resetsAt: '2026-11-05T12:30:00Z' },
    weekly: { percent: 5, resetsAt: '2026-11-10T07:00:00Z' }
  })
  const flowStart = makeSample({
    at: '2026-11-05T09:59:00.000Z',
    flow: 1,
    event: 'flow-start',
    reading: reading(20, 5),
    tokens: 1200
  })
  assert.equal(flowStart.tokens, 1200)
  const file = appendSample(appendSample('', flowStart), start)
  assert.equal(file.split('\n').length, 3)
  assert.deepEqual(parseSamples(file), { samples: [flowStart, start], problems: [] })
  const broken = `${file}not json\n{"v":2,"at":"x","flow":0,"event":"nope"}\n`
  const { samples, problems } = parseSamples(broken)
  assert.equal(samples.length, 2)
  assert.equal(problems[0], 'line 3: is not JSON')
  assert.match(problems[1], /line 4: v must be 1; at is not a time; flow must be a flow number; event must be one of/)
  assert.equal(appendSample('a\n', { b: 1 }), 'a\n{"b":1}\n')
})

test('what a step used is the difference of its end sample from its start sample, cut when a window reset in between', () => {
  const task = step({})
  const at = (time, five, weekly, fiveReset) => ({ at: time, reading: reading(five, weekly, fiveReset) })
  const start = makeSample({ flow: 1, event: 'step-start', step: task, ...at('2026-11-05T10:00:00Z', 20, 5) })
  const end = makeSample({ flow: 1, event: 'step-end', step: task, ...at('2026-11-05T11:00:00Z', 31, 6) })
  assert.deepEqual(stepDelta([start], end), { cut: [], fiveHour: 11, weekly: 1 })
  const reset = makeSample({ flow: 1, event: 'step-end', step: task, ...at('2026-11-05T13:00:00Z', 4, 7) })
  assert.deepEqual(stepDelta([start], reset), { cut: ['fiveHour'], weekly: 2 })
  assert.equal(stepDelta([], end), null)
  const other = makeSample({
    flow: 1,
    event: 'step-end',
    step: step({ '#': '2' }),
    ...at('2026-11-05T11:00:00Z', 31, 6)
  })
  assert.equal(stepDelta([start], other), null)
})
