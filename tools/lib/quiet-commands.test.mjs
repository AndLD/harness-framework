// The quiet variants of the commands (task 6.3): the defaults of the roles, and a procedure that cites them in a project with and without them.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QUIET_ROLES, quietRolesOf, withQuietDefaults } from './quiet-commands.mjs'
import { renderProcedure } from './procedures.mjs'

test('a quiet role not set is the plain command, a quiet role set stays, and the profile is not changed', () => {
  const profile = { commands: { lint: 'run lint', lintQuiet: 'run lint -q', test: 'run test' } }
  const filled = withQuietDefaults(profile)
  assert.equal(filled.commands.lintQuiet, 'run lint -q')
  assert.equal(filled.commands.testQuiet, 'run test')
  assert.equal(filled.commands.typecheckQuiet, undefined, 'no plain command, nothing to fall back to')
  assert.equal(profile.commands.testQuiet, undefined)
  assert.deepEqual(withQuietDefaults({}).commands, {})
})

test('the quiet roles of a stack are those whose plain command it gives', () => {
  assert.deepEqual(quietRolesOf({ lint: 'a', test: 'b' }), ['lintQuiet', 'testQuiet'])
  assert.deepEqual(quietRolesOf(), [])
  assert.equal(Object.keys(QUIET_ROLES).length, 5)
})

test('a procedure cites the quiet variant, which is the plain command in a project that has none', () => {
  const procedure = { name: 'p', body: 'Run `{{commands.lintQuiet}}` and `{{commands.testCoverageQuiet}}`.\n' }
  const quiet = renderProcedure(procedure, { commands: { lint: 'L', lintQuiet: 'Lq', testCoverage: 'T' } }, 'x.md')
  assert.equal(quiet, 'Run `Lq` and `T`.\n')
  assert.throws(() => renderProcedure(procedure, { commands: {} }, 'x.md'), /needs the profile roles/)
})

test('the node-ts preset gives the quiet defaults of a single package, including typecheck and format, and says the workspaces form', async () => {
  const { readFileSync } = await import('node:fs')
  const manifest = JSON.parse(
    readFileSync(new URL('../../adapters/stack/node-ts/manifest.json', import.meta.url), 'utf8')
  )
  const commands = manifest.defaults.commands
  assert.equal(commands.typecheckQuiet, 'npm run --silent typecheck')
  assert.equal(commands.formatQuiet, 'npm run --silent format -- --log-level warn')
  assert.equal(commands.testQuiet, 'npm test --silent -- --reporters=summary --silent')
  assert.match(
    manifest.roles['quiet-commands'].fills,
    /npm run --silent test --workspaces --if-present -- --reporters=summary --silent/
  )
})
