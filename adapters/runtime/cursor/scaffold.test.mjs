import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hooksFor } from './hooks.mjs'
import { scaffoldFiles } from './scaffold.mjs'

test('native mode writes the hook file once, and compat mode writes nothing', () => {
  const native = { adapters: { runtimes: ['cursor'] } }
  const files = scaffoldFiles(native)
  assert.deepEqual(
    files.map(({ path }) => path),
    ['.cursor/hooks.json']
  )
  assert.deepEqual(JSON.parse(files[0].content), hooksFor(native))
  assert.ok(files[0].content.endsWith('\n'))
  assert.deepEqual(scaffoldFiles({ adapters: { runtimes: ['claude-code', 'cursor'] } }), [])
})
