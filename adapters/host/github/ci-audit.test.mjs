import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { auditCi, isPinned } from './ci-audit.mjs'

const SHA = 'a'.repeat(40)
const audit = (text, path = '.github/workflows/w.yml') => auditCi({ files: [{ path, text }] })
const probes = (text) => audit(text).map((problem) => problem.probe)

const CLEAN = `name: CI
on: [push]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@${SHA} # v4
      - uses: ./local-action
      - uses: docker://alpine@sha256:${'b'.repeat(64)}
      - run: echo "$TITLE"
        env:
          TITLE: \${{ github.event.pull_request.title }}
`

test('a workflow that declares permissions at the top, pins its actions and passes event text through env has no finding', () => {
  assert.deepEqual(audit(CLEAN), [])
})

test('S3-001: a workflow with no permissions at the top is checked job by job', () => {
  const text = `on: push\njobs:\n  a:\n    runs-on: x\n    permissions:\n      contents: read\n    steps: []\n  b:\n    runs-on: x\n    steps: []\n`
  const found = audit(text)
  assert.deepEqual(
    found.map((problem) => problem.probe),
    ['S3-001']
  )
  assert.match(found[0].text, /w\.yml:8: the job "b" declares no `permissions:`/)
})

test('S2-004: an action pinned to a tag or a branch is reported, a full commit, a local path and an image digest are not', () => {
  const text = `permissions: {}\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@v4\n      - uses: owner/repo@main # moved\n      - uses: "owner/pinned@${SHA}"\n      - uses: docker://alpine:3\n`
  const found = audit(text)
  assert.equal(found.length, 3)
  assert.match(found[0].text, /w\.yml:5: `actions\/checkout@v4` is not pinned/)
  assert.match(found[2].text, /docker:\/\/alpine:3/)
  assert.equal(isPinned(`owner/repo@${SHA}`), true)
  assert.equal(isPinned('owner/repo'), false, 'no reference at all')
})

test('S3-005: event text an outsider controls is reported in a script, in a block and on one line, and not in env or with', () => {
  const text = `permissions: {}\njobs:\n  a:\n    steps:\n      - run: echo \${{ github.event.issue.title }}\n      - run: |\n          git checkout \${{ github.head_ref }}\n          echo \${{ github.sha }}\n      - uses: owner/x@${SHA}\n        with:\n          title: \${{ github.event.pull_request.title }}\n`
  const found = audit(text)
  assert.deepEqual(
    found.map((problem) => problem.probe),
    ['S3-005', 'S3-005']
  )
  assert.match(found[0].text, /w\.yml:5: `github\.event\.issue\.title` is text an outsider controls/)
  assert.match(found[1].text, /w\.yml:7: `github\.head_ref`/)
})

test('S4-018: a pull_request_target workflow that checks out the proposed code is reported; one that checks out the base is not', () => {
  const head = `on:\n  pull_request_target:\npermissions: {}\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@${SHA}\n        with:\n          ref: \${{ github.event.pull_request.head.sha }}\n`
  assert.deepEqual(probes(head), ['S4-018'])
  assert.deepEqual(probes(head.replace('github.event.pull_request.head.sha', 'main')), [])
  assert.deepEqual(probes(head.replace('pull_request_target', 'pull_request')), [])
})

test('the workflows of the templates declare their permissions and need no other change but the pins (the known findings of this release)', () => {
  const folder = join(import.meta.dirname, 'templates')
  for (const name of ['ci.yml', 'release.yml']) {
    const found = audit(readFileSync(join(folder, name), 'utf8'), name)
    assert.deepEqual(
      [...new Set(found.map((problem) => problem.probe))].filter((probe) => probe !== 'S2-004'),
      [],
      name
    )
  }
})
