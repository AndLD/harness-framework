import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dependencyAudit, openRequirement } from './dependency-audit.mjs'

test('S2-003: a requirement with no version or no upper bound is open; an exact, a compatible or a bounded one is not', () => {
  for (const open of [
    'requests',
    'requests>=2',
    'requests[socks]>2.0',
    'pkg *',
    'pkg @ git+https://example.com/pkg.git'
  ]) {
    assert.ok(openRequirement(open), `"${open}" is open`)
  }
  for (const bounded of [
    'requests==2.31.0',
    'requests~=2.31',
    'requests>=2,<3',
    'requests[socks]==2.0; python_version>"3.8"',
    `pkg @ git+https://example.com/pkg.git@${'d'.repeat(40)}`,
    ''
  ]) {
    assert.equal(openRequirement(bounded), null, `"${bounded}" is bounded`)
  }
})

test('the requirements of a requirements file and of the dependency lists of pyproject.toml are read', () => {
  const { versionProblems, command, manifests } = dependencyAudit()
  assert.deepEqual(
    versionProblems('requirements.txt', '# comment\n-r base.txt\nflask==3.0.0\nrequests>=2 # open\nurllib3\n'),
    ['requests>=2: a range with no upper bound', 'urllib3: no version']
  )
  const toml = `[project]\nname = "x"\ndependencies = [\n  "flask==3.0.0",\n  "requests>=2",\n]\n\n[project.optional-dependencies]\ndev = ["pytest"]\n\n[tool.other]\nname = "y"\n`
  assert.deepEqual(versionProblems('pyproject.toml', toml), [
    'requests>=2: a range with no upper bound',
    'pytest: no version'
  ])
  assert.deepEqual(
    versionProblems('pyproject.toml', 'dependencies = ["a==1"]\nrequires-python = ">=3.11"\n'),
    [],
    'a one-line list; the interpreter requirement is not a dependency'
  )
  assert.equal(command, 'uv run pip-audit')
  assert.deepEqual(
    manifests.map((entry) => entry.glob),
    ['pyproject.toml', 'requirements*.txt']
  )
})
