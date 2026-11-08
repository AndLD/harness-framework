// The python adapter's role "dependency-audit" (stack contract): which files list the dependencies, which lock file each needs, the requirements that are not
// pinned (probes S2-001 and S2-003 of the security review), and the command that audits them against an advisory database (S2-010).
const LOCKS = ['uv.lock', 'poetry.lock', 'pdm.lock', 'Pipfile.lock', 'requirements.lock']
const REQUIREMENT = /^([A-Za-z0-9][A-Za-z0-9_.-]*)(\[[^\]]*\])?\s*(.*)$/

/** Why a requirement (`name[extra] specifier`) is not pinned, or null: exact (`==`, `===`, `~=`), or bounded above, or a direct reference. */
export function openRequirement(text) {
  const match = REQUIREMENT.exec(text.split(';')[0].trim())
  if (!match) return null
  const specifier = match[3].trim()
  if (specifier.startsWith('@'))
    return /[#@][0-9a-f]{40}\b/.test(specifier) ? null : 'a direct reference without a full commit hash'
  if (!specifier || specifier === '*') return 'no version'
  if (/==|~=/.test(specifier) || /<=?\s*\d/.test(specifier)) return null
  return 'a range with no upper bound'
}

const quoted = (line) => [...line.matchAll(/"([^"]+)"|'([^']+)'/g)].map((match) => match[1] ?? match[2])

function pyprojectRequirements(text) {
  const found = []
  let inList = false
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (
      !inList &&
      /^(?:dependencies|[\w-]+)\s*=\s*\[/.test(trimmed) &&
      /(?:dependencies|requires|dev|test|docs|lint)/.test(trimmed.split('=')[0])
    )
      inList = true
    else if (!inList && /^\[(?:project\.optional-dependencies|dependency-groups)\]/.test(trimmed)) inList = 'table'
    else if (inList === 'table' && trimmed.startsWith('[')) inList = false
    if (inList) {
      found.push(...quoted(trimmed.replace(/^[\w-]+\s*=\s*\[/, '')))
      if (inList !== 'table' && trimmed.includes(']')) inList = false
    }
  }
  return found
}

/** @returns {{ command: string, manifests: { glob: string, locks: string[] }[], versionProblems: (file: string, text: string) => string[] }} */
export function dependencyAudit() {
  return {
    command: 'uv run pip-audit',
    manifests: [
      { glob: 'pyproject.toml', locks: LOCKS },
      { glob: 'requirements*.txt', locks: [] }
    ],
    versionProblems(file, text) {
      const lines = file.endsWith('.txt')
        ? text
            .split('\n')
            .map((line) => line.split(' #')[0].trim())
            .filter((line) => line && !line.startsWith('#') && !line.startsWith('-'))
        : pyprojectRequirements(text)
      return lines.flatMap((line) => {
        const reason = openRequirement(line)
        return reason ? [`${line}: ${reason}`] : []
      })
    }
  }
}
