// `harness review measure` (task 2.3): the counts of the hand-run harness reviews, on a small project built in memory, and the command on a real folder.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { run } from '../harness.mjs'
import {
  alwaysLoaded,
  countWords,
  highest,
  illegalReferences,
  linkedFile,
  measureReview,
  readCeilings,
  referenceGraph,
  reviewCommand,
  ruleMapStatuses,
  unreachable
} from './review-measure.mjs'
import { layerConfig } from './layers.mjs'

const AGENTS = `# Rules

You must read the plan. Never skip a test. Do not push to main. It is always so, unless the owner says otherwise.
Only the owner merges, except for a hotfix. Don't guess.

- First rule. <!-- rule:one.rule -->
- Second rule. <!-- rule:two.rule -->

<!-- harness:begin procedures -->
| When | Follow |
| ---- | ------ |
| starting | [start](./docs/engineering/start.md) |
| ending | [end](./docs/engineering/end.md) |
<!-- harness:end procedures -->

See [the plan](docs/plan/index.md) and [the profile](docs/profile.md).
`

const FILES = {
  'AGENTS.md': AGENTS,
  'CLAUDE.md': '@AGENTS.md\n',
  'README.md':
    '# Project\n\n[agents](AGENTS.md) [engineering](docs/engineering/) [outside](../elsewhere.md) [web](https://example.org) `[code](docs/code.md)`\n',
  'docs/engineering/README.md':
    '# Engineering\n\n[start](start.md) [end](end.md) [rules](rule-checks.md) [again](start.md#top) [self](#here)\n',
  'docs/engineering/start.md': '# Start\n\n[plan](../plan/index.md) [a missing one](missing.md)\n',
  'docs/engineering/end.md': '# End\n',
  'docs/engineering/rule-checks.md': [
    '# Rule map',
    '',
    '| Rule | Text | Status |',
    '| ---- | ---- | ------ |',
    '| 1 | a hand row | enforced |',
    '| 2 | `a|b` in a code span | partly |',
    '',
    '| 3 | after a blank line | judgment; with a note |',
    '',
    'Text ends the table.',
    '',
    '| 4 | not a table row of the map | enforced |',
    '',
    '<!-- harness:begin rule-map -->',
    '| Rule | Text | Early | Status |',
    '| ---- | ---- | ----- | ------ |',
    '| `one.rule` | First | – | enforced |',
    '<!-- harness:end rule-map -->',
    ''
  ].join('\n'),
  'docs/plan/index.md': '# Plan\n\n[engineering](../engineering/README.md) [profile](../profile.md)\n',
  'docs/profile.md': '# Profile\n\n[agents](../AGENTS.md)\n',
  'docs/orphan.md': '# Nobody links here\n',
  'docs/.hidden/read-by-the-host.md': '# Hidden\n',
  'harness/core/vendored.md': '# Vendored\n',
  'docs/quality/bindings.md': [
    '# Bindings',
    '',
    '| Number | Baseline | Ceiling |',
    '| ------ | -------- | ------- |',
    '| Rows of the `procedures` block of the entry file (M6, M20) | 2 | 2 |',
    '| Words of the `procedures` block of the entry file (M6) | 20 | 10 |',
    '| Words in the always-loaded set (M6) | 100 | 1,000 |',
    '| Normative words in the always-loaded set (M20) | 8 | 5 |',
    '| Highest fan-out of one document (M21) | 3 | — |',
    ''
  ].join('\n')
}

const PROFILE = {
  project: { name: 'fixture' },
  paths: { entryFile: 'AGENTS.md' },
  documents: { ruleChecks: 'docs/engineering/rule-checks.md', harnessBindings: 'docs/quality/bindings.md' },
  layers: {
    scope: ['**/*.md'],
    excluded: ['harness/**'],
    adapter: ['docs/engineering/**'],
    profile: ['docs/profile.md', '**/bindings.md'],
    state: ['docs/plan/**', 'docs/orphan.md', 'docs/.hidden/**'],
    entry: ['AGENTS.md', 'CLAUDE.md', 'README.md']
  }
}

const files = Object.keys(FILES)
const read = (path) => FILES[path]
const emptyRoot = mkdtempSync(join(tmpdir(), 'review-measure-'))
after(() => rmSync(emptyRoot, { recursive: true, force: true }))

test('the always-loaded set is the entry file, what it imports, and the root files that import it', () => {
  assert.deepEqual(alwaysLoaded({ files, read, profile: PROFILE }), ['AGENTS.md', 'CLAUDE.md'])
  assert.deepEqual(alwaysLoaded({ files: ['README.md'], read, profile: PROFILE }), [])
  const imports = { 'AGENTS.md': 'Rules.\n@docs/extra.md\n', 'docs/extra.md': 'Extra.\n' }
  assert.deepEqual(alwaysLoaded({ files: Object.keys(imports), read: (path) => imports[path], profile: PROFILE }), [
    'AGENTS.md',
    'docs/extra.md'
  ])
  assert.equal(countWords('one  two\nthree '), 3)
})

test('the statuses are counted per kind of row; a blank line inside a table keeps it, a line of text ends it', () => {
  const { hand, generated, unmapped } = ruleMapStatuses(FILES['docs/engineering/rule-checks.md'], [
    'one.rule',
    'two.rule'
  ])
  assert.deepEqual(hand, { enforced: 1, partly: 1, judgment: 1 })
  assert.deepEqual(generated, { enforced: 1 })
  assert.deepEqual(unmapped, ['two.rule'])
  assert.deepEqual(ruleMapStatuses('no table\n').hand, {})
})

test('a link reaches a tracked file; a folder reaches its README; an outside, a web or an own-anchor link reaches nothing', () => {
  const tracked = new Set(files)
  assert.equal(linkedFile('README.md', 'docs/engineering/', tracked), 'docs/engineering/README.md')
  assert.equal(linkedFile('docs/engineering/start.md', '../plan/index.md#a', tracked), 'docs/plan/index.md')
  assert.equal(linkedFile('README.md', '../elsewhere.md', tracked), null)
  assert.equal(linkedFile('README.md', '#top', tracked), null)
  assert.equal(linkedFile('README.md', 'docs', tracked), null)
  assert.equal(linkedFile('README.md', 'README.md', tracked), null)
  assert.equal(linkedFile('README.md', '%E0%A4%A.md', tracked), null)
})

test('the graph counts distinct linked files; the unreachable ones leave out hidden folders and the vendored copy', () => {
  const graph = referenceGraph({ files, read })
  assert.deepEqual([...graph.out.get('docs/engineering/README.md')].sort(), [
    'docs/engineering/end.md',
    'docs/engineering/rule-checks.md',
    'docs/engineering/start.md'
  ])
  assert.deepEqual(highest(graph.out, 1), [{ file: 'AGENTS.md', count: 4 }])
  assert.deepEqual(highest(graph.in, 2), [
    { file: 'AGENTS.md', count: 2 },
    { file: 'docs/engineering/end.md', count: 2 }
  ])
  assert.deepEqual(unreachable({ graph, files, roots: ['AGENTS.md', 'CLAUDE.md', 'README.md'] }), [
    'docs/orphan.md',
    'docs/quality/bindings.md'
  ])
})

test('a reference to a layer the dependency rule does not allow is listed; the entry and the state may reference any layer', () => {
  const config = layerConfig(emptyRoot, PROFILE)
  assert.deepEqual(illegalReferences({ files, read, config }), [
    { from: 'docs/engineering/start.md', to: 'docs/plan/index.md', fromLayer: 'adapter', toLayer: 'state' },
    { from: 'docs/profile.md', to: 'AGENTS.md', fromLayer: 'profile', toLayer: 'entry' }
  ])
  const allowed = { ...FILES, 'docs/engineering/start.md': '# Start\n', 'docs/profile.md': '# Profile\n' }
  assert.deepEqual(illegalReferences({ files, read: (path) => allowed[path], config }), [])
})

test('the ceilings are read from the bindings by the words of their rows; a dash is no ceiling', () => {
  assert.deepEqual(readCeilings(FILES['docs/quality/bindings.md']), {
    procedureRows: 2,
    procedureWords: 10,
    words: 1000,
    normative: 5
  })
  const budgets =
    '| Aspect | Number | Budget |\n| --- | --- | --- |\n| Harness | Highest fan-out of one document | ≤ 40 (baseline 39) |\n'
  assert.deepEqual(readCeilings(budgets), { fanOut: 40 })
  assert.deepEqual(readCeilings('No table.\n'), {})
})

test('the measurements of the project are printed with the verdict of each budget, and the numbers over a ceiling are named', () => {
  const { lines, exceeded } = measureReview({ root: emptyRoot, profile: PROFILE, files, read })
  const text = lines.join('\n')
  assert.match(
    text,
    /^M6 {2}always loaded: \d+ words \(about \d+ tokens\) in AGENTS\.md \d+ \+ CLAUDE\.md 1 \(ceiling 1,000: met\)$/m
  )
  assert.match(
    text,
    /^M6 {2}procedures block of AGENTS\.md: 2 rows \(ceiling 2: met\), \d+ words \(ceiling 10: EXCEEDED\)$/m
  )
  assert.match(
    text,
    /^M20 rule load: 6 normative words \(ceiling 5: EXCEEDED\), 2 exception words, 2 rules with an id$/m
  )
  assert.match(
    text,
    /^M5 {2}rule map docs\/engineering\/rule-checks\.md, rows: 3 hand-written \(.*\), 1 generated \(1 enforced\); rules of AGENTS\.md without a row: 1 \(two\.rule\)$/m
  )
  assert.match(text, /^M21 highest fan-out: AGENTS\.md 4, then /m)
  assert.match(
    text,
    /^M7 {2}unreachable from AGENTS\.md, CLAUDE\.md, README\.md: 2 Markdown files\n {6}docs\/orphan\.md\n {6}docs\/quality\/bindings\.md$/m
  )
  assert.match(
    text,
    /^M3 {2}references against the dependency rule: 2\n {6}docs\/engineering\/start\.md \(ADAPTER\) → docs\/plan\/index\.md \(STATE\)\n {6}docs\/profile\.md \(PROFILE\) → AGENTS\.md \(ENTRY\)$/m
  )
  assert.deepEqual(exceeded, ['procedureWords', 'normative'])
})

test('a project without a rule map, a layer map, an entry file or a procedures block is measured as far as it goes', () => {
  const bare = { 'README.md': '# Project\n' }
  const { lines, exceeded } = measureReview({
    root: emptyRoot,
    profile: {},
    files: Object.keys(bare),
    read: (path) => bare[path]
  })
  const text = lines.join('\n')
  assert.match(text, /^M6 {2}always loaded: 0 words \(about 0 tokens\) in no entry file$/m)
  assert.match(text, /^M21 highest fan-in: no document links another$/m)
  assert.match(text, /^M5 {2}rule map: the profile has no `documents\.ruleChecks` document$/m)
  assert.match(text, /^M3 {2}dependency rule: the profile file has no `layers` role/m)
  assert.deepEqual(exceeded, [])
})

test('the command refuses another action; its exit code is 1 when a number is over its ceiling', () => {
  assert.deepEqual(reviewCommand({ words: [], root: emptyRoot, profile: PROFILE, files, read }), {
    lines: ['usage: harness review measure'],
    code: 1
  })
  const over = reviewCommand({ words: ['measure'], root: emptyRoot, profile: PROFILE, files, read })
  assert.equal(over.code, 1)
  assert.match(over.lines[0], /^Measurements of fixture, by `harness review measure`:$/)
  assert.equal(over.lines.at(-1), 'Over the ceiling of the bindings: procedureWords, normative.')
  const met = reviewCommand({
    words: ['measure'],
    root: emptyRoot,
    profile: { ...PROFILE, documents: {} },
    files,
    read
  })
  assert.equal(met.code, 0)
  assert.equal(met.lines.at(-1), 'No number is over a ceiling of the bindings.')
})

test('harness review measure runs on a project folder: the commit in the first line, the numbers after it', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-measure-cli-'))
  after(() => rmSync(dir, { recursive: true, force: true }))
  for (const [path, content] of Object.entries({ ...FILES, 'harness-profile.json': JSON.stringify(PROFILE) })) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  spawnSync('git', ['init', '-q', '-b', 'feature/fixture'], { cwd: dir })
  spawnSync('git', ['add', '-A'], { cwd: dir })
  const out = []
  const err = []
  const code = await run(['review', 'measure', '--root', dir], {
    out: (line) => out.push(line),
    err: (line) => err.push(line)
  })
  assert.equal(code, 1)
  assert.match(err.join('\n'), /^Measurements of fixture, by `harness review measure`:\nM6 /)
  assert.match(err.join('\n'), /Over the ceiling of the bindings: procedureWords, normative\.$/)
  assert.deepEqual(out, [])
  assert.equal(await run(['review', 'nonsense', '--root', dir], { out: () => {}, err: (line) => err.push(line) }), 1)
})

test('a tracked file that the work tree no longer has is left out of the measurements', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-measure-gone-'))
  after(() => rmSync(dir, { recursive: true, force: true }))
  for (const [path, content] of Object.entries({ ...FILES, 'changelog.d/gone.md': 'a fragment' })) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  spawnSync('git', ['init', '-q', '-b', 'feature/fixture'], { cwd: dir })
  spawnSync('git', ['add', '-A'], { cwd: dir })
  unlinkSync(join(dir, 'changelog.d/gone.md'))
  const { lines } = measureReview({ root: dir, profile: PROFILE })
  assert.match(lines[0], /^M6 /)
})
