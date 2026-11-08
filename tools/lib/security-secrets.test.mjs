import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { loadProfile } from './profile.mjs'
import { git, repo, removeRepos } from './test-repo.mjs'
import {
  checkSecretFiles,
  matchesAny,
  readText,
  scanRange,
  scanText,
  scanTracked,
  secretRules,
  trackedFiles
} from './security-secrets.mjs'

// The planted values are built here from pieces, so that this file itself holds nothing that the scan would report
const PLANTED = {
  'aws-access-key-id': `key = "${'AKIA'}${'IOSFODNN7EXAMPLE'}"`,
  'private-key': `-----BEGIN ${'RSA PRIVATE KEY'}-----`,
  'github-token': `token ${'ghp_'}${'a1B2'.repeat(9)}`,
  'slack-token': `${'xoxb'}-${'1234567890'}-abcdefghij`,
  'api-key-sk': `${'sk'}-${'abcdefghijklmnopqrstuvwxyz012345'}`,
  'google-api-key': `${'AIza'}${'SyA-1234567890abcdefghijklmnopqrstu'}`,
  'payment-live-key': `${'sk_live'}_${'abcdefghijklmnop1234'}`,
  'url-with-password': `postgres://app:${'S3cretValue'}@db.internal/main`
}
const profile = loadProfile(join(import.meta.dirname, '..', '..'))
const rules = secretRules(profile)
after(removeRepos)

const ids = (path, text) => scanText({ path, text, rules }).map((hit) => hit.id)

test('S1-001: every default rule reports its planted value, with the line, and a clean text reports nothing', () => {
  for (const [id, text] of Object.entries(PLANTED)) assert.deepEqual(ids('a.txt', `ok\n${text}\n`), [id], id)
  assert.deepEqual(scanText({ path: 'a.txt', text: `x\n${PLANTED['private-key']}`, rules }), [
    { line: 2, id: 'private-key' }
  ])
  assert.deepEqual(ids('a.md', 'No secrets here: https://example.com/path and user@example.com\nAKIA is a prefix'), [])
})

test('S1-010, S1-017: a literal value assigned to a name like password is reported in a configuration file only, and a reference or a placeholder is not', () => {
  const literal = `db_password: ${'hunter2hunter2'}`
  assert.deepEqual(ids('.github/workflows/w.yml', literal), ['literal-assignment'])
  assert.deepEqual(ids('.mcp.json', `{\n  "apiKey": "${'abcd1234efgh'}"\n}`), ['literal-assignment'])
  assert.deepEqual(ids('docs/guide.md', literal), [], 'prose in a document')
  assert.deepEqual(
    ids(
      'w.yml',
      'token: ${{ secrets.TOKEN }}\npassword: ${DB_PASSWORD}\nsecret: <your-secret-here>\napi_key: your-api-key-value\npassword: changeme123456\ntoken: ****************'
    ),
    []
  )
  assert.deepEqual(ids('w.yml', `${literal} # harness:allow-secret test value`), [], 'the allow mark')
})

test('a pattern of the profile is used with its flags, and one that is not an expression is named', () => {
  const own = { security: { secretPatterns: [{ id: 'ticket', pattern: 'internal-\\d+', flags: 'i' }] } }
  assert.deepEqual(scanText({ path: 'a', text: 'See INTERNAL-42', rules: secretRules(own) }), [
    { line: 1, id: 'ticket' }
  ])
  assert.throws(
    () => secretRules({ security: { secretPatterns: [{ id: 'bad', pattern: '(' }] } }),
    /"bad" is not a regular expression/
  )
  assert.deepEqual(secretRules({}), [])
})

test('globs: a name without a slash matches in any folder', () => {
  assert.equal(matchesAny('a/b/c.pem', ['*.pem']), true)
  assert.equal(matchesAny('a/b/c.pem', ['b/*.pem']), false)
  assert.equal(matchesAny('docs/x.md', ['docs/**']), true)
  assert.equal(matchesAny('x', undefined), false)
})

test('S1-001: the scan of the tracked files names the file and the line, never the value, and skips excluded, binary, large and untracked files', () => {
  const root = repo({
    'src/app.json': `{\n  "x": 1,\n  "note": "${PLANTED['aws-access-key-id']}"\n}\n`,
    'fixtures/planted.txt': PLANTED['github-token'],
    'logo.bin': Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(PLANTED['github-token'])]),
    'clean.md': 'nothing\n'
  })
  writeFileSync(join(root, 'untracked.txt'), PLANTED['github-token'])
  const result = scanTracked({
    root,
    profile: { ...profile, security: { ...profile.security, exclude: ['fixtures/**'] } }
  })
  assert.equal(result.read, 2)
  assert.equal(result.problems.length, 1)
  assert.match(result.problems[0].text, /^src\/app\.json:3: looks like a credential \(rule aws-access-key-id\)/)
  assert.ok(!result.problems[0].text.includes('IOSFODNN7'), 'the value is not printed')
  assert.equal(result.problems[0].probe, 'S1-001')
  assert.deepEqual(trackedFiles(root, profile).sort(), ['clean.md', 'fixtures/planted.txt', 'logo.bin', 'src/app.json'])
  assert.equal(readText(root, 'missing.txt'), null)
})

test('S1-001: the scan of a history range finds a value that a later commit removed, and a clean range finds nothing', () => {
  const root = repo({ 'a.txt': 'one\n' })
  git(root, 'commit', '-q', '-m', 'base')
  const base = git(root, 'rev-parse', 'HEAD').trim()
  writeFileSync(join(root, 'a.txt'), `one\ntwo\n${PLANTED['github-token']}\n`)
  writeFileSync(join(root, 'fixtures.txt'), PLANTED['slack-token'])
  git(root, 'add', '-A', '-f')
  git(root, 'commit', '-q', '-m', 'adds a secret')
  writeFileSync(join(root, 'a.txt'), 'one\ntwo\n')
  git(root, 'commit', '-q', '-am', 'removes it')
  const found = scanRange({ root, profile, range: `${base}..HEAD` })
  assert.equal(found.commits, 2)
  assert.deepEqual(
    found.problems.map((problem) => problem.text.replace(/^commit \w+ /, '').replace(/ the commit.*$/, '')),
    ['a.txt:3:', 'fixtures.txt:1:']
  )
  assert.match(
    found.problems[0].text,
    /^commit [0-9a-f]+ a\.txt:3: the commit adds what looks like a credential \(rule github-token\)/
  )
  assert.equal(
    scanRange({
      root,
      profile: { ...profile, security: { ...profile.security, exclude: ['fixtures.txt', 'a.txt'] } },
      range: `${base}..HEAD`
    }).problems.length,
    0
  )
  assert.equal(scanRange({ root, profile, range: 'HEAD..HEAD' }).problems.length, 0)
})

test('S1-002: a tracked file that access.denyRead names is reported, the example file is not, and the ignore file must list each pattern', () => {
  const root = repo({
    '.env': 'A=1\n',
    '.env.example': 'A=\n',
    'keys/server.pem': 'x',
    'src/app.key': 'y',
    'app.js': 'z',
    '.gitignore': '.env\n.env.*\n!.env.example\n'
  })
  const found = checkSecretFiles({ root, profile })
  assert.deepEqual(found.map((problem) => problem.text.split(':')[0]).sort(), [
    '.env',
    '.gitignore',
    '.gitignore',
    'keys/server.pem',
    'src/app.key'
  ])
  assert.match(
    found.find((problem) => problem.text.startsWith('.gitignore')).text,
    /does not list "\*\.(pem|key)" of access\.denyRead/
  )
  const listed = repo({ '.env.example': 'A=\n', '.gitignore': '.env\n.env.*\n!.env.example\n*.pem\n*.key\n' })
  assert.deepEqual(checkSecretFiles({ root: listed, profile }), [])
})
