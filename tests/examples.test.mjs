// The examples (design §2, task 1.4) are held to the checks of the framework, so that a sample never drifts from what the tools accept: the filled profile
// passes the profile check, the product specification the product-knowledge check, and the sample plan the plan check, with the summary of its index current.
import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { checkProductKnowledge } from '../tools/lib/product-knowledge.mjs'
import { planSummary } from '../tools/lib/plan.mjs'
import { checkProfile, PROFILE_FILE } from '../tools/lib/profile.mjs'

const EXAMPLES = join(import.meta.dirname, '..', 'examples')
const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))
const profile = JSON.parse(readFileSync(join(EXAMPLES, 'profile', PROFILE_FILE), 'utf8'))

// A project root with the example profile, and the example folders where the profile says they live
function project() {
  const root = mkdtempSync(join(tmpdir(), 'examples-'))
  dirs.push(root)
  writeFileSync(join(root, PROFILE_FILE), readFileSync(join(EXAMPLES, 'profile', PROFILE_FILE)))
  mkdirSync(join(root, 'docs'), { recursive: true })
  cpSync(join(EXAMPLES, 'product'), join(root, profile.productKnowledge.root), { recursive: true })
  cpSync(join(EXAMPLES, 'plan'), join(root, profile.paths.plan), { recursive: true })
  return root
}

test('the filled profile passes the profile check, and names the stack, the runtime and the host of the framework', () => {
  const root = project()
  assert.deepEqual(checkProfile(root), [])
  assert.deepEqual(profile.adapters.stacks, [{ adapter: 'node-ts', packages: ['api', 'web'] }])
  assert.equal(profile.adapters.host, 'github')
})

test('the product specification passes the product-knowledge check: the glossary, the register of open items and the scan', () => {
  const { problems, messages } = checkProductKnowledge({ root: project(), profile })
  assert.deepEqual(problems, [])
  assert.equal(messages.length, 3)
})

test('the sample plan passes the plan check, and the summary and the contents of its index are current', () => {
  const root = project()
  const { problems } = planSummary({ root, profile, check: true })
  assert.deepEqual(problems, [])
  assert.match(
    readFileSync(join(root, profile.paths.planIndex), 'utf8'),
    /\| 1 \| Write and edit notes \| 8 \| C2 \| 🟡 In progress \|/
  )
})
