// A flow across repositories (task 5.8) through `harness flow`: the status of an external step read through the host (a seam), the prompt, the dispatch with the
// folder from the ignored local file, and the check of the rows.
import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { after, test } from 'node:test'
import { flowCommand } from './flow-command.mjs'
import { planSummary } from './plan.mjs'
import { ADAPTER_RUNTIMES } from './runtimes.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const ROOT = join(import.meta.dirname, '..', '..')

const FLOW = (steps, repos = '{ "app": { "remote": "acme/app", "role": "consumer" } }') => `[← Flows](./README.md)

# Flow 1 — Ship and take

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-1-ship-and-take.log.md)

## Settings

\`\`\`json
{ "mode": "seamless", "repos": ${repos} }
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
${steps}
`
const STEPS = `| 1 | cut | home | \`1.0.0\` | — | — | 1 | — | — | ⬜ |
| 2 | consumer-take | app | \`1.0.0\` | 1 | — | 2 | — | C2 | ⬜ |`

function project(flow = FLOW(STEPS)) {
  const root = mkdtempSync(join(tmpdir(), 'flow-repos-'))
  dirs.push(root)
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  cpSync(join(ROOT, 'core'), join(root, 'core'), { recursive: true })
  const profile = {
    project: { title: 'Demo', entryFile: 'AGENTS.md' },
    branches: { integration: 'develop', production: 'main' },
    adapters: { runtimes: ['claude-code'] },
    plan: { complexity: { models: { C2: 'Sonnet 5.5 at high effort' } } },
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
  write('plan/flows/flow-1-ship-and-take.md', flow)
  write('plan/flows/flow-1-ship-and-take.log.md', '# Flow 1 — Ship and take — log\n\n## Entries\n')
  planSummary({ root, profile })
  return { root, profile, write }
}

// The host's reading of the consumer: the lock it holds, and its pull requests
const remote = ({ lock, pullRequests = [], error } = {}) => {
  const calls = []
  return {
    calls,
    readFile: (request) => (
      calls.push(['file', request]),
      error
        ? { found: false, error }
        : lock === undefined
          ? { found: false }
          : { found: true, text: JSON.stringify(lock) }
    ),
    pullRequests: (request) => (calls.push(['prs', request]), { pullRequests })
  }
}
const call = (words, { root, profile }, extra = {}) =>
  flowCommand({
    words,
    root,
    profile,
    runtimes: ADAPTER_RUNTIMES,
    git: () => 'Plan: 1.1\n',
    now: '2026-11-05 10:00',
    ...extra
  })
const step2 = (lines) => lines.find((line) => line.startsWith('  step 2'))

test('status reads the lock of the consumer through the host: done when it names the version', () => {
  const seam = remote({ lock: { version: '1.0.0' } })
  const { lines } = call(['status', '1'], project(), { remote: seam })
  assert.match(step2(lines), /step 2 \[consumer-take\] marked ⬜, repository ✅: the lock of "app" names 1\.0\.0/)
  assert.deepEqual(seam.calls[0], ['file', { slug: 'acme/app', path: 'harness.lock.json' }])
})

test('status says running while a pull request that mentions the version is open, and not started when none does', () => {
  const open = remote({
    lock: { version: '0.9.0' },
    pullRequests: [{ number: 7, title: 'chore: take 1.0.0', state: 'open' }]
  })
  assert.match(
    step2(call(['status', '1'], project(), { remote: open }).lines),
    /repository 🟡: the lock of "app" names 0\.9\.0, not 1\.0\.0; pull request #7 \(chore: take 1\.0\.0\) is open/
  )
  assert.deepEqual(open.calls[1], ['prs', { slug: 'acme/app', text: '1.0.0' }])
  assert.match(
    step2(call(['status', '1'], project(), { remote: remote({ lock: { version: '0.9.0' } }) }).lines),
    /repository ⬜: .*no pull request mentions 1\.0\.0/
  )
  assert.match(
    step2(call(['status', '1'], project(), { remote: remote({ lock: undefined }) }).lines),
    /repository ⬜: the repository "app" has no lock/
  )
})

test('a repository the host cannot read leaves the mark in charge, and says so', () => {
  const { lines } = call(['status', '1'], project(), { remote: remote({ error: 'Bad credentials' }) })
  assert.match(
    step2(lines),
    /marked ⬜, repository ⬜ \(the repository cannot say\): the lock of the repository "app" cannot be read from here/
  )
})

test("the prompt of an external step names the remote and the folder, and sends the worker to that repository's own entry file", () => {
  const scratch = project()
  scratch.write('harness-profile.local.json', JSON.stringify({ repos: { app: '../app' } }))
  const { lines } = call(['prompt', '1', '2'], scratch)
  const text = lines.join('\n')
  assert.match(text, new RegExp(`Repository: app \\(acme/app, at ${resolve(scratch.root, '../app')}\\)`))
  assert.match(text, /This step runs in the repository "app" \(acme\/app\), which is not the flow's home repository/)
  assert.doesNotMatch(text, /Read AGENTS\.md first/)
  assert.doesNotMatch(call(['prompt', '1', '1'], scratch).lines.join('\n'), /Repository:/)
})

test('dispatch starts the worker in the folder of the external repository, and falls back to the owner when the folder is not set', () => {
  const scratch = project()
  scratch.write('harness-profile.local.json', JSON.stringify({ repos: { app: '/work/app' } }))
  const text = call(['dispatch', '1', '2'], scratch).lines.join('\n')
  assert.match(text, /"cwd":"\/work\/app"/)
  assert.match(text, /Worker: a fresh one/)
  const unset = call(['dispatch', '1', '2'], project()).lines.join('\n')
  assert.match(unset, /the manual executor|the manual one/)
  assert.match(
    unset,
    /Note: the folder of the repository "app" on this machine is not set \(`repos\.app` in harness-profile\.local\.json\)/
  )
  assert.doesNotMatch(unset, /start_session/)
  // the home step is not affected
  assert.doesNotMatch(call(['dispatch', '1', '1'], scratch).lines.join('\n'), /"cwd"/)
})

test('flow check holds the rows: a bad row, a kind the repository does not allow, a task id of the other plan, a release cut over there', () => {
  assert.equal(call(['check'], project()).code, 0)
  const bad = project(
    FLOW(
      `| 1 | cut | app | \`1.0.0\` | — | — | 1 | — | — | ⬜ |
| 2 | consumer-take | app | \`1.0.0\` | 1 | — | 2 | — | C2 | ⬜ |
| 3 | consumer-take | gone | \`1.0.0\` | 2 | — | 2 | — | C2 | ⬜ |`,
      '{ "app": { "remote": "nowhere", "role": "consumer", "kinds": ["cut"] }, "tool": "../tool" }'
    )
  )
  const text = call(['check'], bad).lines.join('\n')
  assert.match(text, /the repository "app" has no remote "owner\/name"/)
  assert.match(text, /the repository "app" allows the kind "cut"/)
  assert.match(text, /the repository "tool" is not a row/)
  assert.match(
    text,
    /step 1 is a cut step in the repository "app"; only consumer-take and custom run in an external repository/
  )
  assert.match(
    text,
    /step 3 names the repository "gone", which the flow's "repos" setting does not hold \(home, app, tool\)/
  )
  const named = project(
    FLOW(`| 1 | cut | home | \`1.0.0\` | — | — | 1 | — | — | ⬜ |
| 2 | consumer-take | app | \`1.0.0\`, I-3 | 1 | — | 2 | — | C2 | ⬜ |`)
  )
  assert.match(call(['check'], named).lines.join('\n'), /step 2 runs in the repository "app" and names I-3/)
})

test('a flow of the home repository only needs no Repo column and no repos setting', () => {
  const home = project(`[← Flows](./README.md)

# Flow 1 — Ship and take

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-1-ship-and-take.log.md)

## Settings

\`\`\`json
{ "mode": "seamless" }
\`\`\`

## Steps

| # | Kind | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
| 1 | cut | \`1.0.0\` | — | — | 1 | — | — | ⬜ |
`)
  assert.equal(call(['check'], home).code, 0)
  assert.match(call(['prompt', '1', '1'], home).lines.join('\n'), /Prepare the cut of the version 1\.0\.0/)
})
