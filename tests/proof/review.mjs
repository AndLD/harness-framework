// The mechanical evidence of a short targeted harness review; the scores (1 to 5) are the reviewer's judgment, from the evidence, and are written in the record.
// A short targeted harness review (core/reviews/harness: D1 layer integrity, D3 injection, D6 routing), measured on a project root.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = resolve(process.argv[2])
const profile = JSON.parse(readFileSync(join(root, 'harness-profile.json'), 'utf8'))
const SKIP = new Set([
  'node_modules',
  '.git',
  '.venv',
  'coverage',
  '__pycache__',
  '.mypy_cache',
  '.ruff_cache',
  '.pytest_cache'
])
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return []
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
const all = walk(root)
const md = all.filter((file) => file.endsWith('.md'))
const words = (text) => (text.match(/\S+/g) ?? []).length
const rel = (file) => relative(root, file)

// D1: the CORE files are those of the vendored core (harness/core) and the entry file's managed blocks
const core = md.filter((file) => rel(file).startsWith('harness/core/'))
const coreText = core.map((file) => readFileSync(file, 'utf8'))
const coreWords = coreText.reduce((sum, text) => sum + words(text), 0)
const count = (regexp, texts) =>
  texts.reduce((sum, text) => sum + (text.match(new RegExp(regexp, 'gi')) ?? []).length, 0)
const m1 = count(profile.terms.stack, coreText)
const m2 = profile.terms.product === '(?!)' ? 0 : count(profile.terms.product, coreText)
// M3: a link in a CORE file that leaves the vendored core (to the project's own documents)
let m3 = 0
for (const file of core) {
  for (const [, target] of readFileSync(file, 'utf8').matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (/^[a-z]+:/.test(target)) continue
    const resolved = resolve(dirname(file), target)
    if (!rel(resolved).startsWith('harness/')) m3 += 1
  }
}
const adapters = (existsSync(join(root, 'harness/adapters')) ? readdirSync(join(root, 'harness/adapters')) : []).length

// D3: places where a profile value is written outside the profile document, the profile file and the generated blocks
const entry = profile.paths?.entryFile ?? 'AGENTS.md'
const values = [profile.repository.slug, profile.branches.production, profile.branches.integration].filter(Boolean)
const generated = (text) => text.replace(/<!-- harness:begin ([\w-]+) -->[\s\S]*?<!-- harness:end \1 -->/g, '')
let m10 = 0
const where = []
for (const file of md.filter((f) => !rel(f).startsWith('harness/') && rel(f) !== 'docs/profile.md')) {
  const text = generated(readFileSync(file, 'utf8')).replace(/^.*Role binding.*$/gm, '')
  for (const value of values) {
    const found = (
      text.match(new RegExp(`(?<![\\w/-])${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g')) ?? []
    ).length
    if (found) {
      m10 += found
      where.push(`${rel(file)}: ${value} ×${found}`)
    }
  }
}

// D6: the always-loaded file, and what the reading map reaches
const entryText = readFileSync(join(root, entry), 'utf8')
const entryWords = words(entryText)
const rows = entryText
  .split('\n')
  .filter((line) => /^\| .* \| .* \|$/.test(line) && !/^\| (To …|-)/.test(line) && line.includes('](')).length
const reach = new Set()
const queue = [join(root, entry), join(root, 'README.md')].filter(existsSync)
while (queue.length) {
  const file = queue.pop()
  if (reach.has(file) || !existsSync(file)) continue
  reach.add(file)
  if (!file.endsWith('.md')) continue
  for (const [, target] of readFileSync(file, 'utf8').matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (!/^[a-z]+:/.test(target)) queue.push(resolve(dirname(file), target))
  }
}
// The runtime's pointer file is read by the runtime, not linked
const POINTERS = new Set(['CLAUDE.md'])
const own = md.filter(
  (file) =>
    !POINTERS.has(rel(file)) &&
    !rel(file).startsWith('harness/') &&
    !rel(file).startsWith('.claude/') &&
    !rel(file).startsWith('.cursor/')
)
const orphans = own.filter((file) => !reach.has(file))

const row = (name, ...cells) => console.log(`| ${name} | ${cells.join(' | ')} |`)
console.log(
  `**${profile.project.name}** (${(profile.adapters.stacks ?? []).map((s) => s.adapter ?? s).join('+')}; ${(profile.adapters.runtimes ?? []).join('+') || 'no runtime'}; ${adapters} adapter folders vendored)`
)
console.log()
row(
  'D1',
  `M1 stack terms in CORE: ${m1} in ${coreWords} words`,
  `M2 product terms in CORE: ${m2}`,
  `M3 links leaving CORE: ${m3}`
)
row(
  'D3',
  `M10 profile values written outside the profile: ${m10}${where.length ? ' (' + where.join('; ') + ')' : ''}`,
  '',
  ''
)
row(
  'D6',
  `M6 always-loaded: ${entryWords} words (~${Math.round(entryWords * 1.3)} tokens), ${rows} reading-map rows`,
  `M7 orphans: ${orphans.length}${orphans.length ? ' (' + orphans.map(rel).join(', ') + ')' : ''}`,
  ''
)
