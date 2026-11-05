// The executors of Claude Code (tasks 5.5 and 2.7): the model names, and the means each operation offers, held to the contract by the conformance check.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { executorProblems } from '../../../tools/conformance/runtime.mjs'
import { executorsFor, modelAlias, modelId } from './executors.mjs'

const PROMPT = '<prompt>'

test('a model of the profile maps to the runtime id and to the family alias of the agent tool', () => {
  assert.equal(modelId('Sonnet 5.5'), 'claude-sonnet-5-5')
  assert.equal(modelId('Opus 5.5'), 'claude-opus-5-5')
  assert.equal(modelId('claude-haiku-5-5'), 'claude-haiku-5-5')
  assert.equal(modelId(null), null)
  assert.equal(modelAlias('Opus 5.5'), 'opus')
  assert.equal(modelAlias(null), null)
})

test('the executors meet the contract in their order: a session, the command line and a subagent, the manual one from the framework', () => {
  const executors = executorsFor({})
  assert.deepEqual(Object.keys(executors), ['session', 'cli', 'subagent'])
  assert.deepEqual(executorProblems(executors), [])
})

test('a session starts in the desktop app with the model and the effort, and continues by its id; the command line is not its means (task 2.7)', () => {
  const { session } = executorsFor({})
  const means = session.start({ prompt: PROMPT, model: 'Sonnet 5.5', effort: 'high', cwd: '.', name: 'flow-1-step-2' })
  assert.equal(means.length, 1, 'the command line is an executor of its own, not a means of the session')
  const [app] = means
  assert.equal(app.tool, 'start_session')
  assert.deepEqual(
    [app.input.model, app.input.effort, app.input.prompt, app.input.initiation, app.input.cwd],
    ['claude-sonnet-5-5', 'high', PROMPT, 'user_asked', undefined]
  )
  assert.ok(app.input.background.length >= 80, 'the app needs a background of 80 characters')
  assert.match(app.reads, /may refuse the start on a turn that a worker's end began/)
  assert.equal(session.start({ prompt: PROMPT, cwd: '../consumer', name: 'x' })[0].input.cwd, '../consumer')
  assert.deepEqual(
    session.continue({ worker: 'abc', prompt: PROMPT }).map((each) => each.input),
    [{ to: 'abc', message: PROMPT }]
  )
  assert.deepEqual(
    session.report({ worker: 'abc' }).map((each) => each.tool),
    ['list_events']
  )
  assert.deepEqual(session.context({ worker: 'abc' })[0].input, { session_id: 'abc' })
  assert.equal(session.wakeups, true)
  assert.match(session.permissions({ permissions: { mode: 'acceptEdits' } }), /the app's own permission settings/)
})

test('a worker on the command line starts with the model and the effort in the folder of its step, and continues by its id', () => {
  const { cli } = executorsFor({})
  const [start] = cli.start({ prompt: PROMPT, model: 'Sonnet 5.5', effort: 'high', cwd: '.', name: 'flow-1-step-2' })
  assert.deepEqual(start.command, [
    'claude',
    '-p',
    '--model',
    'claude-sonnet-5-5',
    '--effort',
    'high',
    '--output-format',
    'json',
    '--name',
    'flow-1-step-2',
    PROMPT
  ])
  assert.match(start.reads, /^run it in the step's repository/)
  assert.match(
    cli.start({ prompt: PROMPT, cwd: '../consumer', name: 'x' })[0].reads,
    /^run it in the folder \.\.\/consumer/
  )
  assert.deepEqual(cli.continue({ worker: 'abc', prompt: PROMPT })[0].command, [
    'claude',
    '-p',
    '--resume',
    'abc',
    '--output-format',
    'json',
    PROMPT
  ])
  assert.match(cli.report({ worker: 'abc' })[0].from, /`result` field/)
  assert.match(cli.context({ worker: 'abc' })[0].from, /contextWindow/)
  assert.equal(cli.wakeups, false)
})

test("each executor reads the account it runs on: a session the desktop app's, a command-line worker the sign-in of its folder", () => {
  const { session, cli, subagent } = executorsFor({})
  assert.deepEqual(
    session.account().map((each) => each.command),
    [['printenv', 'CLAUDE_CODE_USER_EMAIL']]
  )
  const [signIn] = cli.account()
  assert.deepEqual(signIn.command, ['claude', 'auth', 'status'])
  assert.match(signIn.reads, /`email`/)
  assert.equal(subagent.account, undefined, 'a subagent is never reused, so its account is not compared')
})

test('a subagent gets no CI wake-ups and cannot report its context, so it is never reused', () => {
  const { subagent } = executorsFor({})
  assert.equal(subagent.wakeups, false)
  assert.deepEqual(subagent.context({ worker: 'a' }), [])
  assert.equal(subagent.start({ prompt: PROMPT, model: 'Opus 5.5', name: 'n' })[0].input.model, 'opus')
})

test('the permissions of a flow become flags of a worker on the command line, before the output flag (issue I-11)', () => {
  const { cli } = executorsFor({})
  const permissions = { mode: 'acceptEdits', allow: ['Bash(git *)', 'Edit'] }
  const [start] = cli.start({ prompt: PROMPT, model: 'Sonnet 5.5', effort: 'high', name: 'n', permissions })
  assert.deepEqual(start.command, [
    'claude',
    '-p',
    '--model',
    'claude-sonnet-5-5',
    '--effort',
    'high',
    '--permission-mode',
    'acceptEdits',
    '--allowedTools',
    'Bash(git *),Edit',
    '--output-format',
    'json',
    '--name',
    'n',
    PROMPT
  ])
  assert.match(start.reads, /refused every edit and command unless the flow's `permissions` setting allows them/)
  const [resume] = cli.continue({ worker: 'w-1', prompt: PROMPT, permissions: { mode: 'dontAsk' } })
  assert.deepEqual(resume.command.slice(0, 7), [
    'claude',
    '-p',
    '--resume',
    'w-1',
    '--permission-mode',
    'dontAsk',
    '--output-format'
  ])
  // without the setting there is no flag, and the one-line answer says the worker will be refused
  const [bare] = cli.start({ prompt: PROMPT, name: 'n' })
  assert.ok(!bare.command.includes('--permission-mode') && !bare.command.includes('--allowedTools'))
  assert.match(cli.permissions({}), /^none set .*refused every edit and command.*issue I-11/)
  assert.match(
    cli.permissions({ permissions }),
    /runs with the permission mode acceptEdits and these tools allowed: Bash\(git \*\), Edit$/
  )
  assert.deepEqual(executorProblems(executorsFor({})), [])
})
