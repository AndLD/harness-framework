// The path of a leak found in `core/` by a consuming project (task 3.8): an issue template of the repository, a rule in the README, and the release
// procedure's step that tags a development version first. The tools that act on them have their own tests.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const ROOT = join(import.meta.dirname, '..')
const read = (path) => readFileSync(join(ROOT, path), 'utf8')

test('the issue template for a word found in core asks for the version, the place, the word and the recorded exception', () => {
  const template = read('.github/ISSUE_TEMPLATE/word-in-core.md')
  assert.match(template, /^---\nname: A word found in core\n/)
  for (const field of ['Framework version', 'File, line and word', 'What the word is', 'terms.exceptions']) {
    assert.ok(template.includes(field), `the template asks for "${field}"`)
  }
})

test('the README says that a leak is a defect fixed in a patch release and an ordinary word is answered in the project', () => {
  const readme = read('README.md')
  const section = readme.slice(readme.indexOf('## A word found in `core/`'))
  assert.match(section, /is a leak, and a defect of the framework/)
  assert.match(section, /fixed in a patch release/)
  assert.match(section, /`terms\.productGeneric`/)
  assert.match(section, /`core\/vocabulary\.json`/)
  assert.match(section, /does not rename its own words/)
})

test('the release procedure and the releasing guide tag a development version before the final tag', () => {
  for (const path of ['core/procedures/release.md', 'docs/operations/releasing.md']) {
    const text = read(path)
    assert.match(text, /harness release --dev/, `${path} names the command`)
    assert.match(text, /v<x\.y\.z>-dev\.<n>/, `${path} names the tag`)
  }
})
