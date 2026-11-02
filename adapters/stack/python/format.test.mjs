import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatCommand, isFormatted } from './format.mjs'

test('ruff formats Python sources and stubs, from the project environment and keeping the vendored folder out', () => {
  assert.deepEqual(formatCommand({ path: 'api/src/app.py' }), {
    command: 'uv',
    args: ['run', '--no-sync', 'ruff', 'format', '--force-exclude', 'api/src/app.py']
  })
  assert.ok(formatCommand({ path: 'api/src/app.pyi' }))
})

test('other files and the folders of tools are left alone', () => {
  for (const path of [
    'README.md',
    'pyproject.toml',
    'logo.png',
    '.venv/lib/x.py',
    'api/__pycache__/a.py',
    'htmlcov/a.py'
  ]) {
    assert.equal(formatCommand({ path }), null, path)
    assert.equal(isFormatted(path), false, path)
  }
})
