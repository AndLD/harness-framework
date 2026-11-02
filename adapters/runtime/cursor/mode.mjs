// The two modes of the Cursor preset (design §9): Cursor loads Claude Code's `.claude/` hooks and skills by default and its CLI has no opt-out, so with Claude
// Code in the project the preset runs in compat mode and writes no hook file and no skills of its own (they would run twice); as the only runtime it is native.
export const COMPAT_WITH = 'claude-code'

export const selectedRuntimes = (profile = {}) =>
  (profile.adapters?.runtimes ?? []).map((entry) => (typeof entry === 'string' ? entry : entry.adapter))

/** Whether Cursor runs the hooks and skills of Claude Code in this project. */
export const isCompat = (profile) => selectedRuntimes(profile).includes(COMPAT_WITH)
