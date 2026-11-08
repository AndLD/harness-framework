import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { coreRules, declarations, GIT_HOOK_RULES, renderRuleMap, SECURITY_RULES } from './rule-map.mjs'
import { AUTOMATED } from './security.mjs'

const profile = (protection) => ({
  adapters: { stacks: ['node-ts'], runtimes: ['claude-code'], host: 'github' },
  host: { protection },
  documents: { method: 'm.md', ruleChecks: 'rules.md' }
})
const row = (table, id) => table.split('\n').find((line) => line.startsWith(`| \`${id}\``))

test('every rule of the entry file has a row, with its text', () => {
  const rules = coreRules()
  assert.ok(rules.length >= 26)
  assert.ok(rules.some(({ id, text }) => id === 'git.protection' && /protected: no direct pushes/.test(text)))
  const table = renderRuleMap(profile(true))
  for (const { id } of rules) {
    assert.ok(row(table, id), id)
  }
})

test('with a host that protects its branches the protection rules are held early, locally and remotely', () => {
  const table = renderRuleMap(profile(true))
  const protection = row(table, 'git.protection')
  assert.match(protection, /guard-shell. refuses a push to a protected branch/)
  assert.match(protection, /pre-push. refuses a push to a protected branch/)
  assert.match(protection, /repository ruleset of `harness host protect`/)
  assert.match(protection, /\| enforced \|$/)
  assert.match(row(table, 'git.admin-bypass'), /administrators bypass only when merging/)
  assert.match(table, /The host enforces the protection rules with the ruleset/)
})

test('with a host that cannot protect them the host is no holder, the merge guard of the runtime is, and the bypass rule has no mechanism', () => {
  const table = renderRuleMap(profile(false))
  assert.doesNotMatch(row(table, 'git.protection'), /ruleset/)
  assert.match(row(table, 'git.green-checks'), /merge guard of the shell hook refuses `gh pr merge`/)
  assert.doesNotMatch(row(table, 'git.green-checks'), /requires the checks/)
  assert.match(row(table, 'git.admin-bypass'), /\| – \| – \| – \| judgment \|$/)
  assert.match(table, /The host cannot protect its branches here/)
})

test('a rule that nothing declares is judgment', () => {
  const table = renderRuleMap(profile(true))
  assert.match(row(table, 'agent.claim'), /\| – \| – \| – \| judgment \|$/)
  assert.match(row(table, 'nn.coverage'), /pre-push gate holds the changed files/)
})

test('a rule held only in part is "partly", not "enforced"', () => {
  const table = renderRuleMap(profile(true))
  assert.match(
    row(table, 'nn.secrets'),
    /`harness check security` scans the committed content for a secret.*\| partly \|$/
  )
  assert.match(row(table, 'nn.tests'), /\| enforced \|$/)
})

test('every security rule has its row, and the probes it names are in the catalogue', () => {
  const folder = join(import.meta.dirname, '../../core/reviews/security/probes')
  const catalogue = readdirSync(folder)
    .map((file) => readFileSync(join(folder, file), 'utf8'))
    .join('\n')
  const rules = coreRules().filter(({ id }) => id.startsWith('sec.'))
  assert.equal(rules.length, 3)
  assert.deepEqual(rules.map(({ id }) => id).sort(), SECURITY_RULES.map(({ rule }) => rule).sort())
  const table = renderRuleMap(profile(true))
  for (const { rule, probes } of SECURITY_RULES) {
    assert.ok(probes.length > 0, rule)
    for (const probe of probes) {
      assert.match(catalogue, new RegExp(`^### ${probe} `, 'm'), probe)
      assert.match(row(table, rule), new RegExp(probe), rule)
    }
  }
})

test('a probe holds nothing at the moment of the action: alone it leaves the rule judgment, and a check beside it counts', () => {
  const table = renderRuleMap(profile(true))
  assert.match(
    row(table, 'sec.outside-text'),
    /\| – \| – \| – \| probes S4-007 and S4-021 of the security review \| judgment \|$/
  )
  assert.match(
    row(table, 'sec.pinned-actions'),
    /`harness check security`.*\| probe S2-004 of the security review \| partly \|$/
  )
  assert.ok(AUTOMATED['S2-004'])
})

test('a project without the runtime or the stack gets only what the framework and the host hold', () => {
  const found = declarations({
    adapters: { stacks: ['node-ts'], runtimes: [], host: 'github' },
    host: { protection: true }
  })
  assert.ok(!found.some(({ by }) => /guard-shell/.test(by)))
  assert.ok(GIT_HOOK_RULES.every((rule) => found.includes(rule)))
})
