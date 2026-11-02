import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ciJobs } from './ci-jobs.mjs'

const profile = {
  commands: {
    lint: 'uv run ruff check .',
    typecheck: 'uv run mypy .',
    docsCheck: 'node harness/tools/harness.mjs check all'
  },
  coveragePackages: ['api']
}

test('the static job installs the locked environment and runs the commands of the profile, after Node is set up for the harness tools', () => {
  const { ids, yaml } = ciJobs(profile)
  assert.deepEqual(ids, ['static', 'api'])
  assert.match(
    yaml,
    /^ {2}static:\n {4}name: static checks\n {4}needs: changes\n {4}if: needs\.changes\.outputs\.code == 'true'/m
  )
  for (const line of [
    'node-version-file: .nvmrc',
    'astral-sh/setup-uv@v6',
    'run: uv sync --locked',
    '- run: uv run ruff check .',
    '- run: uv run mypy .',
    '- run: node harness/tools/harness.mjs check all'
  ]) {
    assert.ok(yaml.includes(line), line)
  }
})

test("a package gets a job that runs the tests from the package and keeps coverage.py's report as the artifact of its shard", () => {
  const { yaml } = ciJobs(profile)
  const job = yaml.slice(yaml.indexOf('  api:'))
  assert.match(job, /working-directory: api\n {8}run: uv run coverage run --rcfile=\.\.\/pyproject\.toml -m pytest/)
  assert.match(job, /run: uv run coverage json --rcfile=\.\.\/pyproject\.toml -o coverage\/coverage\.json/)
  assert.match(job, /name: coverage-api-1-of-1\n {10}path: api\/coverage\/coverage\.json/)
  assert.equal(ciJobs({ coveragePackages: [] }).ids.join(), 'static')
  assert.equal(ciJobs({}).yaml.includes('- run: undefined'), false)
})

test('among several stacks the static job is named after the stack, runs its own commands, and the coverage jobs are those of its own packages', () => {
  const own = { lint: 'uv run ruff check .', typecheck: 'uv run mypy .' }
  const many = { stacks: 2, name: 'python', packages: ['api'], commands: own }
  const second = ciJobs({ ...profile, coveragePackages: ['web', 'api'] }, { ...many, first: false })
  assert.deepEqual(second.ids, ['static-python', 'api'])
  assert.match(second.yaml, /^ {2}static-python:\n {4}name: static checks \(python\)\n/m)
  assert.ok(second.yaml.includes('- run: uv run mypy .'))
  assert.equal(second.yaml.includes('docs check'), false)
  assert.equal(
    second.yaml.includes('harness.mjs check all'),
    false,
    'the documentation check runs once, in the first stack'
  )
  assert.ok(ciJobs(profile, { ...many, first: true }).yaml.includes('- run: node harness/tools/harness.mjs check all'))
})
