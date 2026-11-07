// The step report (task 6.4): the schema and the hard cap, checked on fixtures; the prompt template's wording agrees with the tool's cap.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { promptSections } from './flow-prompt.mjs'
import { checkStepReport, REPORT_CAP, reportCheckCommand } from './step-report.mjs'

const GOOD = `Status: done
Merged: #189 — done: 6.4
Decisions: none
Deviations: none; reports filed: none
Next step: 6.5
## Recommendations
- Cut the audit's first-context line — why: it is the next sink.`

test('a report that follows the schema passes, with or without markup around the labels', () => {
  assert.deepEqual(checkStepReport(GOOD), [])
  assert.deepEqual(
    checkStepReport(GOOD.replace(/^(\w[\w ]*):/gm, '- **$1:**').replace('## Recommendations', '**Recommendations**')),
    []
  )
})

test('a missing label, a label out of order and a bad status are each named', () => {
  assert.deepEqual(checkStepReport(GOOD.replace('Decisions: none\n', '')), ['the line "Decisions:" is missing'])
  assert.match(
    checkStepReport(GOOD.replace('Status: done\nMerged: #189 — done: 6.4', 'Merged: #189\nStatus: done'))[0],
    /"Merged:" is out of order|"Status:" is out of order/
  )
  assert.deepEqual(checkStepReport(GOOD.replace('Status: done', 'Status: finished')), [
    'the status is none of done, partial, blocked'
  ])
  assert.deepEqual(checkStepReport(GOOD.replace('Status: done', 'Status: partial — 6.5 waits')), [])
})

test('the recommendations come last, under a heading of their own', () => {
  assert.deepEqual(
    checkStepReport(
      GOOD.replace("## Recommendations\n- Cut the audit's first-context line — why: it is the next sink.", '')
    ),
    ['the heading "Recommendations" is missing (it comes last, even when it says none)']
  )
  assert.deepEqual(checkStepReport(`${GOOD}\nNext step: 6.6`), [
    'the recommendations come last: a labelled line follows them'
  ])
})

test('a report over the cap in lines or in characters is refused, and says where the rest goes', () => {
  const longer = `${GOOD}\n${'- one more why: a reason\n'.repeat(REPORT_CAP.lines)}`
  assert.match(checkStepReport(longer).join('\n'), /lines, over the cap of 30: move the rest to the task's log/)
  const wide = `${GOOD}\n- ${'x'.repeat(REPORT_CAP.characters)}`
  assert.match(checkStepReport(wide).join('\n'), /characters, over the cap of 2400/)
})

test('the command reads a file and prints one line when the report holds', () => {
  const dir = mkdtempSync(join(tmpdir(), 'report-'))
  const file = join(dir, 'report.md')
  writeFileSync(file, GOOD)
  const ok = reportCheckCommand({ words: [file] })
  assert.equal(ok.code, 0)
  assert.equal(ok.lines.length, 1)
  writeFileSync(file, 'Status: done')
  const bad = reportCheckCommand({ words: [file] })
  assert.equal(bad.code, 1)
  assert.match(bad.lines.join('\n'), /"Merged:" is missing/)
  assert.equal(reportCheckCommand({ words: [join(dir, 'none.md')] }).code, 1)
  assert.equal(reportCheckCommand({ words: [] }).code, 2)
})

test('the schema in the prompt template names every label and the heading, in the order the tool checks', () => {
  const report = promptSections(
    readFileSync(join(import.meta.dirname, '..', '..', 'core/plan/flow-step-prompts.md'), 'utf8')
  ).report
  const at = ['Status:', 'Merged:', 'Decisions:', 'Deviations:', 'Next step:', 'Recommendations'].map((label) =>
    report.indexOf(label)
  )
  assert.ok(
    at.every((index) => index >= 0),
    'every label is in the section'
  )
  assert.deepEqual(
    [...at].sort((a, b) => a - b),
    at,
    'in order'
  )
  assert.match(report, /\{reportLines\}/)
  assert.match(report, /\{reportCharacters\}/)
})
