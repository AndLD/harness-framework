// The prompt of a step (task 5.4): the standard wording of the template, written once, filled for each kind; a custom step carries its own text.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { customText, fillWords, promptSections, renderPrompt } from './flow-prompt.mjs'
import { parseFlow } from './flows.mjs'

const TEMPLATE = readFileSync(join(import.meta.dirname, '..', '..', 'core/plan/flow-step-prompts.md'), 'utf8')
const row = (...cells) => `| ${cells.join(' | ')} |`
const flow = parseFlow(
  'flow-2-ship.md',
  `# Flow 2 — Ship the thing

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-2-ship.log.md)

## Settings

\`\`\`json
{ "repos": { "app": { "remote": "acme/app", "role": "consumer" } } }
\`\`\`

## Steps

| # | Kind | Repo | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
${row(1, 'tasks', 'home', '`1.0.0` (executor: manual)', '—', '—', 5, '—', 'C2', '⬜')}
${row(2, 'cut', 'home', '`1.0.0`', '1', '—', 1, '—', '—', '⬜')}
${row(3, 'consumer-take', 'app', '`1.0.0`', '2', '—', 2, '—', 'C2', '⬜')}
${row(4, 'triage-fix', 'home', 'I-1', '3', '—', 1, '—', 'C1', '⬜')}
${row(5, 'decision', 'home', 'ship the next one?', '4', 'D3', 1, '—', '—', '⬜')}
${row('5a', 'custom', 'home', 'a probe', '5', '—', 1, '—', 'C3', '⬜')}

## Step 5a

Run the probe in a scratch folder.
It reads only the folder.

## Later

Not part of the step.
`
)
const facts = {
  statuses: new Map([
    ['1.1', '✅'],
    ['1.2', '🟡'],
    ['I-1', '⬜']
  ]),
  titles: new Map([
    ['1.1', 'First'],
    ['1.2', 'Second']
  ]),
  merged: new Set(['1.1']),
  releaseRows: [{ release: '`1.0.0`', tasks: '1.1, 1.2' }],
  phases: []
}
const values = { entryFile: 'AGENTS.md', integration: 'develop', production: 'main' }
const prompt = (step) => renderPrompt({ flow, step, facts, template: TEMPLATE, values })

test('the template has a section for every part of a prompt', () => {
  assert.deepEqual(Object.keys(promptSections(TEMPLATE)), [
    'header',
    'external',
    'tasks',
    'cut',
    'consumer-take',
    'triage-fix',
    'decision',
    'commands',
    'git',
    'stop',
    'report'
  ])
})

test('a tasks step lists its ids in order with their state, and gets the header, the Git wording, where to stop and the step report', () => {
  const { prompt: text, problems } = prompt('1')
  assert.deepEqual(problems, [])
  assert.match(text, /^You are the worker of step 1 of flow 2, "Ship the thing"/)
  assert.match(text, /Kind: tasks\nModel: C2\nScope: `1\.0\.0`\n/, 'the home repository has no Repository line')
  assert.doesNotMatch(text, /executor/, 'the override is for the orchestrator, not the worker')
  assert.match(text, /- 1\.1 — First \(done\)\n- 1\.2 — Second \(in progress: continue it\)/)
  assert.match(text, /Read AGENTS\.md first/)
  assert.match(text, /integration branch \(develop\)[\s\S]*retarget the pull request to develop[\s\S]*Never touch main/)
  assert.match(text, /Stop when this step is done/)
  assert.match(text, /End with a step report[\s\S]*Recommendations, last/)
  assert.doesNotMatch(text, /\{|\}/, 'no word is left unfilled')
})

test('a cut step names the version and leaves the merge and the tag to the orchestrator; it gets no Git claim wording', () => {
  const { prompt: text } = prompt('2')
  assert.match(text, /Prepare the cut of the version 1\.0\.0 by the procedure `release`/)
  assert.match(text, /Do not merge a release pull request into the production branch and do not tag/)
  assert.doesNotMatch(text, /Claim each task/)
  assert.doesNotMatch(text, /^Model:/m, 'a step without a model has no Model line')
})

test('a consumer-take step names the repository and its path; a triage-fix step its issues; a decision changes no file', () => {
  const take = prompt('3').prompt
  assert.match(take, /Repository: app \(acme\/app\)\nModel: C2/)
  assert.match(take, /Take the version 1\.0\.0 in the repository of this step/)
  assert.doesNotMatch(
    take,
    /Read AGENTS\.md first/,
    "an external worker is not sent to the home repository's entry file"
  )
  assert.match(
    take,
    /This step runs in the repository "app" \(acme\/app\), which is not the flow's home repository\. Read that repository's own entry file first/
  )
  assert.match(take, /never by the task ids of that repository's plan/)
  assert.doesNotMatch(prompt('2').prompt, /which is not the flow's home repository/)
  assert.match(prompt('4').prompt, /Triage the open reports[\s\S]*- I-1\n[\s\S]*Claim each task/)
  assert.match(prompt('5').prompt, /This step is a decision, not a build\. Change no file/)
})

test('a custom step carries its own text, between the header and the standard endings, and only its own section', () => {
  const { prompt: text } = prompt('5a')
  assert.match(
    text,
    /Scope: a probe\nRead AGENTS\.md first[^\n]*\nYou do this step and no other[^\n]*\n\nRun the probe in a scratch folder\.\nIt reads only the folder\.\n\nStop when/
  )
  assert.doesNotMatch(text, /Not part of the step/)
  assert.equal(customText(flow.text, '5a'), 'Run the probe in a scratch folder.\nIt reads only the folder.')
  assert.equal(customText(flow.text, '9'), null)
})

test('a prompt cannot be rendered for an unknown step, a custom step without its text, or a template without a section', () => {
  assert.match(prompt('9').problems[0], /flow 2 has no step 9; its steps are 1, 2, 3, 4, 5, 5a/)
  const bare = parseFlow('flow-2-ship.md', flow.text.replace(/## Step 5a[\s\S]*?(?=## Later)/, ''))
  assert.match(
    renderPrompt({ flow: bare, step: '5a', facts, template: TEMPLATE, values }).problems[0],
    /has no section "## Step 5a"/
  )
  const cut = TEMPLATE.replace(/## report[\s\S]*$/, '')
  assert.match(renderPrompt({ flow, step: '1', facts, template: cut, values }).problems[0], /no section "report"/)
})

test('a line with a word that has no value is left out, and the text of a section loses its comments', () => {
  assert.equal(fillWords('a {x}\nb {y}\nc', { x: 1, y: '' }), 'a 1\nc')
  assert.equal(fillWords('m {model}', { model: '—' }), '')
  assert.deepEqual(promptSections('intro\n## one\n\ntext <!-- gone -->\n## two\nmore\n'), { one: 'text', two: 'more' })
})

test('the setting commands "plain" adds the section of plain commands before the Git wording; "any", the default, leaves it out', () => {
  const withCommands = (commands) =>
    parseFlow(
      'flow-3-plain.md',
      `# Flow 3 — Plain

**Releases:** \`1.0.0\` · **Needs:** — · **Log:** [log](./flow-3-plain.log.md)

## Settings

\`\`\`json
${commands ? `{ "commands": "${commands}" }` : '{}'}
\`\`\`

## Steps

| # | Kind | Scope | Needs | Stops for | SP | Est. usage | Model | State |
| - | ---- | ----- | ----- | --------- | -- | ---------- | ----- | ----- |
${row(1, 'tasks', '1.1', '—', '—', 1, '—', 'C2', '⬜')}
`
    )
  const render = (commands) =>
    renderPrompt({ flow: withCommands(commands), step: '1', facts, template: TEMPLATE, values }).prompt
  const plain = render('plain')
  assert.match(plain, /Run plain commands/)
  assert.match(plain, /never by a heredoc/)
  assert.ok(plain.indexOf('Run plain commands') < plain.indexOf('Git rules for this step'))
  assert.doesNotMatch(plain, /<!--/)
  assert.doesNotMatch(render('any'), /Run plain commands/)
  assert.doesNotMatch(render(undefined), /Run plain commands/)
  assert.equal(withCommands(undefined).settings.commands, 'any')
})
