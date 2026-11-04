// The executors of Cursor (task 5.5): a stub with the manual executor only.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { executorProblems } from '../../../tools/conformance/runtime.mjs'
import { executorsFor } from './executors.mjs'

test('Cursor offers the manual executor only, which meets the contract and cannot be measured', () => {
  const executors = executorsFor({})
  assert.deepEqual(Object.keys(executors), ['manual'])
  assert.deepEqual(executorProblems(executors), [])
  assert.deepEqual(executors.manual.context({ worker: 'a' }), [])
  assert.ok(executors.manual.start({ prompt: '<prompt>' })[0].owner)
})
