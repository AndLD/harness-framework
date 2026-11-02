import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { merge, SHARD_FILE } from './coverage.mjs'

// Two real reports of coverage.py (format 3, branch coverage) for one file: the first shard runs two of the three paths, the second the third
const shard = (n) => JSON.parse(readFileSync(join(import.meta.dirname, 'conformance', `shard-${n}.json`), 'utf8'))
const where = { root: '/p', pkg: 'api' }
const FILE = '/p/api/src/main.py'

test('a shard becomes the neutral summary, keyed by the absolute path of each file, with the four metrics', () => {
  const { summary } = merge([shard(1)], where)
  assert.deepEqual(Object.keys(summary), ['total', FILE])
  assert.deepEqual(summary[FILE], {
    statements: { total: 6, covered: 5, skipped: 0, pct: 83.33 },
    branches: { total: 4, covered: 3, skipped: 0, pct: 75 },
    functions: { total: 1, covered: 1, skipped: 0, pct: 100 },
    lines: { total: 6, covered: 5, skipped: 0, pct: 83.33 }
  })
  assert.deepEqual(summary.total, summary[FILE])
})

test('what one shard ran is covered in the merge, whatever the other did, and the merged report can be merged again', () => {
  const { artifacts, summary } = merge([shard(1), shard(2)], where)
  assert.equal(summary[FILE].statements.pct, 100)
  assert.equal(summary[FILE].branches.covered, 4)
  const raw = artifacts[SHARD_FILE]
  assert.deepEqual(raw.files['src/main.py'].missing_lines, [])
  assert.deepEqual(raw.files['src/main.py'].executed_branches, [
    [2, 3],
    [2, 4],
    [4, 5],
    [4, 6]
  ])
  assert.deepEqual(merge([raw], where).summary, summary)
  assert.deepEqual(merge([shard(2), shard(1)], where).summary, summary, 'the order of the shards does not matter')
})

test('a package of many files adds up its total, an empty file is fully covered, and the paths follow the root and the package', () => {
  const empty = {
    executed_lines: [],
    missing_lines: [],
    excluded_lines: [],
    executed_branches: [],
    missing_branches: [],
    functions: {}
  }
  const report = shard(1)
  report.files['src/__init__.py'] = empty
  const { summary } = merge([report], { root: '/work', pkg: 'services' })
  assert.deepEqual(Object.keys(summary), ['total', '/work/services/src/main.py', '/work/services/src/__init__.py'])
  assert.deepEqual(summary['/work/services/src/__init__.py'].statements, { total: 0, covered: 0, skipped: 0, pct: 100 })
  assert.equal(summary.total.statements.total, 6)
  assert.equal(merge([report]).summary['/src/main.py'].lines.total, 6, 'without a place the paths start at the root')
})

test('a report without branch measurement gives no branch metric, and shards that measured different things are refused', () => {
  const plain = shard(1)
  plain.meta.branch_coverage = false
  assert.deepEqual(Object.keys(merge([plain], where).summary.total), ['statements', 'functions', 'lines'])
  assert.throws(() => merge([plain, shard(2)], where), /differ in branch coverage/)

  const old = shard(2)
  old.meta.format = 2
  assert.throws(() => merge([shard(1), old], where), /different versions of coverage\.py/)
  assert.deepEqual(Object.keys(merge([old], where).summary.total), ['statements', 'branches', 'lines'])
  assert.throws(() => merge([], where), /no shard to merge/)
})

test('a function none of the shards ran is not covered, and the module itself is no function', () => {
  const report = shard(2)
  report.files['src/main.py'].functions = {
    '': { executed_lines: [1], missing_lines: [] },
    run: { executed_lines: [], missing_lines: [2, 3] },
    walk: { executed_lines: [4], missing_lines: [] }
  }
  assert.deepEqual(merge([report], where).summary.total.functions, { total: 2, covered: 1, skipped: 0, pct: 50 })
})
