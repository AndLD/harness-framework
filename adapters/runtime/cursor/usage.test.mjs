// The usage of Cursor (task 5.6): a mock.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { usageProblems } from '../../../tools/lib/flow-usage.mjs'
import { usageFor } from './usage.mjs'

test('Cursor asks the owner for the usage and has one mock subscription that meets the contract', () => {
  const usage = usageFor({})
  assert.deepEqual(usageProblems(usage), [])
  assert.ok(usage.read()[0].owner)
  assert.deepEqual(Object.keys(usage.subscriptions), ['mock'])
  assert.deepEqual(usage.subscriptions.mock.perSp.default.default, { fiveHour: 1, weekly: 1 })
})
