import assert from 'node:assert/strict'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { settingsFor } from '../../adapters/runtime/claude-code/settings.mjs'
import { AUTOMATED, checkSecurity, scriptableProbes } from './security.mjs'
import { runCheck } from './checks.mjs'
import { loadProfile } from './profile.mjs'
import { git, removeRepos, repo } from './test-repo.mjs'

after(removeRepos)
const home = join(import.meta.dirname, '..', '..')
const profile = loadProfile(home)
const catalogue = join(home, 'core', 'reviews', 'security', 'probes')
const SHA = 'a'.repeat(40)

const CLEAN = {
  '.gitignore': '.env\n.env.*\n!.env.example\n*.pem\n*.key\n',
  '.claude/settings.json': JSON.stringify(settingsFor(profile)),
  '.github/workflows/ci.yml': `on: push\npermissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@${SHA}\n`,
  'package.json': JSON.stringify({ devDependencies: { prettier: '3.8.1' } }),
  'package-lock.json': '{}',
  'README.md': 'A project.\n'
}
const probesOf = ({ problems }) => problems.map((problem) => problem.split(' ')[0])

test('every probe that a check names is a scriptable probe of the catalogue, and the catalogue has the 28 that the index counts', () => {
  const scriptable = scriptableProbes(catalogue).map((probe) => probe.id)
  assert.equal(scriptable.length, 28)
  for (const id of Object.keys(AUTOMATED)) assert.ok(scriptable.includes(id), `${id} is a scriptable probe`)
  assert.deepEqual(scriptableProbes(join(catalogue, 'missing')), [])
})

test('a clean project has no finding; it lists the gaps of the catalogue when it has one, and says what it did not check', () => {
  const root = repo(CLEAN)
  const result = checkSecurity({ root, profile })
  assert.deepEqual(result.problems, [])
  assert.match(result.messages[0], /^Scanned 6 of 6 tracked files with 9 secret rules/)
  assert.match(result.messages.join('\n'), /Checked 1 workflow files/)
  assert.match(result.messages.join('\n'), /Checked the committed settings of claude-code/)
  assert.match(result.messages.join('\n'), /Not run: the dependency audit \(S2-010\)/)
  assert.match(result.messages.at(-1), /^Not listed: the gaps/)
})

test('the project that is the framework itself lists the scriptable probes without a check as the gaps', () => {
  const result = checkSecurity({ root: home, profile })
  assert.match(
    result.messages.at(-1),
    /^\d+ scriptable probes have no check yet, the gaps for the next security review: S1-007/
  )
  assert.ok(!result.messages.at(-1).includes('S1-001'))
})

test('a defect planted in each area is reported under the id of its probe', () => {
  const planted = `${'AKIA'}${'IOSFODNN7EXAMPLE'}`
  const root = repo({
    ...CLEAN,
    '.env': 'A=1\n',
    'config/app.txt': planted,
    'bin/tool': Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0]),
    'tools/package.json': JSON.stringify({ dependencies: { left: '*' } }),
    '.github/workflows/bad.yml':
      'on: push\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo ${{ github.head_ref }}\n',
    '.claude/settings.json': JSON.stringify({
      permissions: { defaultMode: 'bypassPermissions', allow: ['Edit(**)'], deny: [] }
    })
  })
  const result = checkSecurity({ root, profile })
  const found = new Set(probesOf(result))
  for (const id of [
    'S1-001',
    'S1-002',
    'S1-015',
    'S2-001',
    'S2-003',
    'S2-004',
    'S2-016',
    'S3-001',
    'S3-005',
    'S4-001',
    'S4-002'
  ]) {
    assert.ok(found.has(id), `${id} is reported: ${[...found]}`)
  }
  assert.ok(result.problems.every((problem) => /^S\d-\d{3} /.test(problem)))
  assert.ok(!result.problems.join('\n').includes('IOSFODNN7'), 'a value is never printed')
})

test('--range scans the history of a push, and --audit runs the audit through the seam', () => {
  const root = repo(CLEAN)
  git(root, 'commit', '-q', '-m', 'base')
  const ran = []
  const result = checkSecurity({
    root,
    profile,
    range: 'HEAD..HEAD',
    audit: true,
    run: (command) => (ran.push(command), { status: 1, stdout: '3 vulnerabilities' })
  }).problems
  assert.deepEqual(ran, ['npm audit --audit-level=high'])
  assert.match(result[0], /^S2-010 `npm audit/)
  assert.match(
    checkSecurity({ root, profile, range: 'HEAD..HEAD', audit: true, run: () => ({ status: 0 }) }).messages.join('\n'),
    /Scanned the lines added by 0 commits of HEAD\.\.HEAD for secrets[\s\S]*Ran the dependency audit: npm audit/
  )
})

test('a project whose host or runtime fills none of the roles says what it did not check, and is not reported as clean for it', () => {
  const root = repo(CLEAN)
  const bare = { ...profile, adapters: { stacks: [], runtimes: [], host: 'nowhere' } }
  const result = checkSecurity({ root, profile: bare, audit: true })
  const text = result.messages.join('\n')
  assert.match(text, /Not checked: the workflow files .* "nowhere"/)
  assert.match(text, /Not checked: the settings of the agent runtime/)
  assert.match(text, /no stack fills the role "dependency-audit"/)
})

test('the check is registered as `security`, and a failure of it becomes a problem', () => {
  const root = repo(CLEAN)
  assert.deepEqual(runCheck('security', { root, profile }).problems, [])
  assert.equal(runCheck('security', { root: join(root, 'nowhere'), profile }).problems.length, 1)
})
