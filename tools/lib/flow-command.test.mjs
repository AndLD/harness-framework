// `harness flow check | status | next | prompt` (task 5.4) on a scratch project with a plan, a releases file, a flow and its log, through the command line.
import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { run } from '../harness.mjs'
import { flowCommand } from './flow-command.mjs'
import { planSummary } from './plan.mjs'
import { flowSessionLines } from './flow-session.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const ROOT = join(import.meta.dirname, '..', '..')

const FLOW = `[← Flows](./README.md)

# Flow 1 — Ship one

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-1-ship-one.log.md)

## Settings

\`\`\`json
{ "mode": "seamless" }
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | tasks | home | \`1.0.0\` | — | — | 1 | — | C2 | ⬜ |
| 2 | cut | home | \`1.0.0\` | 1 | — | 1 | — | — | ⬜ |
`
const LOG = `# Flow 1 — Ship one — log

## Entries

### 2026-11-04 10:00 — running
- **Orchestrator:** s1

### 2026-11-04 10:01 — step 1 started
`

function project() {
  const root = mkdtempSync(join(tmpdir(), 'flow-command-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  cpSync(join(ROOT, 'core'), join(root, 'core'), { recursive: true })
  const profile = {
    project: { title: 'Demo', entryFile: 'AGENTS.md' },
    branches: { integration: 'develop', production: 'main' },
    paths: {
      plan: 'plan',
      phases: 'plan/phases',
      planIndex: 'plan/README.md',
      releases: 'plan/releases.md',
      flows: 'plan/flows',
      frameworkDir: '.'
    }
  }
  write('harness-profile.json', JSON.stringify(profile))
  write(
    'plan/README.md',
    '# Plan\n\n<!-- plan-summary:start -->\n<!-- plan-summary:end -->\n\n<!-- plan-releases:start -->\n<!-- plan-releases:end -->\n\n---\n\n<!-- plan-contents:start -->\n<!-- plan-contents:end -->\n'
  )
  write(
    'plan/phases/phase-1-one.md',
    '# Phase 1 — One (1 SP)\n\n**Status:** 🟡 In progress\n\n| # | Task | SP | Status |\n| - | - | - | - |\n| 1.1 | First | 1 | ✅ |\n'
  )
  write('plan/releases.md', '| Release | Status | Tasks, in order |\n| - | - | - |\n| `1.0.0` | 🟡 | 1.1 |\n')
  write('plan/flows/flow-1-ship-one.md', FLOW)
  write('plan/flows/flow-1-ship-one.log.md', LOG)
  planSummary({ root, profile })
  return { root, profile, write }
}

const gitOf =
  (merged, tags = '') =>
  (args) =>
    args[0] === 'tag' ? tags : merged
const call = (words, { root, profile }, seams = {}) =>
  flowCommand({ words, root, profile, git: gitOf('Plan: 1.1\n'), ...seams })

test('flow check passes on a valid flow and reports a planted defect with its file', () => {
  const scratch = project()
  assert.deepEqual(call(['check'], scratch), {
    lines: ['Checked 1 flow(s): their parts, their steps, what they need and their logs.'],
    code: 0
  })
  scratch.write(
    'plan/flows/flow-1-ship-one.md',
    FLOW.replace('| 2 | cut | home | `1.0.0` | 1 |', '| 2 | cut | home | `1.0.0` | 7 |')
  )
  const broken = call(['check'], scratch)
  assert.equal(broken.code, 1)
  assert.match(broken.lines.join('\n'), /plan\/flows\/flow-1-ship-one\.md: step 2 needs step 7, which does not exist/)
})

test('flow status recomputes each step, names the claim, the step left open and the next step', () => {
  const { lines, code } = call(['status', '1'], project())
  assert.equal(code, 0)
  const text = lines.join('\n')
  assert.match(text, /^Flow 1 — Ship one: mode seamless, `1\.0\.0`\./)
  assert.match(text, /Claimed: a "running" entry of 2026-11-04 10:00 has no "stop" entry after it/)
  assert.match(text, /step 1 \[tasks\] marked ⬜, repository ✅: 1\.1 ✅/)
  assert.match(text, /step 2 \[cut\] marked ⬜, repository ⬜: no tag v1\.0\.0 or 1\.0\.0/)
  assert.match(text, /step 1: marked ⬜, the repository shows ✅/)
  assert.match(text, /step 1: the log has "step 1 started" \(2026-11-04 10:01\) and no end or stop after it/)
  assert.match(text, /Next step: 2 \[cut\] `1\.0\.0` \(state ⬜\)\. `harness flow prompt 1 2` prints its prompt\./)
})

test('flow next prints the next step and its prompt; a finished flow says so', () => {
  const scratch = project()
  const next = call(['next', '1'], scratch)
  assert.equal(next.code, 0)
  assert.equal(next.lines[0], 'Next step of flow 1: 2 [cut], state ⬜.')
  assert.match(next.lines[2], /^You are the worker of step 2 of flow 1, "Ship one"/)
  assert.match(next.lines.join('\n'), /Prepare the cut of the version 1\.0\.0/)
  const done = call(['next', '1'], scratch, { git: gitOf('Plan: 1.1\n', 'v1.0.0\n') })
  assert.deepEqual(done.lines, ['Flow 1 is finished: every step is done.'])
})

test('flow prompt prints the prompt of a named step and refuses an unknown one', () => {
  const scratch = project()
  const prompt = call(['prompt', '1', '1'], scratch)
  assert.equal(prompt.code, 0)
  assert.match(prompt.lines[0], /^You are the worker of step 1 of flow 1/)
  assert.match(prompt.lines[0], /- 1\.1 — First \(done\)/)
  assert.match(prompt.lines[0], /Read AGENTS\.md first/)
  const unknown = call(['prompt', '1', '9'], scratch)
  assert.equal(unknown.code, 1)
  assert.match(unknown.lines[0], /flow 1 has no step 9/)
})

test('a flow waits for the flows it needs; an unknown flow, a flow with problems and a bad command line are refused', () => {
  const scratch = project()
  scratch.write(
    'plan/flows/flow-2-after.md',
    FLOW.replace('Flow 1 — Ship one', 'Flow 2 — After')
      .replace('**Needs:** —', '**Needs:** flow 1')
      .replace('`1.0.0`', '`2.0.0`')
      .replace('flow-1-ship-one.log', 'flow-2-after.log')
  )
  scratch.write('plan/flows/flow-2-after.log.md', LOG.replace('Flow 1 — Ship one', 'Flow 2 — After'))
  const waiting = call(['next', '2'], scratch)
  assert.deepEqual(waiting.lines, ['Flow 2 waits for flow 1, which is not finished.'])
  assert.match(call(['status', '2'], scratch).lines.join('\n'), /Waits for flow 1, which is not finished\./)
  assert.match(call(['status', '7'], scratch).lines[0], /There is no flow 7; the flows are 1, 2\./)
  scratch.write('plan/flows/flow-3-bad.md', '# nothing\n')
  assert.match(call(['status', '3'], scratch).lines[0], /plan\/flows\/flow-3-bad\.md: .*run `harness flow check`/)
  for (const words of [[], ['status'], ['status', 'x'], ['prompt', '1'], ['next', '1', '2'], ['unknown']]) {
    assert.deepEqual(call(words, scratch), {
      lines: ['usage: harness flow check | status <n> | next <n> | prompt <n> <step>'],
      code: 2
    })
  }
  assert.match(
    flowCommand({
      words: ['status', '1'],
      root: scratch.root,
      profile: { ...scratch.profile, paths: { ...scratch.profile.paths, flows: undefined } }
    }).lines[0],
    /names no flows folder/
  )
})

test('the command line routes flow check through the check "flows" and the other commands to the same tools', async () => {
  const { root } = project()
  const lines = []
  const output = { out: (line) => lines.push(line), err: (line) => lines.push(line) }
  assert.equal(await run(['flow', 'check', '--root', root], output), 0)
  assert.match(lines.join('\n'), /Checked 1 flow\(s\)/)
  lines.length = 0
  assert.equal(await run(['check', 'flows', '--root', root], output), 0)
  assert.equal(await run(['flow', 'bogus', '--root', root], output), 2)
  assert.equal(await run(['flow', 'status', '1', '--root', root], output), 0)
})

test('the session start names a flow that is running or waits, and its next step from the State column', () => {
  const none = { dir: 'plan/flows', readme: '', flows: [] }
  assert.deepEqual(flowSessionLines(none), [])
  const lines = flowSessionLines({
    ...none,
    flows: [
      {
        number: 1,
        title: 'Ship one',
        status: '🟡',
        file: 'flow-1-ship-one.md',
        steps: [
          { id: '1', kind: 'tasks', scope: '`1.0.0`', state: '✅', needs: [] },
          { id: '2', kind: 'cut', scope: '`1.0.0`', state: '🟡', needs: ['1'] }
        ]
      }
    ]
  })
  assert.deepEqual(lines, [
    'Flow in progress: 1 — Ship one (plan/flows/flow-1-ship-one.md), 🟡; next step by the State column: 2 [cut] `1.0.0`. `harness flow status 1` recomputes it from the repository; the procedure `run-flow` runs it only when the owner asks.'
  ])
  const done = flowSessionLines({
    ...none,
    flows: [
      { number: 2, title: 'Done', status: '✅', file: 'flow-2-done.md', steps: [] },
      { number: 3, title: 'New', status: '⬜', file: 'flow-3-new.md', steps: [] }
    ]
  })
  assert.deepEqual(done, [])
})
