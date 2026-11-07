import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { planWriteCommand } from './plan-write.mjs'
import { ADAPTER_RUNTIMES } from './runtimes.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const profile = { adapters: { runtimes: ['claude-code'] }, paths: { plan: 'plan' } }
const root = () => {
  const dir = mkdtempSync(join(tmpdir(), 'plan-write-cmd-'))
  dirs.push(dir)
  return dir
}
const run = (dir, words, extra = {}) =>
  planWriteCommand({ words, root: dir, profile, runtimes: ADAPTER_RUNTIMES, home: join(dir, 'home'), ...extra })

test('on writes the tracked settings, state reports it, off removes it', () => {
  const dir = root()
  assert.equal(run(dir, ['on']).code, 0)
  assert.deepEqual(JSON.parse(readFileSync(join(dir, '.claude/settings.json'), 'utf8')).permissions.allow, [
    'Edit(plan/**)'
  ])
  assert.match(run(dir, ['state']).lines[0], /: on in/)
  run(dir, ['off'])
  assert.match(run(dir, ['state']).lines[0], /: off in/)
})

test('the user-wide file is written only by --scope user', () => {
  const dir = root()
  run(dir, ['on'])
  assert.throws(() => readFileSync(join(dir, 'home/.claude/settings.json')))
  run(dir, ['on'], { flags: { scope: 'user' } })
  assert.ok(readFileSync(join(dir, 'home/.claude/settings.json'), 'utf8').includes('Edit(plan/**)'))
})

test('a project with no runtime that fills the role, and a bad word, are refused', () => {
  assert.equal(run(root(), ['on'], { profile: { adapters: { runtimes: ['cursor'] } } }).code, 1)
  assert.equal(run(root(), ['sideways']).code, 2)
})
