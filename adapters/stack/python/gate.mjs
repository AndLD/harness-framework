// The python stack's plan for the local gate (design §4.1, role "local gate plan"): which checks a push of these files needs, run by the gate driver
// (`harness gate`, tools/lib/gate.mjs). Principle: run only what the changed files need; the full run is CI's. pytest cannot follow a changed file to its tests,
// so a touched package runs its whole test suite with coverage, and only the changed files are held to the gate (the package's own gate is CI's).
//
// `plan({ files, packages, integration, exists, isolated })` has the arguments and the result of every stack's plan: see the node-ts preset. Everything runs
// through `uv run --no-sync`, from the project's own environment, which a push never syncs.
import { SHARD_FILE } from './coverage.mjs'

const PYTHON = /\.pyi?$/
const UV = ['run', '--no-sync']

// The first path segment names the package when it is one of `packages`; the root files and shared folders are no package's
function packageOf(file, packages) {
  const [first] = file.split('/')
  return packages.includes(first) && file.includes('/') ? first : null
}

// The path from a package to the project root, where the configuration of the tools is
const rootOf = (pkg) => '../'.repeat(pkg.split('/').length)

const uv = (label, ...args) => ({ label, command: 'uv', args: [...UV, ...args] })

// The step with its quiet variant (the role `quiet-commands`): the same command with the flag of its tool that reduces the output to the failures
const AFTER_TOOL = UV.length + 1
const quietly = (step, flag, at) => ({
  ...step,
  quiet: { args: [...step.args.slice(0, at), flag, ...step.args.slice(at)] }
})

export function plan({ files, packages, integration, exists, isolated = () => false }) {
  const steps = []
  // Files of no package (the root configuration, the lock file, the hooks) can change every package: the full run
  const isShared = files.some((file) => !packageOf(file, packages) && !isolated(file))
  const touched = isShared
    ? packages
    : packages.filter((pkg) => files.some((file) => packageOf(file, packages) === pkg))

  if (isShared) {
    steps.push(
      quietly(uv('lint', 'ruff', 'check', '.'), '--quiet', AFTER_TOOL + 1),
      quietly(uv('typecheck', 'mypy', '.'), '--no-error-summary', AFTER_TOOL)
    )
  } else {
    for (const pkg of touched) {
      steps.push(
        quietly(uv(`lint ${pkg}`, 'ruff', 'check', pkg), '--quiet', AFTER_TOOL + 1),
        quietly(uv(`typecheck ${pkg}`, 'mypy', pkg), '--no-error-summary', AFTER_TOOL)
      )
    }
  }
  const formatted = files.filter((file) => PYTHON.test(file) && exists(file))
  if (formatted.length) {
    steps.push(
      quietly(
        uv('format changed files', 'ruff', 'format', '--check', '--force-exclude', ...formatted),
        '--quiet',
        AFTER_TOOL + 1
      )
    )
  }

  for (const pkg of touched) {
    const config = `--rcfile=${rootOf(pkg)}pyproject.toml`
    steps.push(
      {
        ...quietly(uv(`tests of ${pkg} (the whole package)`, 'coverage', 'run', config, '-m', 'pytest'), '-q', 99),
        cwd: pkg,
        package: pkg,
        // A run that fails or finds no tests must not leave the coverage of an earlier run to be judged
        clears: [`${pkg}/coverage/${SHARD_FILE}`, `${pkg}/coverage/coverage-summary.json`]
      },
      {
        ...uv(`raw coverage of ${pkg}`, 'coverage', 'json', config, '-o', `coverage/${SHARD_FILE}`),
        cwd: pkg,
        package: pkg
      },
      {
        label: `summary of ${pkg}`,
        command: 'harness',
        args: ['coverage', 'summarize', '--skip-missing', pkg],
        package: pkg
      }
    )
  }

  if (touched.length) {
    steps.push({
      label: 'coverage of the changed files',
      command: 'harness',
      args: ['coverage', 'check-changed', '--skip-missing', `origin/${integration}`, ...touched]
    })
  }
  return { steps, coveragePackages: touched }
}
