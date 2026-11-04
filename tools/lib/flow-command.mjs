// `harness flow …` (task 5.4): `check`, `status <n>`, `next <n>` and `prompt <n> <step>`, the one way the procedure `run-flow` reads the state of a flow and the
// prompt of a step. Reading is free; nothing here writes a file. The seams are the Git command (`git`), the lock of a consuming repository (`lockOf`) and the
// template of the prompts (`template`), so a test replaces them.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkFlows, planFacts } from './flow-check.mjs'
import { readPromptTemplate, renderPrompt } from './flow-prompt.mjs'
import { flowTruth, gatherFacts, logEntries } from './flow-status.mjs'
import { readFlowsOf } from './flows.mjs'

const USAGE = 'usage: harness flow check | status <n> | next <n> | prompt <n> <step>'

const fail = (message) => ({ lines: [message], code: 1 })

const logTextOf = (root, dir, flow) => {
  const path = join(root, dir, flow.file.replace(/\.md$/, '.log.md'))
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

// The flows that `flow` needs and that are not finished, by the repository's truth
function unfinishedNeeds(flow, read, facts, root) {
  return flow.needs.filter((number) => {
    const needed = read.flows.find((each) => each.number === number)
    return !needed || !flowTruth(needed, facts, logEntries(logTextOf(root, read.dir, needed))).finished
  })
}

const stepLine = (each) => {
  const shown = each.computed === null ? `${each.marked || '?'} (the repository cannot say)` : each.computed
  return `  step ${each.id} [${each.kind}] marked ${each.marked || 'empty'}, repository ${shown}: ${each.evidence}`
}

function statusLines(flow, truth, blocked) {
  const lines = [
    `Flow ${flow.number} — ${flow.title}: mode ${flow.settings.mode}, ${flow.releases.map((release) => `\`${release}\``).join(', ') || 'no release'}.`
  ]
  if (truth.claim)
    lines.push(
      `Claimed: a "running" entry of ${truth.claim} has no "stop" entry after it; another orchestrator may be running it (the procedure run-flow, step 1).`
    )
  lines.push('Steps, recomputed from the repository:', ...truth.steps.map(stepLine))
  if (truth.mismatches.length)
    lines.push('Mismatches with the State column and the log:', ...truth.mismatches.map((line) => `  - ${line}`))
  else lines.push('The State column and the log agree with the repository.')
  if (blocked.length)
    lines.push(`Waits for flow ${blocked.join(', flow ')}, which ${blocked.length > 1 ? 'are' : 'is'} not finished.`)
  else if (truth.finished) lines.push('The flow is finished: every step is done.')
  else if (truth.next)
    lines.push(
      `Next step: ${truth.next.id} [${truth.next.kind}] ${truth.next.step.scope} (state ${truth.next.state}). \`harness flow prompt ${flow.number} ${truth.next.id}\` prints its prompt.`
    )
  else lines.push('No step can run: every step left waits on one that is not done (or is held at ⏸ or ⛔).')
  return lines
}

/**
 * Runs one `harness flow` command.
 * @param {{ words: string[], root: string, profile: object, git?: Function, lockOf?: Function, template?: string }} options
 * @returns {{ lines: string[], code: number }}
 */
export function flowCommand({ words, root, profile, git, lockOf, template }) {
  const [action, number, step] = words
  if (action === 'check' && words.length === 1) {
    const { problems, message } = checkFlows({ root, profile })
    return { lines: [message, ...problems], code: problems.length ? 1 : 0 }
  }
  if (
    !['status', 'next', 'prompt'].includes(action) ||
    !/^\d+$/.test(number ?? '') ||
    words.length !== (action === 'prompt' ? 3 : 2)
  ) {
    return { lines: [USAGE], code: 2 }
  }
  const read = readFlowsOf(root, profile)
  if (!read)
    return fail('The profile file names no flows folder, or the folder has no index; there is no flow to read.')
  const flow = read.flows.find((each) => each.number === Number(number))
  if (!flow)
    return fail(
      `There is no flow ${number}; the flows are ${read.flows.map((each) => each.number).join(', ') || 'none'}.`
    )
  if (flow.problems.length)
    return fail(`${read.dir}/${flow.file}: ${flow.problems.join('; ')}; run \`harness flow check\`.`)
  const facts = gatherFacts({ root, profile, plan: planFacts({ root, profile }), git, lockOf })
  const truth = flowTruth(flow, facts, logEntries(logTextOf(root, read.dir, flow)))
  const blocked = unfinishedNeeds(flow, read, facts, root)

  if (action === 'status') return { lines: statusLines(flow, truth, blocked), code: 0 }
  if (action === 'next') {
    if (blocked.length)
      return {
        lines: [`Flow ${flow.number} waits for flow ${blocked.join(', flow ')}, which is not finished.`],
        code: 0
      }
    if (truth.finished) return { lines: [`Flow ${flow.number} is finished: every step is done.`], code: 0 }
    if (!truth.next) return { lines: statusLines(flow, truth, blocked).slice(-1), code: 1 }
  }
  const target = action === 'next' ? truth.next.id : step
  const { prompt, problems } = renderPrompt({
    flow,
    step: target,
    facts,
    template: template ?? readPromptTemplate(root, profile),
    values: {
      entryFile: profile.project?.entryFile,
      integration: profile.branches?.integration,
      production: profile.branches?.production
    }
  })
  if (problems.length) return { lines: problems, code: 1 }
  return {
    lines:
      action === 'next'
        ? [`Next step of flow ${flow.number}: ${target} [${truth.next.kind}], state ${truth.next.state}.`, '', prompt]
        : [prompt],
    code: 0
  }
}
