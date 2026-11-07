// The transcripts of Claude Code (task 6.1): where the sessions of a flow are, and the neutral records of a transcript, on a fixture tree and a fixture transcript.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { transcriptsProblems } from '../../../tools/lib/flow-audit.mjs'
import { defaultRoots, locate, parse, transcriptsFor } from './transcripts.mjs'

const temp = mkdtempSync(join(tmpdir(), 'transcripts-'))
after(() => rmSync(temp, { recursive: true, force: true }))

const line = (value) => JSON.stringify(value)
const usage = (output, extra = {}) => ({
  input_tokens: 2,
  cache_read_input_tokens: 100,
  cache_creation_input_tokens: 10,
  output_tokens: output,
  ...extra
})

/** A transcript: a model answer of two lines (a text and a call, one message id), the result of the call (a string), and a second answer with a list result. */
const FIXTURE = [
  line({ type: 'queue-operation', content: 'ignored' }),
  line({
    type: 'assistant',
    timestamp: '2026-11-05T10:00:00Z',
    message: { id: 'm1', usage: usage(50), content: [{ type: 'text', text: 'x'.repeat(40) }] }
  }),
  line({
    type: 'assistant',
    timestamp: '2026-11-05T10:00:01Z',
    message: {
      id: 'm1',
      usage: usage(50),
      content: [{ type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'git status' } }]
    }
  }),
  line({
    type: 'user',
    timestamp: '2026-11-05T10:00:02Z',
    message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: 'y'.repeat(400) }] }
  }),
  line({
    type: 'assistant',
    timestamp: '2026-11-05T10:00:03Z',
    message: {
      id: 'm2',
      usage: usage(30, { cache_read_input_tokens: 500 }),
      content: [{ type: 'tool_use', id: 't2', name: 'Read', input: { file_path: '/a' } }]
    }
  }),
  line({
    type: 'user',
    message: {
      content: [{ type: 'tool_result', tool_use_id: 't2', content: [{ type: 'text', text: 'z'.repeat(80) }] }]
    }
  }),
  'not json'
].join('\n')

test('a transcript is read into one turn per answer and one result per tool result', () => {
  const { turns, results } = parse(FIXTURE)
  assert.equal(turns.length, 2)
  assert.deepEqual(turns[0].usage, { input: 2, cacheRead: 100, cacheCreate: 10, output: 50 })
  assert.equal(turns[0].outputChars, 40 + JSON.stringify({ command: 'git status' }).length)
  assert.deepEqual(turns[0].calls, [{ id: 't1', tool: 'Bash', command: 'git status' }])
  assert.deepEqual(turns[1].calls, [{ id: 't2', tool: 'Read', command: null }])
  assert.deepEqual(
    results.map(({ callId, chars }) => [callId, chars]),
    [
      ['t1', 400],
      ['t2', 80]
    ]
  )
})

test('an empty or a foreign transcript gives empty lists', () => {
  assert.deepEqual(parse(''), { turns: [], results: [] })
  assert.deepEqual(parse(line({ type: 'custom-title' })), { turns: [], results: [] })
})

test('a session of the app is found through its file, a worker of the command line by the name of its worktree, and a stranger is missing', () => {
  const apps = join(temp, 'app')
  const projects = join(temp, 'projects')
  mkdirSync(join(apps, 'claude-code-sessions', 'account', 'org'), { recursive: true })
  mkdirSync(join(projects, '-repo--claude-worktrees-one'), { recursive: true })
  mkdirSync(join(projects, '-repo--claude-worktrees-flow-1-step-2'), { recursive: true })
  writeFileSync(
    join(apps, 'claude-code-sessions', 'account', 'org', 'local_abc.json'),
    JSON.stringify({ cliSessionId: 'cli-1' })
  )
  writeFileSync(join(projects, '-repo--claude-worktrees-one', 'cli-1.jsonl'), FIXTURE)
  writeFileSync(join(projects, '-repo--claude-worktrees-flow-1-step-2', 'a.jsonl'), FIXTURE)
  writeFileSync(join(projects, '-repo--claude-worktrees-flow-1-step-2', 'b.jsonl'), FIXTURE)
  const roots = { apps: [apps], projects: [projects] }
  const uuid = '09154421-b18d-4603-a9c1-0016ab4c1458'
  mkdirSync(join(projects, '-elsewhere'), { recursive: true })
  writeFileSync(join(projects, '-elsewhere', `${uuid}.jsonl`), FIXTURE)
  const byId = locate({ ids: [uuid, '11111111-2222-3333-4444-555555555555'], roots })
  assert.deepEqual(
    byId.found.map((each) => each.id),
    [uuid]
  )
  assert.deepEqual(byId.missing, ['11111111-2222-3333-4444-555555555555'])
  const { found, missing } = locate({ ids: ['local_abc', 'flow-1-step-2', 'local_gone', 'nobody'], roots })
  assert.deepEqual(
    found.map((each) => each.id),
    ['local_abc', 'flow-1-step-2', 'flow-1-step-2']
  )
  assert.deepEqual(missing, ['local_gone', 'nobody'])
})

test('the role meets the contract, and the default folders are the apps and the configuration folders', () => {
  assert.deepEqual(transcriptsProblems(transcriptsFor({})), [])
  const roots = defaultRoots('/home/u', { CLAUDE_CONFIG_DIR: '/cfg' })
  assert.ok(roots.apps.includes('/home/u/.claude-second'))
  assert.deepEqual(roots.projects, ['/cfg/projects', '/home/u/.claude/projects', '/home/u/.claude-second-cli/projects'])
})
