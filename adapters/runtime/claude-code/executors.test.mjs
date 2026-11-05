// The executors of Claude Code (task 5.5): the model names, and the means each operation offers, held to the contract by the conformance check.
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

test('the executors meet the contract: a session and a subagent, the manual one from the framework', () => {
  const executors = executorsFor({})
  assert.deepEqual(Object.keys(executors), ['session', 'subagent'])
  assert.deepEqual(executorProblems(executors), [])
})

test('a session starts in the desktop app or on the command line with the model and the effort, and continues by its id', () => {
  const { session } = executorsFor({})
  const [app, cli] = session.start({
    prompt: PROMPT,
    model: 'Sonnet 5.5',
    effort: 'high',
    cwd: '.',
    name: 'flow-1-step-2'
  })
  assert.equal(app.tool, 'start_session')
  assert.deepEqual(
    [app.input.model, app.input.effort, app.input.prompt, app.input.initiation, app.input.cwd],
    ['claude-sonnet-5-5', 'high', PROMPT, 'user_asked', undefined]
  )
  assert.ok(app.input.background.length >= 80, 'the app needs a background of 80 characters')
  assert.deepEqual(cli.command, [
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
  assert.equal(session.start({ prompt: PROMPT, cwd: '../consumer', name: 'x' })[0].input.cwd, '../consumer')
  const [send, resume] = session.continue({ worker: 'abc', prompt: PROMPT })
  assert.deepEqual(send.input, { to: 'abc', message: PROMPT })
  assert.deepEqual(resume.command, ['claude', '-p', '--resume', 'abc', '--output-format', 'json', PROMPT])
  assert.equal(session.report({ worker: 'abc' })[0].tool, 'list_events')
  assert.deepEqual(session.context({ worker: 'abc' })[0].input, { session_id: 'abc' })
  assert.equal(session.wakeups, true)
})

test("a session reads the account it runs on: the desktop app's from its session, a command-line worker's from the sign-in of its folder", () => {
  const [app, cli] = executorsFor({}).session.account()
  assert.deepEqual(app.command, ['printenv', 'CLAUDE_CODE_USER_EMAIL'])
  assert.deepEqual(cli.command, ['claude', 'auth', 'status'])
  assert.match(cli.reads, /`email`/)
  assert.equal(
    executorsFor({}).subagent.account,
    undefined,
    'a subagent is never reused, so its account is not compared'
  )
})

test('a subagent gets no CI wake-ups and cannot report its context, so it is never reused', () => {
  const { subagent } = executorsFor({})
  assert.equal(subagent.wakeups, false)
  assert.deepEqual(subagent.context({ worker: 'a' }), [])
  assert.equal(subagent.start({ prompt: PROMPT, model: 'Opus 5.5', name: 'n' })[0].input.model, 'opus')
})
