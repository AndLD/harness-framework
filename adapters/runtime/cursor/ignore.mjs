// The Cursor preset's read exclusions (design §4.2, §4.4 and §9): the paths of `access.denyRead` as a block of `.cursorignore`, in both modes (Cursor does not
// take Claude Code's permission rules). The sync keeps the block (role "managed-blocks"); the lines around it are the project's own. The patterns are
// written as they are: `.cursorignore` takes gitignore patterns, `!` carve-outs included. It blocks the agent; terminal commands and MCP tools are outside it.

export const IGNORE_PATH = '.cursorignore'
export const IGNORE_BLOCK = 'deny-read'

/** The block of `.cursorignore` for a profile. */
export const managedBlocks = (profile) => [
  { path: IGNORE_PATH, block: IGNORE_BLOCK, content: (profile.access?.denyRead ?? []).join('\n') }
]
