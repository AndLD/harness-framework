// The budget of the procedures block (task 4.5): the entry file of this repository carries a block of procedures that every session reads, and its bindings
// set a ceiling for its rows and its words. The numbers are read from the file, so a procedure added past the ceiling fails here and not in a later review.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { FRAMEWORK_DIR } from '../tools/lib/bootstrap.mjs'

const read = (path) => readFileSync(join(FRAMEWORK_DIR, path), 'utf8')

const block = () => {
  const text = read('AGENTS.md')
  const body = /<!-- harness:begin procedures -->\n([\s\S]*?)\n<!-- harness:end procedures -->/.exec(text)?.[1] ?? ''
  const rows = body.split('\n').filter((line) => line.startsWith('|')).length - 2
  return { rows, words: body.split(/\s+/).filter(Boolean).length }
}

const budget = (label) => {
  const row = read('docs/quality-reviews/harness/bindings.md')
    .split('\n')
    .find((line) => line.startsWith('|') && line.includes(label))
  const [, , baseline, ceiling] = row.split('|').map((cell) => Number(cell.trim()) || cell.trim())
  return { baseline, ceiling }
}

test('the procedures block of the entry file is within the ceilings of the bindings', () => {
  const { rows, words } = block()
  const rowBudget = budget('Rows of the `procedures` block')
  const wordBudget = budget('Words of the `procedures` block')
  assert.ok(rows > 0 && words > 0, 'the block is found')
  assert.ok(rows <= rowBudget.ceiling, `${rows} rows exceed the ceiling of ${rowBudget.ceiling}`)
  assert.ok(words <= wordBudget.ceiling, `${words} words exceed the ceiling of ${wordBudget.ceiling}`)
  assert.ok(rowBudget.baseline <= rowBudget.ceiling && wordBudget.baseline <= wordBudget.ceiling)
})

test('the method counts the block, requires the extension probes, and says how a probe runs', () => {
  const method = read('core/reviews/harness/README.md')
  assert.match(method, /rows and words of the `procedures` block counted apart/)
  assert.match(method, /rows of the `procedures` block among them/)
  assert.match(method, /include the \*\*extension of a document\*\*/)
  assert.match(method, /separate session started in that repository/)
  assert.match(method, /a subagent of the reviewing session inherits the entry file/)
  const stub = read('core/templates/scaffold/harness-bindings.md')
  assert.match(stub, /Rows of the `procedures` block of the entry file/)
  assert.match(stub, /separate session started in this repository/)
})
