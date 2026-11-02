// The Cursor preset's files of a new project (design §6.3, role "scaffold-files"): `.cursor/hooks.json` in native mode, none in compat mode. Cursor reads the
// entry file itself, so there is no pointer file; `.cursorignore` is a managed block that the sync adds (ignore.mjs). Written once by the bootstrap; `harness check
// scaffold` then holds the invariants of the hook file.
import { HOOKS_PATH, hooksFor } from './hooks.mjs'

/** The files, `{ path, content }`. */
export function scaffoldFiles(profile) {
  const hooks = hooksFor(profile)
  return hooks ? [{ path: HOOKS_PATH, content: `${JSON.stringify(hooks, null, 2)}\n` }] : []
}
