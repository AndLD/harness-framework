import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { scaffoldProblems } from '../../../tools/lib/scaffold.mjs'
import { projectName, pyproject, scaffoldFiles } from './scaffold.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const byPath = (files) => Object.fromEntries(files.map((file) => [file.path, file]))

test('a project name becomes a valid package name', () => {
  assert.equal(projectName('Acme Rocket!'), 'acme-rocket')
  assert.equal(projectName(''), 'project')
  assert.equal(projectName(undefined), 'project')
})

test('the root pyproject names the project, the workspace members of the stack, the tools and their configuration', () => {
  const text = pyproject({
    project: { name: 'Acme' },
    adapters: { stacks: [{ adapter: 'python', packages: ['api', 'jobs'] }] }
  })
  for (const line of [
    'name = "acme"',
    'requires-python = ">=3.12"',
    'members = ["api", "jobs"]',
    'extend-exclude = ["harness"]',
    'exclude = ["^harness/"]',
    'select = ["E", "F", "I", "B", "UP", "ANN", "T20"]',
    'strict = true',
    'branch = true',
    'source = ["src"]'
  ]) {
    assert.ok(text.includes(line), line)
  }
  assert.equal(
    pyproject({}).includes('[tool.uv.workspace]'),
    false,
    'a project with no packages has no workspace members'
  )
  assert.equal(
    pyproject({ paths: { frameworkDir: '.' } }).includes('harness'),
    false,
    'the framework itself vendors nothing'
  )
})

test('the files: the versions, the root pyproject, the ignore lines, and no lock file', () => {
  const files = byPath(scaffoldFiles({}))
  assert.equal(files['.python-version'].content, '3.12\n')
  assert.deepEqual(files['.nvmrc'].lines, ['22'])
  assert.ok(files['.gitignore'].lines.includes('.venv/'))
  assert.equal('uv.lock' in files, false)
})

test('the pyproject passes the scaffold check, which requires it to exclude the vendored framework', () => {
  const root = mkdtempSync(join(tmpdir(), 'python-scaffold-'))
  dirs.push(root)
  mkdirSync(join(root, 'harness'))
  const profile = { adapters: { stacks: ['python'] } }
  writeFileSync(join(root, 'pyproject.toml'), pyproject(profile))
  assert.deepEqual(scaffoldProblems({ root, profile, runtimes: {} }), [])
  writeFileSync(join(root, 'pyproject.toml'), pyproject({ paths: { frameworkDir: '.' } }))
  assert.match(
    scaffoldProblems({ root, profile, runtimes: {} })[0],
    /^pyproject\.toml: does not exclude harness\/.*add the line "extend-exclude = \["harness"\]"/
  )
})
