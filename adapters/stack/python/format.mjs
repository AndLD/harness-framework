// The python stack's formatter (design §4.1, role "formatter"): how to format one edited file with ruff from the project's own environment (`uv run --no-sync`,
// which neither syncs nor installs, and never `uvx`, which downloads), and which files it handles. Used by the format hook of the agent runtime.
import { extname } from 'node:path'

const FORMATTED = new Set(['.py', '.pyi'])
const IGNORED_DIRECTORIES = [
  '.venv',
  '__pycache__',
  'htmlcov',
  'coverage',
  'dist',
  'build',
  '.mypy_cache',
  '.ruff_cache'
]

/** Whether ruff should format this path (relative to the project root). */
export function isFormatted(path) {
  return FORMATTED.has(extname(path)) && !path.split('/').some((part) => IGNORED_DIRECTORIES.includes(part))
}

/** The command that formats `path`, or null when the stack does not format it. `--force-exclude` keeps the vendored framework out even when a path is named. */
export function formatCommand({ path }) {
  return isFormatted(path)
    ? { command: 'uv', args: ['run', '--no-sync', 'ruff', 'format', '--force-exclude', path] }
    : null
}
