// `harness migrate` (tasks 3.5 and 3.12): the second half of taking a version. `sync` only places the new version's files and updates the lock; this
// command runs in a new process, with the new version's tools, and brings the project's own files to the version:
//   1. runs the migration scripts (`migrations/<version>.mjs` of the vendored tree) of every version after the project's own up to the target that
//      are not recorded as applied, in version order, and records each in the lock (`migrations.applied`), so that a stopped run resumes;
//   2. regenerates the managed files;
//   3. prints the migration notes of those versions, in order, for the agent or the person to follow.
// A lock without the record counts as `0.1.0` with nothing applied. A script is `export default ({ root, profile }) => string[] | void` (it may be
// async); it checks its starting state, and it is run again without harm. The script of a development version's final version runs for the
// development version too, and is not recorded as applied, so each next development version runs it again.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { inFramework, MODES, readLock, writeLock } from './lock.mjs'
import { loadProfile } from './profile.mjs'
import { regenerate } from './vendor.mjs'
import { baseVersion, compareVersions, isDevelopment } from './versions.mjs'

export const FIRST_VERSION = '0.1.0'

/** The versions that have a script or a note in the migrations folder, with which of the two, oldest first. */
export function listMigrations(folder) {
  if (!existsSync(folder)) {
    return []
  }
  const found = new Map()
  for (const file of readdirSync(folder)) {
    const match = /^(\d+\.\d+\.\d+)\.(mjs|md)$/.exec(file)
    if (match) {
      found.set(match[1], {
        ...found.get(match[1]),
        version: match[1],
        [match[2] === 'mjs' ? 'script' : 'note']: join(folder, file)
      })
    }
  }
  return [...found.values()].sort((a, b) => compareVersions(a.version, b.version))
}

/**
 * @returns {Promise<{ lock: object, messages: string[] }>}
 */
export async function migrate({ root, generators, profile = loadProfile(root) }) {
  const lock = readLock(root)
  if (!lock) {
    throw new Error(
      'there is no harness.lock.json: nothing to migrate; `harness sync --from <source>` takes a version first'
    )
  }
  const messages = []
  if (lock.mode !== MODES.pinned) {
    return {
      ...regenerate({ root, generators }),
      messages: ['Regenerated the managed files (only a pinned project has migrations to run).']
    }
  }

  const target = lock.version
  const from = lock.migrations?.version ?? FIRST_VERSION
  const applied = [...(lock.migrations?.applied ?? [])]
  const pending = listMigrations(join(root, inFramework(profile, 'migrations'))).filter(
    ({ version }) => compareVersions(version, from) > 0 && compareVersions(version, baseVersion(target)) <= 0
  )

  for (const { version, script } of pending.filter(({ script }) => script)) {
    if (applied.includes(version)) {
      continue
    }
    const run = (await import(pathToFileURL(script).href)).default
    if (typeof run !== 'function') {
      throw new Error(`${script} must export a function by default: ({ root, profile }) => lines`)
    }
    const lines = (await run({ root, profile })) ?? []
    messages.push(`Migration script of ${version}:`, ...lines.map((line) => `  ${line}`))
    if (!(isDevelopment(target) && version === baseVersion(target))) {
      applied.push(version)
    }
    writeLock(root, { ...readLock(root), migrations: { version: from, applied } })
  }

  messages.push(...regenerate({ root, generators }).messages)
  const next = { ...readLock(root), migrations: { version: target, applied } }
  writeLock(root, next)

  for (const { version, note } of pending.filter(({ note }) => note)) {
    messages.push(`Migration note of ${version} (follow its required actions):`, readFileSync(note, 'utf8').trimEnd())
  }
  messages.push(`Migrated to ${next.framework} ${target}.`)
  return { lock: next, messages }
}
