import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dependencyAudit, openRange } from './dependency-audit.mjs'

test('S2-003: a range with no upper bound, any version and an address without a commit are open; an exact version, a caret, a tilde and a commit are not', () => {
  for (const open of [
    '*',
    'x',
    'latest',
    'next',
    '',
    '>=1.0.0',
    '>2',
    '^1.0.0 || >=3',
    'github:owner/repo',
    'owner/repo#main',
    'https://example.com/a.tgz'
  ]) {
    assert.ok(openRange(open), `"${open}" is open`)
  }
  const sha = 'c'.repeat(40)
  for (const bounded of [
    '1.2.3',
    '^1.2.3',
    '~1.2.3',
    '>=1.0.0 <2.0.0',
    '1.x',
    'npm:other@1.2.3',
    'file:../local',
    `github:owner/repo#${sha}`,
    `git+https://x/y.git#${sha}`
  ]) {
    assert.equal(openRange(bounded), null, `"${bounded}" is bounded`)
  }
})

test('the versions of the three dependency sections are read, the peer ones are not, and a manifest that is not JSON is reported', () => {
  const { versionProblems, command, manifests } = dependencyAudit()
  const manifest = {
    dependencies: { a: '*' },
    devDependencies: { b: '^1.0.0' },
    optionalDependencies: { c: 'latest' },
    peerDependencies: { d: '>=1' }
  }
  assert.deepEqual(versionProblems('package.json', JSON.stringify(manifest)), [
    'a in dependencies: "*" takes any version',
    'c in optionalDependencies: "latest" takes any version'
  ])
  assert.deepEqual(versionProblems('package.json', '{'), ['package.json is not valid JSON'])
  assert.equal(command, 'npm audit --audit-level=high')
  assert.equal(manifests[0].glob, 'package.json')
})
