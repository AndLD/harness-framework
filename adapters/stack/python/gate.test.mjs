import assert from 'node:assert/strict'
import { test } from 'node:test'
import { plan } from './gate.mjs'

const run = (files, extra = {}) =>
  plan({ files, packages: ['api', 'web'], integration: 'develop', exists: () => true, ...extra })
const labels = (steps) => steps.map((step) => step.label)

test('a source file of a package lints and typechecks the package, checks the format of the file, runs the package tests with coverage and holds the file to the gate', () => {
  const { steps, coveragePackages } = run(['api/src/app.py'])
  assert.deepEqual(labels(steps), [
    'lint api',
    'typecheck api',
    'format changed files',
    'tests of api (the whole package)',
    'raw coverage of api',
    'summary of api',
    'coverage of the changed files'
  ])
  assert.deepEqual(coveragePackages, ['api'])
  const [lint, typecheck, format, tests, raw, summary, gate] = steps
  assert.deepEqual(lint.args, ['run', '--no-sync', 'ruff', 'check', 'api'])
  assert.deepEqual(typecheck.args, ['run', '--no-sync', 'mypy', 'api'])
  assert.deepEqual(format.args, ['run', '--no-sync', 'ruff', 'format', '--check', '--force-exclude', 'api/src/app.py'])
  assert.deepEqual(tests.args, ['run', '--no-sync', 'coverage', 'run', '--rcfile=../pyproject.toml', '-m', 'pytest'])
  assert.equal(tests.cwd, 'api')
  assert.deepEqual(tests.clears, ['api/coverage/coverage.json', 'api/coverage/coverage-summary.json'])
  assert.deepEqual(raw.args.slice(-3), ['--rcfile=../pyproject.toml', '-o', 'coverage/coverage.json'])
  assert.deepEqual(summary.args, ['coverage', 'summarize', '--skip-missing', 'api'])
  assert.deepEqual(gate.args, ['coverage', 'check-changed', '--skip-missing', 'origin/develop', 'api'])
})

test('a file of one package leaves the other packages alone, and a nested package finds its configuration further up', () => {
  assert.equal(JSON.stringify(run(['api/src/app.py']).steps).includes('web'), false)
  const nested = plan({
    files: ['services/api/src/a.py'],
    packages: ['services/api'],
    integration: 'main',
    exists: () => true
  })
  assert.ok(nested.steps.find((step) => step.cwd).args.includes('--rcfile=../../pyproject.toml'))
})

test('a change outside every package, or a deleted file, runs the whole project; two packages run both', () => {
  const shared = run(['pyproject.toml'])
  assert.deepEqual(labels(shared.steps).slice(0, 2), ['lint', 'typecheck'])
  assert.deepEqual(shared.coveragePackages, ['api', 'web'])
  assert.deepEqual(run(['api/src/a.py', 'web/src/b.py']).coveragePackages, ['api', 'web'])
  assert.equal(
    run(['api/src/gone.py'], { exists: () => false }).steps.some((step) => step.label === 'format changed files'),
    false
  )
})

test('a file the project says is isolated does not run the whole project, and a file of no Python is not format checked', () => {
  const { steps } = run(['api/data.json', 'scripts/notes.txt'], { isolated: (file) => file.startsWith('scripts/') })
  assert.equal(labels(steps).includes('format changed files'), false)
  assert.deepEqual(labels(steps).slice(0, 2), ['lint api', 'typecheck api'])
  assert.deepEqual(run([]).steps, [], 'nothing changed')
})

test('every tool step carries a quiet variant with the flag of its tool, and the rest of its arguments stay', () => {
  const { steps } = run(['api/src/app.py'])
  const quiet = (label) => steps.find((step) => step.label === label).quiet.args.join(' ')
  assert.match(quiet('lint api'), /ruff check --quiet api$/)
  assert.match(quiet('typecheck api'), /mypy --no-error-summary api$/)
  assert.match(quiet('format changed files'), /ruff format --quiet --check|ruff format --check --quiet/)
  assert.match(quiet('tests of api (the whole package)'), /-m pytest -q$/)
})
