import assert from 'node:assert/strict'
import { test } from 'node:test'
import { managedBlocks } from './ignore.mjs'

test('the deny-read block of .cursorignore lists the patterns of access.denyRead as they are, carve-outs included', () => {
  assert.deepEqual(managedBlocks({ access: { denyRead: ['.env', '.env.*', '!.env.example', '*.pem'] } }), [
    { path: '.cursorignore', block: 'deny-read', content: '.env\n.env.*\n!.env.example\n*.pem' }
  ])
})

test('a profile without read exclusions gives an empty block', () => {
  assert.deepEqual(managedBlocks({}), [{ path: '.cursorignore', block: 'deny-read', content: '' }])
})
