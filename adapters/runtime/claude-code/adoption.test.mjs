import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { adoptConfiguration } from './adoption.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

test('the adoption of a settings file says to run the formatter on it', () => {
  const root = mkdtempSync(join(tmpdir(), 'claude-adopt-'))
  dirs.push(root)
  mkdirSync(join(root, '.claude'))
  writeFileSync(join(root, '.claude', 'settings.json'), '{}')
  const { files, notes } = adoptConfiguration({ root, profile: { adapters: { runtimes: ['claude-code'] } } })
  assert.equal(files[0].path, '.claude/settings.json')
  assert.match(notes.join('\n'), /\.claude\/settings\.json is written .*run the project's formatter on it/)
})
