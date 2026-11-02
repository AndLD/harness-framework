// The python stack's coverage (design §4.1, roles "coverage tool" and "coverage merge"): the raw coverage of a run is coverage.py's JSON report (`coverage json`,
// format 3), keyed by the path of each file relative to the folder the run started in (the package). Merging the shards of a package and writing the neutral
// summary (`total` and one entry per file, keyed by absolute path, each with `statements`, `branches`, `functions` and `lines` as `{ total, covered, skipped, pct }`)
// is this module's job; the core reads the summary and applies the gate. coverage.py counts a statement and a line alike, so those two metrics are equal. A shard
// is added to the others by what it executed: a line, a branch or a function that one shard ran is covered, whatever the others did.
import { posix } from 'node:path'

/** The file in which a run of a package keeps its raw coverage. */
export const SHARD_FILE = 'coverage.json'
export const REPORT_FORMAT = 3

const pairKey = (pair) => pair.join(',')

// Every shard must have measured the same things, or their sums would mean nothing
function measured(shards) {
  const branches = new Set(shards.map((shard) => shard.meta?.branch_coverage === true))
  if (branches.size > 1) {
    throw new Error('the shards differ in branch coverage; run them all with `branch = true`, or none')
  }
  const formats = new Set(shards.map((shard) => (shard.meta?.format ?? 0) >= REPORT_FORMAT))
  if (formats.size > 1) {
    throw new Error(
      'the shards were written by different versions of coverage.py; upgrade it in the lock file and run them again'
    )
  }
  return { branches: branches.has(true), functions: formats.has(true) }
}

const addAll = (set, items = []) => items.forEach((item) => set.add(item))

function emptyFile() {
  return {
    executed: new Set(),
    missing: new Set(),
    executedBranches: new Map(),
    missingBranches: new Map(),
    functions: new Map()
  }
}

function collect(shards, { branches, functions }) {
  const files = new Map()
  for (const shard of shards) {
    for (const [name, report] of Object.entries(shard.files ?? {})) {
      const path = name.replaceAll('\\', '/')
      const file = files.get(path) ?? emptyFile()
      files.set(path, file)
      addAll(file.executed, report.executed_lines)
      addAll(file.missing, report.missing_lines)
      if (branches) {
        ;(report.executed_branches ?? []).forEach((pair) => file.executedBranches.set(pairKey(pair), pair))
        ;(report.missing_branches ?? []).forEach((pair) => file.missingBranches.set(pairKey(pair), pair))
      }
      if (functions) {
        for (const [function_, part] of Object.entries(report.functions ?? {})) {
          const entry = file.functions.get(function_) ?? { executed: new Set(), missing: new Set() }
          file.functions.set(function_, entry)
          addAll(entry.executed, part.executed_lines)
          addAll(entry.missing, part.missing_lines)
        }
      }
    }
  }
  // What one shard ran is not missing in the merge
  for (const file of files.values()) {
    file.executed.forEach((line) => file.missing.delete(line))
    file.executedBranches.forEach((_, key) => file.missingBranches.delete(key))
    file.functions.forEach((entry) => entry.executed.forEach((line) => entry.missing.delete(line)))
  }
  return files
}

const sorted = (set) => [...set].sort((a, b) => a - b)
const sortedPairs = (map) => [...map.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1])

// The merged raw report, in the shape of a shard so that it can be merged again
function toRaw(files, flags) {
  const out = {}
  for (const [path, file] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    out[path] = {
      executed_lines: sorted(file.executed),
      missing_lines: sorted(file.missing),
      excluded_lines: [],
      ...(flags.branches
        ? { executed_branches: sortedPairs(file.executedBranches), missing_branches: sortedPairs(file.missingBranches) }
        : {}),
      ...(flags.functions
        ? {
            functions: Object.fromEntries(
              [...file.functions].map(([name, entry]) => [
                name,
                { executed_lines: sorted(entry.executed), missing_lines: sorted(entry.missing) }
              ])
            )
          }
        : {})
    }
  }
  return { meta: { format: flags.functions ? REPORT_FORMAT : 2, branch_coverage: flags.branches }, files: out }
}

// Istanbul's percentage, which the gate is written for: the floor to two decimals, so that 99.999 is never shown as 100; nothing to cover is 100
const percent = (covered, total) => (total > 0 ? Math.floor((1000 * 100 * covered) / total / 10) / 100 : 100)
const metric = (covered, total) => ({ total, covered, skipped: 0, pct: percent(covered, total) })

function fileMetrics(file, flags) {
  const lines = metric(file.executed.size, file.executed.size + file.missing.size)
  return {
    statements: lines,
    ...(flags.branches
      ? { branches: metric(file.executedBranches.size, file.executedBranches.size + file.missingBranches.size) }
      : {}),
    ...(flags.functions
      ? (() => {
          // The module's own statements are the function named "", which is no function
          const named = [...file.functions].filter(([name]) => name !== '')
          return { functions: metric(named.filter(([, entry]) => entry.executed.size > 0).length, named.length) }
        })()
      : {}),
    lines
  }
}

/**
 * The coverage-merge role: `shards` are the parsed `coverage json` reports of one package, and `where` says where the run started, `{ root, pkg }`: the project
 * root and the package folder, which turn the relative paths of the reports into the absolute ones of the summary.
 * @returns {{ artifacts: Record<string, object>, summary: object }} the merged raw report to write next to the summary, and the summary
 */
export function merge(shards, { root = '/', pkg = '' } = {}) {
  if (shards.length === 0) {
    throw new Error('there is no shard to merge')
  }
  const flags = measured(shards)
  const files = collect(shards, flags)
  const entries = [...files].map(([path, file]) => [posix.join(root, pkg, path), fileMetrics(file, flags)])
  const total = {}
  for (const name of Object.keys(entries[0]?.[1] ?? fileMetrics(emptyFile(), flags))) {
    const covered = entries.reduce((sum, [, metrics]) => sum + metrics[name].covered, 0)
    const count = entries.reduce((sum, [, metrics]) => sum + metrics[name].total, 0)
    total[name] = metric(covered, count)
  }
  return { artifacts: { [SHARD_FILE]: toRaw(files, flags) }, summary: { total, ...Object.fromEntries(entries) } }
}
