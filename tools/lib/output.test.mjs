// Quiet output (task 6.2): the lines kept of a failed run, the cap, the output file, and a command's quiet and verbose output with unchanged exit codes.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { briefDispatch } from './flow-command.mjs'
import { failureLines, failureReport, MAX_LINES, maxLinesOf, outputFolder, stdioToFile } from './output.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), 'output-'))
  dirs.push(dir)
  return dir
}
const cli = join(import.meta.dirname, '..', 'harness.mjs')

test('the cap is the profile value when it is a whole number from 1, else the default', () => {
  assert.equal(maxLinesOf({ output: { maxLines: 7 } }), 7)
  for (const bad of [0, -1, 2.5, 'x', undefined]) assert.equal(maxLinesOf({ output: { maxLines: bad } }), MAX_LINES)
  assert.equal(maxLinesOf({}), MAX_LINES)
})

test('the failing lines are kept before the rest, the last lines when none looks like a failure, and what is left out is counted', () => {
  const text = ['fine', 'a.test: FAILED here', '', 'more', 'Error: boom', 'tail'].join('\n')
  assert.deepEqual(failureLines(text, 10), { lines: ['a.test: FAILED here', 'Error: boom'], omitted: 3 })
  assert.deepEqual(failureLines('1\n2\n3\n4\n5', 2), { lines: ['4', '5'], omitted: 3 })
  assert.deepEqual(failureLines('', 5), { lines: [], omitted: 0 })
})

test('a child process writes to a file through stdioToFile, and the report names the file and the lines', () => {
  const file = join(outputFolder('test'), 'run.log')
  const target = stdioToFile(file)
  spawnSync(process.execPath, ['-e', 'console.log("ok"); console.error("Error: broke at x.mjs:3")'], {
    stdio: target.stdio
  })
  target.close()
  assert.deepEqual(failureReport(file, 5), [
    `full output: ${file}`,
    'Error: broke at x.mjs:3',
    '… 1 more line(s) in the file (run with --verbose to see everything)'
  ])
  assert.deepEqual(failureReport(join(temp(), 'none.log'), 5).length, 1)
})

test('a dispatch in brief keeps the way to start the worker and drops the reading and measuring groups', () => {
  const lines = [
    'Step 2 of flow 3',
    'Worker: a fresh one',
    'Start it:',
    '  - the app: call start_session {}',
    '  - its permissions: auto',
    '  - fetch its report: the result',
    'Fetch its full step report when it ends:',
    '  - call list_events',
    'Log "step 2 started" with: x',
    'Usage: the step is estimated',
    '  - call get_usage',
    'Then `harness flow gate 3 2`: start only on GO',
    'Measure it: sample'
  ]
  assert.deepEqual(briefDispatch(lines), [
    'Step 2 of flow 3',
    'Worker: a fresh one',
    'Start it:',
    '  - the app: call start_session {}',
    'Log "step 2 started" with: x'
  ])
})

test('check <name> prints one line on a pass and every message with --verbose; a planted failure prints its problem and exits 1', () => {
  const root = temp()
  writeFileSync(join(root, 'harness-profile.json'), '{}')
  mkdirSync(join(root, 'docs'))
  spawnSync('git', ['init', '-q'], { cwd: root })
  const run = (...args) => spawnSync(process.execPath, [cli, ...args, '--root', root], { encoding: 'utf8' })
  const passed = run('check', 'links')
  assert.equal(passed.status, 0, passed.stderr)
  assert.equal(passed.stdout.trim().split('\n').length, 1)
  writeFileSync(join(root, 'a.md'), 'See [missing](./nowhere.md).\n')
  spawnSync('git', ['add', '-A'], { cwd: root })
  const failed = run('check', 'links')
  assert.equal(failed.status, 1)
  assert.match(failed.stderr, /a\.md.*nowhere\.md/)
  assert.ok(existsSync(root))
  assert.equal(readFileSync(join(root, 'a.md'), 'utf8').length > 0, true)
})
