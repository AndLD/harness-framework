// The executors of a flow (task 5.5): the pick of an executor, the worker the log names, the reuse rule with each condition that forbids it, and the means
// rendered for the orchestrator.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  EXTERNAL_REASON,
  MANUAL_EXECUTOR,
  PROMPT_SLOT,
  decideReuse,
  dispatchStep,
  nextInOrder,
  pickExecutor,
  pickStepExecutor,
  previousWorker,
  renderMeans,
  runtimeExecutors,
  splitModel,
  stepModel,
  workerEntries
} from './flow-executors.mjs'
import { FLOW_DEFAULTS } from './flows.mjs'
import { parseStep } from './flow-steps.mjs'

const profile = {
  adapters: { runtimes: ['demo'] },
  plan: {
    complexity: {
      scale: { C1: 'routine', C2: 'standard', C3: 'judgment' },
      models: { C1: 'Sonnet 5.5 at medium effort', C2: 'Sonnet 5.5 at high effort', C3: 'Opus 5.5 at high effort' }
    }
  }
}

const row = (id, kind, scope, needs = '—', model = 'C2', repo = 'home') =>
  parseStep({ '#': id, kind, repo, scope, needs, 'stops for': '—', sp: '1', 'est. usage': '—', model, state: '⬜' })

const flowOf = (steps, settings = {}) => ({ number: 1, settings: { ...FLOW_DEFAULTS, ...settings }, steps })

const executor = {
  means: 'a demo session',
  wakeups: true,
  cacheMinutes: 60,
  start: () => [{ via: 'demo', command: ['demo', PROMPT_SLOT] }],
  continue: () => [{ via: 'demo', command: ['demo', '--resume', PROMPT_SLOT] }],
  report: () => [{ via: 'demo', from: 'the answer' }],
  context: () => [{ via: 'demo', from: 'the answer' }]
}

const STEPS = [row('1', 'tasks', '`1.0.0`'), row('2', 'tasks', '`1.0.0`', '1'), row('3', 'tasks', '2.1', '—')]
const worker = {
  id: 'w-1',
  kind: 'session',
  step: '1',
  model: 'Sonnet 5.5 at high effort',
  steps: ['1'],
  lastAt: '2026-11-04 10:00',
  paused: false
}
const decide = (overrides = {}) =>
  decideReuse({
    flow: flowOf(STEPS),
    step: STEPS[1],
    executor,
    kind: 'session',
    worker,
    context: 20,
    now: '2026-11-04 10:30',
    profile,
    facts: { releaseRows: [], phases: [] },
    ...overrides
  })

test('a model of the profile splits into the model and its effort, and a step reads its marker through the profile', () => {
  assert.deepEqual(splitModel('Sonnet 5.5 at high effort'), { model: 'Sonnet 5.5', effort: 'high' })
  assert.deepEqual(splitModel('claude-opus-5-5'), { model: 'claude-opus-5-5', effort: null })
  assert.equal(splitModel(''), null)
  assert.deepEqual(stepModel(row('1', 'tasks', '`1.0.0`'), profile), {
    text: 'Sonnet 5.5 at high effort',
    marker: 'C2'
  })
  assert.deepEqual(stepModel(row('1', 'cut', '`1.0.0`', '—', '—'), profile), { text: null, marker: null })
  assert.deepEqual(stepModel(row('1', 'tasks', '`1.0.0`', '—', 'Haiku 5.5'), profile), {
    text: 'Haiku 5.5',
    marker: null
  })
})

test('the executors come from the first runtime that fills the role, else the manual one of the framework', () => {
  const runtimes = {
    plain: { manifest: { roles: {} }, modules: {} },
    demo: {
      manifest: { roles: { executors: { module: 'executors.mjs', export: 'executorsFor' } } },
      modules: { 'executors.mjs': { executorsFor: () => ({ session: executor }) } }
    }
  }
  const found = runtimeExecutors({ adapters: { runtimes: ['plain', 'demo'] } }, runtimes)
  assert.equal(found.runtime, 'demo')
  assert.deepEqual(Object.keys(found.executors).sort(), ['manual', 'session'])
  assert.deepEqual(runtimeExecutors({ adapters: { runtimes: [] } }, runtimes), {
    runtime: null,
    executors: { manual: MANUAL_EXECUTOR }
  })
})

test("a step's own executor wins over the flow's, and one the runtime lacks goes to the manual executor", () => {
  const executors = { manual: MANUAL_EXECUTOR, session: executor }
  assert.equal(pickExecutor(flowOf(STEPS), STEPS[0], executors).kind, 'session')
  const own = pickExecutor(flowOf(STEPS), row('1', 'tasks', '`1.0.0` (executor: manual)'), executors)
  assert.deepEqual([own.kind, own.source], ['manual', "the step's own"])
  const lacking = pickExecutor(flowOf(STEPS, { executor: 'subagent' }), STEPS[0], executors)
  assert.equal(lacking.kind, 'manual')
  assert.match(lacking.note, /the runtime offers no subagent executor/)
})

const LOG = `# Flow 1 — Demo — log

## Entries

\`\`\`markdown
### 2026-11-04 09:00 — step 9 started
- **Executor:** session · **Worker:** <the worker's id> · **Model:** <model>
\`\`\`

### 2026-11-04 10:00 — running
- **Orchestrator:** s1

### 2026-11-04 10:01 — step 1 started
- **Executor:** session · **Worker:** w-1 · **Model:** Sonnet 5.5 at high effort · **Estimate:** 1 SP, —

### 2026-11-04 10:20 — step 1 ended: done

### 2026-11-04 10:21 — step 2 started
- **Executor:** session, reused from step 1 · **Worker:** w-1 · **Account:** one@example.com · **Model:** Sonnet 5.5 at high effort · **Estimate:** 1 SP, —

### 2026-11-04 10:40 — step 2 ended: done
`

test('the log names the previous worker, the steps it ran, its last turn and a stop since then', () => {
  assert.equal(
    workerEntries(LOG).filter((entry) => entry.kind === 'started').length,
    2,
    'the fenced template is not an entry'
  )
  assert.deepEqual(previousWorker(LOG, '3'), {
    id: 'w-1',
    kind: 'session',
    step: '2',
    account: 'one@example.com',
    model: 'Sonnet 5.5 at high effort',
    steps: ['1', '2'],
    lastAt: '2026-11-04 10:40',
    paused: false
  })
  assert.equal(previousWorker(`${LOG}\n### 2026-11-04 10:41 — stop: waits for the owner\n`, '3').paused, true)
  assert.equal(previousWorker(LOG.replace(/\*\*Worker:\*\* w-1/g, '**Worker:** —'), '3'), null)
  assert.equal(previousWorker('', '1'), null)
  // a step the orchestrator ran itself (a cut at its own level, no worker) does not end the previous worker's line
  const between = `${LOG}
### 2026-11-04 10:41 — step 3 started
- **Executor:** orchestrator, no worker · **Worker:** — · **Model:** —

### 2026-11-04 10:42 — step 3 ended: done
`
  assert.equal(previousWorker(between, '4').id, 'w-1')
  assert.equal(previousWorker(between, '4').step, '2')
  assert.equal(
    previousWorker(LOG.replace(/ · \*\*Account:\*\* one@example\.com/g, ''), '3').account,
    null,
    'an older log'
  )
})

test('a related step of the same repository, model and effort, with a small context and a warm cache, continues the worker', () => {
  const warm = decide()
  assert.equal(warm.reuse, true)
  assert.equal(warm.keptModel, null)
  assert.deepEqual(warm.reasons, [
    'the same repository',
    'the step needs the previous one',
    'the same model and effort',
    'its context is 20% of its window',
    'its last turn was 30 minutes ago, inside the 60 minutes of its prompt cache',
    'it has run 1 of 3 steps'
  ])
  const sameRelease = decide({ step: row('2', 'tasks', '`1.0.0`') })
  assert.ok(sameRelease.reasons.includes('both are steps of `1.0.0`'))
  const viaReleases = decide({
    flow: flowOf([row('1', 'tasks', '1.1'), row('2', 'tasks', '1.2')]),
    step: row('2', 'tasks', '1.2'),
    facts: { releaseRows: [{ release: '`1.0.0`', tasks: '1.1, 1.2' }], phases: [] }
  })
  assert.ok(viaReleases.reasons.includes('both build `1.0.0`'), viaReleases.reasons.join('; '))
})

test('each condition alone forbids the reuse, with its reason', () => {
  const cases = [
    [{ flow: flowOf(STEPS, { reuse: 'never' }) }, /the flow's setting reuse is "never"/],
    [{ worker: null }, /no previous worker is named in the log/],
    [{ kind: 'subagent' }, /the previous worker is a session one, this step goes to a subagent one/],
    [{ executor: { ...executor, continue: () => [] } }, /the session executor cannot continue a worker/],
    [{ executor: { ...executor, context: () => [] } }, /the session executor cannot read a worker's context/],
    [{ step: row('2', 'tasks', '`1.0.0`', '1', 'C2', 'consumer') }, /another repository \(home, then consumer\)/],
    [{ step: row('2', 'tasks', '2.1') }, /the steps are not related/],
    [
      { step: row('2', 'tasks', '`1.0.0`', '1', 'C3') },
      /another model or effort \(Sonnet 5\.5 at high effort, then Opus 5\.5 at high effort\)/
    ],
    [{ context: null }, /the worker's context was not read/],
    [{ context: 40 }, /the worker's context is 40% of its window, not below 40%/],
    [{ worker: { ...worker, paused: true } }, /the flow stopped for the owner or a usage reset since its last turn/],
    [{ now: '2026-11-04 11:30' }, /its last turn was 90 minutes ago, past the 60 minutes its prompt cache lives/],
    [{ worker: { ...worker, steps: ['a', 'b', 'c'] } }, /it has run 3 steps, the limit is 3/],
    [{ worker: { ...worker, step: '7' } }, /the log names step 7, which the flow does not have/],
    [
      { worker: { ...worker, account: 'one@example.com' }, account: 'two@example.com' },
      /another account \(one@example\.com, then two@example\.com\)/
    ]
  ]
  for (const [overrides, reason] of cases) {
    const decision = decide(overrides)
    assert.equal(decision.reuse, false, String(reason))
    assert.match(decision.reasons.join('; '), reason)
  }
})

test('the account counts only when both are known: the same one is warm, an unknown one leaves it to the other conditions', () => {
  const known = { ...worker, account: 'one@example.com' }
  const same = decide({ worker: known, account: 'one@example.com' })
  assert.equal(same.reuse, true)
  assert.ok(same.reasons.includes('the same account'))
  for (const [logged, current] of [
    [known, null],
    [worker, 'two@example.com']
  ]) {
    const decision = decide({ worker: logged, account: current })
    assert.equal(decision.reuse, true)
    assert.ok(!decision.reasons.some((reason) => reason.includes('account')))
  }
})

test('the flow sets the limits of the reuse, and the cache of the executor unless the flow names its own', () => {
  assert.equal(decide({ flow: flowOf(STEPS, { reuseLimits: { context: 15 } }) }).reuse, false)
  assert.equal(decide({ flow: flowOf(STEPS, { reuseLimits: { steps: 1 } }) }).reuse, false)
  assert.match(
    decide({ flow: flowOf(STEPS, { reuseLimits: { cacheMinutes: 5 } }) }).reasons.join('; '),
    /past the 5 minutes its prompt cache lives/
  )
  assert.equal(
    decide({ executor: { ...executor, cacheMinutes: 0 }, now: '2026-11-04 10:00' }).reuse,
    true,
    'no pause at all'
  )
})

test("a smaller step after a related bigger one keeps the bigger step's model, a D0 decision; a bigger one after a smaller does not", () => {
  const smaller = decide({ step: row('2', 'tasks', '`1.0.0`', '1', 'C1') })
  assert.equal(smaller.reuse, true)
  assert.equal(smaller.keptModel, 'Sonnet 5.5 at high effort')
  const bigger = decide({
    flow: flowOf([row('1', 'tasks', '`1.0.0`', '—', 'C1'), STEPS[1]]),
    worker: { ...worker, model: 'Sonnet 5.5 at medium effort' }
  })
  assert.equal(bigger.reuse, false)
  const dash = decide({ step: row('2', 'cut', '`1.0.0`', '1', '—') })
  assert.deepEqual([dash.reuse, dash.keptModel], [true, 'Sonnet 5.5 at high effort'])
})

test('a means renders as a line: the prompt slot of a command becomes the command that prints it, and of a tool a pointer to its text', () => {
  const prompt = 'node tools/harness.mjs flow prompt 1 2'
  assert.equal(
    renderMeans({ via: 'cli', command: ['run', '--name', 'a b', PROMPT_SLOT], reads: 'the answer' }, prompt),
    `cli: run \`run --name 'a b' "$(node tools/harness.mjs flow prompt 1 2)"\` — the answer`
  )
  assert.equal(
    renderMeans({ via: 'app', tool: 'start', input: { prompt: PROMPT_SLOT, n: 1 } }, prompt),
    'app: call start {"prompt":"<the text that `node tools/harness.mjs flow prompt 1 2` prints>","n":1}'
  )
  assert.equal(renderMeans({ via: 'the owner', owner: 'Paste it.' }, prompt), 'the owner: Paste it.')
  assert.equal(renderMeans({ via: 'cli', from: 'the result field' }, prompt), 'cli: the result field')
})

test("dispatch passes the flow's permissions to the means and says what a worker will be allowed; a runtime that says nothing prints no line (issue I-11)", () => {
  const session = {
    ...executor,
    start: (request) => [{ via: 'cli', command: ['run', JSON.stringify(request.permissions ?? null), PROMPT_SLOT] }],
    permissions: ({ permissions }) => (permissions ? `allowed: ${permissions.mode}` : 'none set')
  }
  const profileOf = { adapters: { runtimes: ['rt'] } }
  const dispatch = (settings, executors) =>
    dispatchStep({
      flow: flowOf(STEPS, settings),
      step: STEPS[0],
      profile: profileOf,
      runtimes: {
        rt: { manifest: { roles: { executors: { module: 'm', export: 'e' } } }, modules: { m: { e: () => executors } } }
      },
      logText: '',
      now: '2026-11-04 10:00',
      harness: 'h'
    }).lines.join('\n')
  const text = dispatch({ permissions: { mode: 'acceptEdits' } }, { session })
  assert.match(text, /Permissions: allowed: acceptEdits\./)
  assert.match(text, /run '\{"mode":"acceptEdits"\}' /)
  assert.match(dispatch({}, { session }), /Permissions: none set\./)
  assert.doesNotMatch(dispatch({}, { session: executor }), /Permissions:/)
})

// A runtime with the three executors of the order (task 2.7): a session, a worker on the command line, and the manual one of the framework
const cli = {
  ...executor,
  means: 'a demo worker on the command line',
  wakeups: false,
  start: () => [{ via: 'shell', command: ['demo-cli', PROMPT_SLOT] }],
  report: () => [{ via: 'shell', from: 'its result field' }],
  permissions: () => 'the demo mode'
}
const ordered = {
  rt: {
    manifest: { roles: { executors: { module: 'm', export: 'e' } } },
    modules: { m: { e: () => ({ session: executor, cli }) } }
  }
}
const dispatchOrdered = (overrides = {}) =>
  dispatchStep({
    flow: flowOf(STEPS),
    step: STEPS[0],
    profile: { ...profile, adapters: { runtimes: ['rt'] } },
    runtimes: ordered,
    logText: '',
    now: '2026-11-06 01:00',
    harness: 'h',
    ...overrides
  })

test('the order of the executors: a session, then the command line, then the manual one; a subagent stands outside it (task 2.7)', () => {
  const all = { manual: MANUAL_EXECUTOR, session: executor, cli }
  assert.equal(nextInOrder('session', all), 'cli')
  assert.equal(nextInOrder('cli', all), 'manual')
  assert.equal(nextInOrder('manual', all), null)
  assert.equal(nextInOrder('subagent', all), null)
  assert.equal(nextInOrder('session', { manual: MANUAL_EXECUTOR }), 'manual')
  // a runtime without a session goes to the next executor it offers, and the reason is kept for the log line
  const noSession = pickExecutor(flowOf(STEPS), STEPS[0], { manual: MANUAL_EXECUTOR, cli })
  assert.deepEqual(
    [noSession.kind, noSession.planned, noSession.reason],
    ['cli', 'session', 'the runtime offers no session executor']
  )
  assert.match(noSession.note, /so the step goes to the cli one \(a D0 decision to log\)/)
  assert.deepEqual(pickExecutor(flowOf(STEPS, { executor: 'cli' }), STEPS[0], all).reason, null)
})

test('a session step prints the command line as the fallback for this step only, with the log line that names it (task 2.7)', () => {
  const { lines, plan } = dispatchOrdered()
  const text = lines.join('\n')
  assert.deepEqual([plan.kind, plan.planned, plan.fallback], ['session', 'session', 'cli'])
  assert.match(text, /^Step 1 of flow 1 \[tasks\]: the session executor \(the flow's setting\)/)
  assert.match(
    text,
    /If the session start is refused or fails, do not retry it and do not wait: the fallback for this step only is the cli executor \(the order of the executors; the next step is dispatched again and goes back to session\)\. Log a decision D0 "step 1: <why the session start failed>, so the cli executor runs it"/
  )
  assert.match(
    text,
    /\n {2}- shell: run `demo-cli "\$\(h flow prompt 1 1\)"`\n {2}- its permissions: the demo mode\n {2}- fetch its report: shell: its result field\n/
  )
  assert.match(
    text,
    / {2}- then log: - \*\*Executor:\*\* cli, the fallback of session: <why the session start failed> · \*\*Worker:\*\* <the id the start returns>/
  )
  // the step's own line names the session alone
  assert.match(text, /Log "step 1 started" with: - \*\*Executor:\*\* session · \*\*Worker:\*\*/)
  // a worker on the command line may sign in to another account than the orchestrator's, so its line reads its own
  const signedIn = { ...cli, account: () => [{ via: 'shell', command: ['who-cli'] }] }
  const twoAccounts = dispatchOrdered({
    account: 'app@example.com',
    runtimes: {
      rt: {
        manifest: ordered.rt.manifest,
        modules: { m: { e: () => ({ session: executor, cli: signedIn }) } }
      }
    }
  }).lines.join('\n')
  assert.match(twoAccounts, / {2}- read the account it runs on: shell: run `who-cli`/)
  assert.match(twoAccounts, /- then log: - \*\*Executor:\*\* cli, .* · \*\*Account:\*\* <the account it runs on> ·/)
  assert.match(twoAccounts, /Log "step 1 started" with: .* · \*\*Account:\*\* app@example\.com ·/)
  // a worker on the command line that is itself the fallback falls back to the manual one
  const fromCli = dispatchOrdered({ flow: flowOf(STEPS, { executor: 'cli' }) })
  assert.equal(fromCli.plan.fallback, 'manual')
  assert.match(
    fromCli.lines.join('\n'),
    /- then log: - \*\*Executor:\*\* manual, the fallback of cli: <why the cli start failed>/
  )
  assert.equal(dispatchOrdered({ flow: flowOf(STEPS, { executor: 'subagent' }) }).plan.fallback, null)
})

test('the log names the worker on the command line with whose fallback it is and why, and the next session step does not continue it', () => {
  const log = `# Flow 1 — Demo — log

## Entries

### 2026-11-06 00:41 — step 1 started
- **Executor:** cli, the fallback of session: the app refused the start on a turn that a worker began · **Worker:** c-1 · **Account:** one@example.com · **Model:** Sonnet 5.5 at high effort · **Estimate:** 1 SP, —

### 2026-11-06 01:00 — step 1 ended: done
`
  const [started] = workerEntries(log)
  assert.deepEqual(
    [started.executor, started.fallbackOf, started.reason, started.worker],
    ['cli', 'session', 'the app refused the start on a turn that a worker began', 'c-1']
  )
  // the fallback is for one step at a time: the next step is planned for a session again, so the worker on the command line is not carried to it
  const { lines, plan } = dispatchOrdered({ step: STEPS[1], logText: log, context: 10, account: 'one@example.com' })
  assert.deepEqual([plan.kind, plan.reuse], ['session', false])
  assert.match(lines.join('\n'), /not c-1: the previous worker is a cli one, this step goes to a session one/)
})

test('a step in another repository goes to the command line with the reason, unless the step names its own executor or the runtime has no command line', () => {
  const external = {
    ...flowOf(STEPS),
    settings: { ...FLOW_DEFAULTS, repos: { app: { remote: 'acme/app', role: 'consumer' } } }
  }
  const step = row('2', 'consumer-take', '`1.0.0`', '1', 'C2', 'app')
  const all = { manual: MANUAL_EXECUTOR, session: executor, cli }
  const picked = pickStepExecutor({ flow: external, step, executors: all, repoPaths: { app: '/work/app' } })
  assert.deepEqual([picked.kind, picked.planned, picked.reason], ['cli', 'session', EXTERNAL_REASON])
  const own = row('2', 'consumer-take', '`1.0.0` (executor: manual)', '1', 'C2', 'app')
  assert.equal(
    pickStepExecutor({ flow: external, step: own, executors: all, repoPaths: { app: '/work/app' } }).kind,
    'manual'
  )
  const withoutCli = { manual: MANUAL_EXECUTOR, session: executor }
  assert.equal(
    pickStepExecutor({ flow: external, step, executors: withoutCli, repoPaths: { app: '/work/app' } }).kind,
    'session'
  )
  assert.equal(pickStepExecutor({ flow: external, step, executors: all }).kind, 'manual', 'the folder is not set')
  assert.equal(pickStepExecutor({ flow: external, step: STEPS[0], executors: all }).kind, 'session', 'a home step')
})
