import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { adoptConfiguration } from './adoption.mjs'
import { hooksFor } from './hooks.mjs'

const native = { adapters: { runtimes: ['cursor'] } }
const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

function project(configuration) {
  const root = mkdtempSync(join(tmpdir(), 'cursor-adopt-'))
  dirs.push(root)
  if (configuration) {
    mkdirSync(join(root, '.cursor'))
    writeFileSync(join(root, '.cursor', 'hooks.json'), JSON.stringify(configuration))
  }
  return root
}

test('a project without a hook file gets nothing here, because the scaffold writes it', () => {
  assert.deepEqual(adoptConfiguration({ root: project(), profile: native }), { files: [], notes: [] })
})

test('the framework entries are added to the hooks of the project, which stay, and the project hooks are named', () => {
  const own = {
    version: 1,
    hooks: { beforeShellExecution: [{ command: './audit.sh' }], stop: [{ command: './done.sh' }] }
  }
  const { files, notes } = adoptConfiguration({ root: project(own), profile: native })
  assert.equal(files.length, 1)
  const result = JSON.parse(files[0].content)
  assert.equal(files[0].path, '.cursor/hooks.json')
  assert.deepEqual(result.hooks.stop, own.hooks.stop)
  assert.deepEqual(result.hooks.beforeShellExecution[0], { command: './audit.sh' })
  assert.deepEqual(result.hooks.beforeShellExecution[1], hooksFor(native).hooks.beforeShellExecution[0])
  assert.deepEqual(Object.keys(result.hooks).sort(), [
    'afterFileEdit',
    'beforeShellExecution',
    'preToolUse',
    'sessionStart',
    'stop'
  ])
  assert.deepEqual(notes, [
    ".cursor/hooks.json: the hook `./audit.sh` is the project's own; remove it if the framework's hook does its job.",
    ".cursor/hooks.json: the hook `./done.sh` is the project's own; remove it if the framework's hook does its job."
  ])
})

test('adopting twice adds nothing, a file without a version gets one, and compat mode leaves the file as it is', () => {
  const root = project({ hooks: {} })
  const once = JSON.parse(adoptConfiguration({ root, profile: native }).files[0].content)
  assert.equal(once.version, 1)
  writeFileSync(join(root, '.cursor', 'hooks.json'), JSON.stringify(once))
  assert.deepEqual(JSON.parse(adoptConfiguration({ root, profile: native }).files[0].content), once)
  assert.deepEqual(adoptConfiguration({ root, profile: { adapters: { runtimes: ['claude-code', 'cursor'] } } }), {
    files: [],
    notes: []
  })
})
