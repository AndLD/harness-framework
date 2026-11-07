// The usage of Claude Code (task 5.6): the way to read the account and the table of coefficients.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { coefficientFor, usageProblems } from '../../../tools/lib/flow-usage.mjs'
import { usageFor } from './usage.mjs'

test('Claude Code reads the usage through the desktop app, or asks the owner on the command line, and its table meets the contract', () => {
  const usage = usageFor({})
  assert.deepEqual(usageProblems(usage), [])
  const [app, cli] = usage.read()
  assert.equal(app.tool, 'get_usage')
  assert.match(app.reads, /percentUsed.*resetsAt/)
  assert.ok(cli.owner)
  assert.deepEqual(usage.plans, { Pro: 'pro', 'Max 5x': 'max5x', 'Max 20x': 'max20x' })
  assert.deepEqual(Object.keys(usage.subscriptions), ['pro', 'max5x', 'max20x', 'api'])
})

test('the coefficients are provisional, grow with the model and shrink with the subscription; the API counts money', () => {
  const { subscriptions } = usageFor({})
  for (const subscription of Object.values(subscriptions)) assert.equal(subscription.provisional, true)
  const five = (id, model) => subscriptions[id].perSp[model].default.fiveHour
  assert.ok(five('pro', 'haiku') < five('pro', 'sonnet') && five('pro', 'sonnet') < five('pro', 'opus'))
  assert.equal(five('max5x', 'sonnet'), five('pro', 'sonnet') / 5)
  assert.equal(five('max20x', 'sonnet'), five('pro', 'sonnet') / 20)
  assert.equal(subscriptions.api.unit, 'usd')
  assert.ok(subscriptions.api.perSp.sonnet.default.usd > 0)
})

test('a caller that changes the table does not change the next one', () => {
  const first = usageFor({})
  first.subscriptions.pro.perSp.sonnet.default.fiveHour = 0
  assert.equal(usageFor({}).subscriptions.pro.perSp.sonnet.default.fiveHour, 12)
})

test('the calibrated rows of Sonnet on Pro are used for their kinds, and every other kind (triage-fix, custom, decision) and subscription keeps its default row times the factor', () => {
  const { subscriptions } = usageFor({})
  const pro = subscriptions.pro
  assert.deepEqual(coefficientFor(pro, 'sonnet', 'consumer-take'), {
    fiveHour: 2.61,
    weekly: 0.23,
    source: 'calibrated'
  })
  assert.deepEqual(coefficientFor(pro, 'sonnet', 'cut'), { fiveHour: 3.42, weekly: 0.69, source: 'calibrated' })
  assert.deepEqual(coefficientFor(pro, 'sonnet', 'tasks'), { fiveHour: 1.8, weekly: 0.25, source: 'calibrated' })
  assert.deepEqual(coefficientFor(pro, 'sonnet', 'triage-fix'), { fiveHour: 12, weekly: 1.6, source: 'default' })
  assert.equal(coefficientFor(pro, 'opus', 'cut').source, 'default')
  assert.equal(coefficientFor(subscriptions.max5x, 'sonnet', 'cut').source, 'default')
})
