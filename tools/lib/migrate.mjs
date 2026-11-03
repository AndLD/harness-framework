// `harness migrate` (task 3.5): the second half of taking a version. `sync` only places the new version's files and updates the lock; this command
// runs in a new process, with the new version's tools, and brings the project's own files to the version: it regenerates the managed files.
// (The migration scripts and the notes of the versions in between join it in task 3.12.)
import { readLock } from './lock.mjs'
import { regenerate } from './vendor.mjs'

/**
 * @returns {{ lock: object, messages: string[] }}
 */
export function migrate({ root, generators }) {
  const lock = readLock(root)
  if (!lock) {
    throw new Error(
      'there is no harness.lock.json: nothing to migrate; `harness sync --from <source>` takes a version first'
    )
  }
  const { lock: next, messages } = regenerate({ root, generators })
  const where = next.version ? `${next.framework} ${next.version}` : next.framework
  return { lock: next, messages: [...messages, `Migrated to ${where}.`] }
}
