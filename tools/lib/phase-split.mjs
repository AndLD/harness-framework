// Splits a phase kept as one file into a phase folder (task 3.10): `phases/phase-<n>-<slug>.md` becomes `phase-<n>-<slug>/README.md` (the phase index),
// one `<id>.md` per task row, `<id>.log.md` for each task log (moved from `work-logs/phase-<n>/<id>.md`) and `log.md` (moved from
// `work-logs/phase-<n>-log.md`). Every link into the phase and its logs is rewritten across the repository, anchors included, and the links inside the
// moved text are made relative to where the text now stands, so that nothing is left broken. The same code is the migration script of `0.2.0` (for the
// open phases of a project) and `harness plan split <phase>` (for a phase by choice, a finished one for example).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { TASKS_END, TASKS_START, compareIds, taskTable } from './phase-files.mjs'
import { planSummary } from './plan.mjs'

const LINK = /(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g
const REFERENCE = /^(\[[^\]]+\]:\s*)(\S+)/gm
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|#|\/\/)/i
const SYMBOL = /(⬜|🟡|✅)/

/**
 * `text` (the content of the repository file `from`, now to be written as `to`) with every relative link made right for its new place: a target that is
 * itself moved (`moves`: old path to new path) is followed, and the path is written relative to `to`'s folder.
 */
export function rewriteLinks(text, from, to, moves) {
  const rewrite = (target) => {
    if (EXTERNAL.test(target)) {
      return target
    }
    const [path, anchor] = target.split('#')
    if (!path) {
      return target
    }
    const resolved = posix.normalize(posix.join(posix.dirname(from), path))
    if (resolved.startsWith('..')) {
      return target
    }
    const mapped = moves.get(resolved) ?? moves.get(resolved.replace(/\/$/, '')) ?? resolved
    let relative = posix.relative(posix.dirname(to), mapped) || '.'
    if (path.endsWith('/') && !relative.endsWith('/')) {
      relative += '/'
    }
    if (path.startsWith('.') && !relative.startsWith('.')) {
      relative = `./${relative}`
    }
    return anchor === undefined ? relative : `${relative}#${anchor}`
  }
  return text
    .replace(LINK, (_, open, target, close) => `${open}${rewrite(target)}${close}`)
    .replace(REFERENCE, (_, open, target) => `${open}${rewrite(target)}`)
}

/** The full paths of a moved file written in plain text (a code span, a sentence) are replaced by the new ones. */
const replacePaths = (text, moves) => {
  let result = text
  for (const [from, to] of [...moves].sort((a, b) => b[0].length - a[0].length)) {
    result = result.split(from).join(to)
  }
  return result
}

const shorten = (title) => (title.length > 100 ? `${title.slice(0, 97)}…` : title)
const plain = (text) => text.replace(/\*\*|\[([^\]]*)\]\([^)]*\)/g, '$1')
// The title of a task: its bold lead whole, else the start of its text
const titleOf = (description) => {
  const lead = description.match(/\*\*(.+?)\*\*/)?.[1]
  return plain(lead ?? shorten(description.split('|')[0])).trim()
}

// The ids a description says the task needs first ("Needs 3.5, 3.12 and 3.14 first"), as a list text; null when it names none
function needsOf(description) {
  const sentence = /\bNeeds? ((?:\d+\.\d+[a-z]?)(?:(?:,| and|, and) (?:\d+\.\d+[a-z]?))*)/.exec(plain(description))
  return sentence ? sentence[1].match(/\d+\.\d+[a-z]?/g).join(', ') : null
}

/** The rows of the task table of a phase file: `{ id, description, agent, points, status }`, the table's first and last line, and whether it has an Agent column. */
export function readTaskTable(lines) {
  const first = lines.findIndex((line) => /^\| #\s*\|/.test(line))
  if (first < 0) {
    throw new Error('the phase file has no task table (a header row starting with "| #")')
  }
  const hasAgent = /\|\s*Agent\s*\|/i.test(lines[first])
  let last = first
  while (lines[last + 1]?.startsWith('|')) {
    last += 1
  }
  const rows = lines
    .slice(first + 2, last + 1)
    .map((line) =>
      line
        .replace(/^\|\s*/, '')
        .replace(/\s*\|\s*$/, '')
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim())
    )
    .filter((cells) => /^\d+\.\d+[a-z]?$/.test(cells[0]))
    .map((cells) => {
      const status = cells.at(-1).match(SYMBOL)?.[1]
      const points = Number(cells.at(-2))
      const agent = hasAgent ? (cells.at(-3).match(/^C\d+$/)?.[0] ?? null) : null
      const description = cells.slice(1, hasAgent ? -3 : -2).join(' | ')
      if (!status || !Number.isInteger(points)) {
        throw new Error(`task ${cells[0]}: the row must end with its size and a status symbol`)
      }
      return { id: cells[0], description, agent, points, status }
    })
  return { first, last, hasAgent, rows }
}

const taskFileText = (phase, row, log) =>
  `[← ${phase.title}](./README.md)\n\n# ${row.id} — ${titleOf(row.description)}\n\n` +
  [
    `**Status:** ${row.status}`,
    ...(row.agent ? [`**Agent:** ${row.agent}`] : []),
    `**Size:** ${row.points} SP`,
    ...(needsOf(row.description) ? [`**Needs:** ${needsOf(row.description)}`] : []),
    ...(log ? [`**Log:** [${row.id}.log.md](./${row.id}.log.md)`] : [])
  ].join(' · ') +
  `\n\n${row.description}\n`

const listFiles = (root) => {
  try {
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .split('\n')
      .filter((name) => name && existsSync(join(root, name)))
  } catch {
    const files = []
    const visit = (dir) => {
      for (const name of readdirSync(join(root, dir))) {
        if (name === '.git' || name === 'node_modules') continue
        const path = dir ? `${dir}/${name}` : name
        if (statSync(join(root, path)).isDirectory()) visit(path)
        else files.push(path)
      }
    }
    visit('')
    return files
  }
}

/**
 * Splits the phase file of phase `number` into a folder. Nothing happens to a phase that is a folder already (the migration script runs twice).
 * @returns {{ messages: string[], moves: Map<string, string> }}
 */
export function splitPhase({ root, profile, number }) {
  const phasesDir = profile.paths.phases
  const complexity = profile.plan?.complexity
  const file = existsSync(join(root, phasesDir))
    ? readdirSync(join(root, phasesDir)).find((name) => new RegExp(`^phase-${number}-.+\\.md$`).test(name))
    : undefined
  if (!file) {
    const folder = existsSync(join(root, phasesDir))
      ? readdirSync(join(root, phasesDir)).find((name) => new RegExp(`^phase-${number}-[^.]+$`).test(name))
      : undefined
    return {
      messages: [folder ? `Phase ${number} is a folder already.` : `Phase ${number} has no phase file.`],
      moves: new Map()
    }
  }
  const stem = file.replace(/\.md$/, '')
  const old = `${phasesDir}/${file}`
  const folder = `${phasesDir}/${stem}`
  const text = readFileSync(join(root, old), 'utf8')
  const lines = text.split('\n')
  const title = /^# (Phase \d+ — .+)$/m.exec(text)?.[1]
  if (!title) {
    throw new Error(`${old}: the title must read "# Phase <n> — <theme> (<size> SP)"`)
  }
  const { first, last, rows } = readTaskTable(lines)
  const phase = { title: title.replace(/ \(\d+ SP.*\)$/, '') }

  // The logs that move with the phase
  const logPath = /\(\.\/(work-logs\/[^)]+\.md)\)/.exec(text)?.[1]
  const phaseLog = `${phasesDir}/${logPath ?? `work-logs/phase-${number}-log.md`}`
  const fragments = `${phaseLog.replace(/-log\.md$/, '')}`
  const moves = new Map([[old, `${folder}/README.md`]])
  if (existsSync(join(root, phaseLog))) {
    moves.set(phaseLog, `${folder}/log.md`)
  }
  const logged = new Set()
  if (existsSync(join(root, fragments))) {
    for (const name of readdirSync(join(root, fragments))) {
      const id = /^(\d+\.\d+[a-z]?)\.md$/.exec(name)?.[1]
      if (id && rows.some((row) => row.id === id)) {
        moves.set(`${fragments}/${name}`, `${folder}/${id}.log.md`)
        logged.add(id)
      }
    }
  }

  // The new files: from the old text, with its links made right for the new place; the parts written here already stand at the new place
  const created = new Map()
  const follow = (content, from, to) => replacePaths(rewriteLinks(content, from, to, moves), moves)
  const table = taskTable(
    rows.map((row) => ({ ...row, title: titleOf(row.description) })),
    { marked: Object.keys(complexity?.scale ?? {}).length > 0 }
  )
  const readmePath = `${folder}/README.md`
  const before = follow(lines.slice(0, first).join('\n'), old, readmePath).replace(
    /\*\*Work log:\*\*[^\n]*/,
    '**Work log:** [log](./log.md), and a log beside each task (`<id>.log.md`)'
  )
  const after = follow(lines.slice(last + 1).join('\n'), old, readmePath)
  created.set(readmePath, `${before}\n${TASKS_START}\n${table}\n${TASKS_END}\n${after}`)
  for (const row of rows) {
    const path = `${folder}/${row.id}.md`
    const body = follow(row.description, old, path)
    created.set(path, taskFileText(phase, { ...row, description: body }, logged.has(row.id)))
  }
  const moved = new Map()
  for (const [from, to] of moves) {
    if (from !== old) {
      moved.set(to, follow(readFileSync(join(root, from), 'utf8'), from, to))
    }
  }
  for (const row of rows.filter((item) => logged.has(item.id))) {
    const path = `${folder}/${row.id}.log.md`
    moved.set(
      path,
      moved.get(path).replace(/^\[←[^\n]*\n/, `[← ${row.id} — ${titleOf(row.description)}](./${row.id}.md)\n`)
    )
  }

  // The rest of the repository: its links and its plain-text paths follow the moved files
  const touched = []
  for (const path of listFiles(root).filter(
    (name) => /\.(md|json)$/.test(name) && !moves.has(name) && !name.startsWith('docs/temp/')
  )) {
    const original = readFileSync(join(root, path), 'utf8')
    const next = replacePaths(path.endsWith('.md') ? rewriteLinks(original, path, path, moves) : original, moves)
    if (next !== original) {
      writeFileSync(join(root, path), next)
      touched.push(path)
    }
  }

  mkdirSync(join(root, folder), { recursive: true })
  for (const [path, content] of [...created, ...moved]) {
    writeFileSync(join(root, path), content)
  }
  for (const from of moves.keys()) {
    rmSync(join(root, from))
  }
  if (existsSync(join(root, fragments)) && readdirSync(join(root, fragments)).length === 0) {
    rmSync(join(root, fragments), { recursive: true })
  }

  return {
    moves,
    messages: [
      `Split Phase ${number}: ${old} is now ${folder}/ with ${rows.length} task file(s), ${logged.size} task log(s)${moves.has(phaseLog) ? ' and log.md' : ''}; ` +
        `the links in ${touched.length} other file(s) follow.`
    ]
  }
}

/**
 * Splits the phases `numbers` (all the open ones when null) of a project, then rewrites the generated tables.
 * @returns {{ messages: string[] }}
 */
export function splitPhases({ root, profile, numbers }) {
  const phasesDir = profile.paths.phases
  const open = (name) => !/\*\*Status:\*\*\s*✅/.test(readFileSync(join(root, phasesDir, name), 'utf8'))
  const chosen =
    numbers ??
    (existsSync(join(root, phasesDir)) ? readdirSync(join(root, phasesDir)) : [])
      .filter((name) => /^phase-\d+-.+\.md$/.test(name) && open(name))
      .map((name) => Number(/^phase-(\d+)-/.exec(name)[1]))
      .sort((a, b) => a - b)
  const messages = chosen.flatMap((number) => splitPhase({ root, profile, number }).messages)
  if (messages.some((message) => message.startsWith('Split'))) {
    planSummary({ root, profile })
  }
  return { messages }
}

export { compareIds }
