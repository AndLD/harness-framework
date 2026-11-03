import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { scaffoldProblems } from '../../../tools/lib/scaffold.mjs'
import { packageProject, projectName, pyproject, scaffoldFiles } from './scaffold.mjs'

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

const withPackages = (...packages) => ({
  project: { name: 'Acme' },
  adapters: { stacks: [{ adapter: 'python', packages }] }
})

test('each package gets its pyproject, a typed first module and a test, so that `uv lock` and `mypy .` have something to work on', () => {
  const files = byPath(scaffoldFiles(withPackages('api', 'jobs')))
  for (const folder of ['api', 'jobs']) {
    assert.equal(files[`${folder}/pyproject.toml`].content, packageProject(folder))
    assert.match(files[`${folder}/src/app.py`].content, /^def double\(number: int\) -> int:/)
    assert.match(files[`${folder}/tests/test_app.py`].content, /^from app import double/)
  }
  assert.equal('src/app.py' in files, false, 'a project with packages has no module at its root')
  assert.match(packageProject('api'), /name = "api"[\s\S]*package = false[\s\S]*pythonpath = \["src"\]/)
})

test('a project with no package gets the first module and its test at the root, and the root pyproject runs the test', () => {
  const files = byPath(scaffoldFiles({}))
  assert.ok(files['src/app.py'] && files['tests/test_app.py'])
  assert.match(pyproject({}), /\[tool\.pytest\.ini_options\]\npythonpath = \["src"\]/)
  assert.doesNotMatch(pyproject(withPackages('api')), /tool\.pytest/)
})

test('the manifest says what the project does once by hand: the lock file, which no scaffold can write', () => {
  const manifest = JSON.parse(readFileSync(join(import.meta.dirname, 'manifest.json'), 'utf8'))
  assert.equal(manifest.firstSteps.length, 1)
  assert.match(manifest.firstSteps[0], /uv lock.*commit `uv\.lock`.*CI is red until the file exists/)
})
