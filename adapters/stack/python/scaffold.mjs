// The python stack's files of a new project (design §6.3, role "scaffold-files"): written once by the bootstrap, then the project's. The root `pyproject.toml` holds
// the project, its uv workspace (the packages the profile gives this stack), the development tools, and the configuration of ruff, mypy and coverage.py that the
// commands of the profile rely on. No `uv.lock` is written: it cannot be written by hand, so the project runs `uv lock` once and commits it (the stack file), and
// CI, which installs with `uv sync --locked`, fails until then. `.nvmrc` is there because the harness tools run on Node.
import { frameworkDir } from '../../../tools/lib/lock.mjs'

export const PYTHON_VERSION = '3.12'
// The Node version of the harness tools; a file of lines, so that a project with the node-ts stack as well names the same line
export const NODE_VERSION = '22'
export const START_VERSION = '0.1.0'

/** A valid project name from a profile's: lower case, with every run of other characters a single dash. */
export function projectName(name = '') {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^[-._]+|[-._]+$/g, '') || 'project'
  )
}

// The folders that the profile gives to this stack
function packagesOf(profile) {
  const entry = (profile.adapters?.stacks ?? []).find((item) => typeof item === 'object' && item.adapter === 'python')
  return entry?.packages ?? []
}

/** The text of the root `pyproject.toml`. */
export function pyproject(profile) {
  const vendored = frameworkDir(profile) === '.' ? null : frameworkDir(profile)
  const members = packagesOf(profile)
  return [
    '[project]',
    `name = "${projectName(profile.project?.name)}"`,
    `version = "${START_VERSION}"`,
    `requires-python = ">=${PYTHON_VERSION}"`,
    'dependencies = []',
    '',
    '[dependency-groups]',
    'dev = ["coverage>=7.6", "mypy>=1.13", "pytest>=8.3", "ruff>=0.8"]',
    '',
    '[tool.uv]',
    'package = false',
    '',
    ...(members.length
      ? ['[tool.uv.workspace]', `members = [${members.map((member) => `"${member}"`).join(', ')}]`, '']
      : []),
    '[tool.ruff]',
    'line-length = 100',
    ...(vendored ? [`extend-exclude = ["${vendored}"]`] : []),
    '',
    '[tool.ruff.lint]',
    '# E, F: pycodestyle and pyflakes; I: imports; B: likely bugs; UP: modern syntax; ANN: every public boundary is typed; T20: no print left behind',
    'select = ["E", "F", "I", "B", "UP", "ANN", "T20"]',
    '',
    '[tool.ruff.lint.per-file-ignores]',
    '"**/tests/**" = ["ANN"]',
    '',
    '[tool.mypy]',
    'strict = true',
    ...(vendored ? [`exclude = ["^${vendored}/"]`] : []),
    '',
    '# Each package keeps its sources in src/ and its tests in tests/; the commands run coverage.py from the package with this file',
    '[tool.coverage.run]',
    'branch = true',
    'source = ["src"]',
    ''
  ].join('\n')
}

/** The files, `{ path, content }`, or `{ path, lines }` for a file that several adapters add lines to. */
export function scaffoldFiles(profile) {
  return [
    { path: '.python-version', content: `${PYTHON_VERSION}\n` },
    { path: '.nvmrc', lines: [NODE_VERSION] },
    { path: 'pyproject.toml', content: pyproject(profile) },
    {
      path: '.gitignore',
      lines: [
        '.venv/',
        '__pycache__/',
        '.pytest_cache/',
        '.mypy_cache/',
        '.ruff_cache/',
        '.coverage',
        'coverage/',
        'htmlcov/',
        'dist/',
        '*.egg-info/'
      ]
    }
  ]
}
